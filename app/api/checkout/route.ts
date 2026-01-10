import Stripe from "stripe";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
    try {
        const { items, email, userId, shippingDetails } = await req.json();

        const origin = req.headers.get("origin");
        const baseUrl = process.env.NEXTAUTH_URL || origin || "http://localhost:3000";

        const line_items = items.map((item: any) => {
            const productImage = item.image || item.images?.[0]?.url;
            let absoluteImage = null;

            if (productImage) {
                const isAbsolute = productImage.startsWith("http");
                const path = isAbsolute ? productImage : `${baseUrl}${productImage.startsWith("/") ? "" : "/"}${productImage}`;
                absoluteImage = encodeURI(path);

                if (absoluteImage.toLowerCase().endsWith(".avif")) {
                    absoluteImage = null;
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

        // 1. Prepare Shipping Info
        // Helper to normalize country to ISO-2
        const normalizeCountry = (c: string) => {
            if (!c) return "US";
            const lower = c.toLowerCase().trim();
            if (lower === "philippines" || lower === "ph") return "PH";
            if (lower === "united states" || lower === "usa" || lower === "us") return "US";
            return c.length === 2 ? c.toUpperCase() : "US";
        };

        let shippingInfo: any = undefined;

        if (shippingDetails) {
            // Use the address passed from frontend (Selected or Typed)
            shippingInfo = {
                name: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
                address: {
                    line1: shippingDetails.address,
                    city: shippingDetails.city,
                    state: shippingDetails.state,
                    postal_code: shippingDetails.zipCode,
                    country: normalizeCountry(shippingDetails.country),
                }
            };
        }

        const client = await clientPromise;
        const db = client.db();
        let customerId = null;
        let customerEmail = email;

        if (userId) {
            const user = await db.collection("User").findOne({ _id: new ObjectId(userId) });

            if (user) {
                customerId = user.stripeCustomerId;

                // Fallback to Default Address if no shippingDetails passed
                if (!shippingInfo) {
                    const defaultAddress = user.addresses?.find((a: any) => a.isDefault) || user.addresses?.[0];
                    if (defaultAddress) {
                        shippingInfo = {
                            name: user.name,
                            address: {
                                line1: defaultAddress.line1,
                                line2: defaultAddress.line2 || "",
                                city: defaultAddress.city,
                                state: defaultAddress.state,
                                postal_code: defaultAddress.postal_code,
                                country: normalizeCountry(defaultAddress.country),
                            }
                        };
                    }
                }

                // Create or Update Stripe Customer
                if (!customerId) {
                    const customerData: Stripe.CustomerCreateParams = {
                        email: user.email,
                        name: user.name,
                    };
                    if (shippingInfo) customerData.shipping = shippingInfo;

                    const customer = await stripe.customers.create(customerData);
                    customerId = customer.id;

                    await db.collection("User").updateOne(
                        { _id: new ObjectId(userId) },
                        { $set: { stripeCustomerId: customerId } }
                    );
                } else if (shippingInfo) {
                    // Update existing customer with address to ensure pre-fill works
                    try {
                        await stripe.customers.update(customerId, { shipping: shippingInfo });
                    } catch (e) {
                        console.error("Error updating stripe customer address:", e);
                    }
                }
            }
        }

        // 2. Configure Session
        const sessionConfig: Stripe.Checkout.SessionCreateParams = {
            payment_method_types: ["card"],
            line_items,
            mode: "payment",
            shipping_address_collection: {
                allowed_countries: ["US", "CA", "GB", "FR", "DE", "IT", "ES", "AU", "JP", "SG", "PH"],
            },
            phone_number_collection: {
                enabled: true,
            },
            success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/checkout`,
            metadata: {
                userId: userId || "",
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
            },
        };

        // 3. Attach Customer to Session (This enables the pre-fill)
        if (customerId) {
            sessionConfig.customer = customerId;
            sessionConfig.customer_update = {
                shipping: "auto"
            };
        } else {
            sessionConfig.customer_email = customerEmail;
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        return NextResponse.json({ id: session.id, url: session.url });
    } catch (error: any) {
        console.error("Stripe error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
