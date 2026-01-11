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

    if (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded") {
        const isSession = event.type === "checkout.session.completed";
        const session = isSession ? (event.data.object as Stripe.Checkout.Session) : null;
        const paymentIntent = !isSession ? (event.data.object as Stripe.PaymentIntent) : null;

        const metadata = isSession ? session?.metadata : paymentIntent?.metadata;
        const userId = metadata?.userId;
        const orderItems = JSON.parse(metadata?.orderItems || "[]");
        const customerEmail = isSession ? session?.customer_details?.email : (paymentIntent?.receipt_email || metadata?.email);
        const amountTotal = isSession ? session?.amount_total : paymentIntent?.amount;

        console.log(`[Webhook] Processing ${event.type}: ${isSession ? session?.id : paymentIntent?.id} for user ${userId}`);
        console.log(`[Webhook] Metadata:`, JSON.stringify(metadata, null, 2));

        const client = await clientPromise;
        const db = client.db();

        try {
            // Extract shipping details
            const stripeShipping = isSession ? (session as any)?.shipping_details : (paymentIntent as any)?.shipping;
            const customerName = stripeShipping?.name || (isSession ? session?.customer_details?.name : null) || "Customer";
            const stripeAddress = stripeShipping?.address || (isSession ? session?.customer_details?.address : null);

            let dbAddress = null;
            let addressString = "Address not provided";

            if (stripeAddress && stripeAddress.line1) {
                dbAddress = {
                    name: customerName,
                    line1: stripeAddress.line1,
                    line2: stripeAddress.line2 || "",
                    city: stripeAddress.city,
                    state: stripeAddress.state,
                    postal_code: stripeAddress.postal_code,
                    country: stripeAddress.country
                };

                const cityStateZip = [stripeAddress.city, stripeAddress.state, stripeAddress.postal_code].filter(Boolean).join(", ");
                addressString = [stripeAddress.line1, stripeAddress.line2, cityStateZip, stripeAddress.country]
                    .filter(part => part && part.toString().trim() !== "")
                    .join("\n");
            } else if (metadata?.shippingDetails) {
                // Fallback to metadata if stripe shipping is missing (sometimes happens with manual PI)
                const sd = JSON.parse(metadata.shippingDetails);
                dbAddress = {
                    name: `${sd.firstName} ${sd.lastName}`,
                    line1: sd.address,
                    city: sd.city,
                    state: sd.state,
                    postal_code: sd.zipCode,
                    country: sd.country === "United States" ? "US" : sd.country
                };
                addressString = `${sd.address}\n${sd.city}, ${sd.state} ${sd.zipCode}\n${sd.country}`;
            }

            if (metadata?.discountCode) {
                await db.collection("Discount").updateOne(
                    { code: metadata.discountCode },
                    { $inc: { usedCount: 1 } }
                );
            }

            const paidAmount = (amountTotal || 0) / 100;
            const originalAmount = metadata?.originalAmount ? parseFloat(metadata.originalAmount) : paidAmount;

            const orderResult = await db.collection("Order").insertOne({
                userId: (userId && ObjectId.isValid(userId)) ? new ObjectId(userId) : null,
                email: customerEmail || "",
                total: paidAmount,
                subtotal: originalAmount, // Store the original pre-discount subtotal
                discountCode: metadata?.discountCode || null,
                discountAmount: Math.max(0, originalAmount - paidAmount),
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
                        productId: (item.productId && ObjectId.isValid(item.productId)) ? new ObjectId(item.productId) : null,
                    }))
                );
                console.log(`[Webhook] Inserted ${orderItems.length} items`);

                // Decrement stock for each product
                for (const item of orderItems) {
                    if (item.productId && ObjectId.isValid(item.productId)) {
                        await db.collection("Product").updateOne(
                            { _id: new ObjectId(item.productId) },
                            { $inc: { stock: -item.quantity } }
                        );
                        console.log(`[Webhook] Decremented stock for ${item.productId} by ${item.quantity}`);
                    }
                }
            }

            // Send Confirmation Email
            const orderDate = new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            await sendOrderConfirmationEmail(
                customerEmail || "",
                customerName,
                orderId.toString(),
                (amountTotal || 0) / 100,
                orderItems,
                addressString,
                orderDate,
                originalAmount,
                Math.max(0, originalAmount - paidAmount)
            );

            // Create Admin Notifications
            const orderTotal = (amountTotal || 0) / 100;
            await NotificationHelpers.newOrder(
                orderId.toString(),
                customerEmail || "Unknown",
                orderTotal
            );

            if (orderTotal > 2000) {
                await NotificationHelpers.highValueOrder(
                    orderId.toString(),
                    customerEmail || "Unknown",
                    orderTotal
                );
            }

        } catch (dbError) {
            console.error("[Webhook] Database/Processing error:", dbError);
            // We still return 200 to acknowledge Stripe, but log the error
            // Or return 500 if we want Stripe to retry
            return NextResponse.json({ error: "Processing error" }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
