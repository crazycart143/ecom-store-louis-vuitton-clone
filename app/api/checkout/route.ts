import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
    try {
        const { items, email, userId } = await req.json();

        const origin = req.headers.get("origin");
        const baseUrl = process.env.NEXTAUTH_URL || origin || "http://localhost:3000";

        const line_items = items.map((item: any) => {
            const productImage = item.image || item.images?.[0]?.url;
            let absoluteImage = null;

            if (productImage) {
                const isAbsolute = productImage.startsWith("http");
                const path = isAbsolute ? productImage : `${baseUrl}${productImage.startsWith("/") ? "" : "/"}${productImage}`;
                // Encode the URI to handle spaces and special characters
                // Stripe requires absolute URLs and fails on unencoded spaces
                absoluteImage = encodeURI(path);

                // Stripe only supports JPEG, PNG, GIF. Avoid sending AVIF or WEBP if possible.
                // If it's AVIF, we might want to skip it to avoid Stripe errors.
                if (absoluteImage.toLowerCase().endsWith(".avif")) {
                    absoluteImage = null; // Stripe doesn't support AVIF
                }
            }

            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.name,
                        images: absoluteImage ? [absoluteImage] : [],
                    },
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: item.quantity,
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items,
            mode: "payment",
            success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/checkout`,
            customer_email: email,
            metadata: {
                userId: userId || "",
                orderItems: JSON.stringify(items.map((i: any) => ({
                    productId: i.id,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                    image: i.image
                })))
            },
        });

        return NextResponse.json({ id: session.id, url: session.url });
    } catch (error: any) {
        console.error("Stripe error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
