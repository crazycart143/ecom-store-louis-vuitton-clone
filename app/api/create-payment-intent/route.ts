import Stripe from "stripe";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
    try {
        const { items, email, userId, shippingDetails } = await req.json();

        // Calculate total amount
        const amount = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);

        const origin = req.headers.get("origin");
        const baseUrl = process.env.NEXTAUTH_URL || origin || "http://localhost:3000";

        // 1. Prepare Metadata
        const metadata = {
            userId: userId || "",
            email: email || "",
            shippingDetails: JSON.stringify(shippingDetails),
            orderItems: JSON.stringify(items.map((i: any) => {
                // Reconstruct image path for metadata
                const productImage = i.image || i.images?.[0]?.url;
                let absoluteImage = i.image;
                if (productImage && !productImage.startsWith("http")) {
                    absoluteImage = `${baseUrl}${productImage.startsWith("/") ? "" : "/"}${productImage}`;
                }
                return {
                    productId: i.id,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                    image: absoluteImage
                };
            }))
        };

        const client = await clientPromise;
        const db = client.db();
        let customerId = null;

        if (userId) {
            const user = await db.collection("User").findOne({ _id: new ObjectId(userId) });
            if (user) {
                customerId = user.stripeCustomerId;

                if (!customerId) {
                    const customer = await stripe.customers.create({
                        email: user.email,
                        name: user.name,
                    });
                    customerId = customer.id;
                    await db.collection("User").updateOne(
                        { _id: new ObjectId(userId) },
                        { $set: { stripeCustomerId: customerId } }
                    );
                }
            }
        }

        // Create Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: "usd",
            customer: customerId || undefined,
            receipt_email: email || undefined,
            metadata,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error: any) {
        console.error("Stripe PaymentIntent error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
