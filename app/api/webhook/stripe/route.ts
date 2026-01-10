import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { sendOrderConfirmationEmail } from "@/lib/mail";
import { NotificationHelpers } from "@/lib/notifications";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-01-27-02" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error: any) {
        return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`[Webhook] Processing session ${session.id} for user ${session.metadata?.userId}`);

        const userId = session.metadata?.userId;
        const orderItems = JSON.parse(session.metadata?.orderItems || "[]");

        const client = await clientPromise;
        const db = client.db();


        try {
            // Extract and sanitize address with fallback logic
            const shippingDetails = (session as any).shipping_details;
            const billingDetails = session.customer_details;

            console.log("[Webhook] Full shipping_details:", JSON.stringify(shippingDetails, null, 2));
            console.log("[Webhook] Full customer_details:", JSON.stringify(billingDetails, null, 2));

            const shippingAddress = shippingDetails?.address;
            const billingAddress = billingDetails?.address;
            const customerName = shippingDetails?.name || billingDetails?.name || "Customer";

            console.log("[Webhook] Extracted shipping address:", JSON.stringify(shippingAddress));
            console.log("[Webhook] Extracted billing address:", JSON.stringify(billingAddress));
            console.log("[Webhook] Customer name:", customerName);

            // Prefer shipping address if it has at least line1, otherwise try billing
            const finalAddress = (shippingAddress && shippingAddress.line1)
                ? shippingAddress
                : (billingAddress && billingAddress.line1)
                    ? billingAddress
                    : shippingAddress || billingAddress;

            let addressString = "Address not provided";
            let dbAddress = null;

            if (finalAddress) {
                const line1 = finalAddress.line1;
                const line2 = finalAddress.line2;
                const city = finalAddress.city;
                const state = finalAddress.state;
                const postal_code = finalAddress.postal_code;
                const country = finalAddress.country;

                const cityStateZip = [city, state, postal_code].filter(Boolean).join(", ");

                addressString = [line1, line2, cityStateZip, country]
                    .filter(part => part && part.trim() !== "")
                    .join("\n");

                dbAddress = {
                    name: customerName,
                    line1,
                    line2,
                    city,
                    state,
                    postal_code,
                    country
                };

                console.log("[Webhook] Final dbAddress to save:", JSON.stringify(dbAddress, null, 2));
            } else {
                console.warn("[Webhook] ⚠️ No valid address found in session!");
            }

            const orderResult = await db.collection("Order").insertOne({
                userId: userId || null,
                email: session.customer_details?.email || "",
                total: (session.amount_total || 0) / 100,
                status: "PAID",
                shippingAddress: dbAddress,
                fulfillment: "UNFULFILLED",
                createdAt: new Date()
            });

            const orderId = orderResult.insertedId;
            console.log(`[Webhook] Order created: ${orderId}`);

            if (orderItems.length > 0) {
                await db.collection("OrderItem").insertMany(
                    orderItems.map((item: any) => ({
                        orderId,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        image: item.image,
                        productId: item.productId ? new ObjectId(item.productId) : null,
                    }))
                );
                console.log(`[Webhook] Inserted ${orderItems.length} items`);
            }

            // 4. Send Confirmation Email
            // Using addressString already defined above which handles nulls gracefully

            const orderDate = new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            await sendOrderConfirmationEmail(
                session.customer_details?.email || "",
                session.customer_details?.name || "Valued Client",
                orderId.toString(),
                (session.amount_total || 0) / 100,
                orderItems,
                addressString,
                orderDate
            );

            // 5. Create Admin Notifications
            const orderTotal = (session.amount_total || 0) / 100;
            const customerEmail = session.customer_details?.email || "Unknown";

            // Always create new order notification
            await NotificationHelpers.newOrder(
                orderId.toString(),
                customerEmail,
                orderTotal
            );

            // Create high-value order notification if > $2000
            if (orderTotal > 2000) {
                await NotificationHelpers.highValueOrder(
                    orderId.toString(),
                    customerEmail,
                    orderTotal
                );
            }
        } catch (dbError) {
            console.error("[Webhook] Database error:", dbError);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
