import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

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
            const orderResult = await db.collection("Order").insertOne({
                userId: userId || null,
                email: session.customer_details?.email || "",
                total: (session.amount_total || 0) / 100,
                status: "PAID",
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
        } catch (dbError) {
            console.error("[Webhook] Database error:", dbError);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
