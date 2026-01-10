import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection("User").findOne({ _id: new ObjectId(session.user.id) });

    if (!user || !user.stripeCustomerId) {
        return NextResponse.json([]);
    }

    try {
        const paymentMethods = await stripe.paymentMethods.list({
            customer: user.stripeCustomerId,
            type: "card",
        });

        const formattedMethods = paymentMethods.data.map((pm) => ({
            id: pm.id,
            brand: pm.card?.brand,
            last4: pm.card?.last4,
            exp_month: pm.card?.exp_month,
            exp_year: pm.card?.exp_year,
        }));

        return NextResponse.json(formattedMethods);
    } catch (error) {
        console.error("Stripe list error:", error);
        return NextResponse.json({ error: "Failed to fetch payment methods" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await req.json(); // "create_setup_intent"

    const client = await clientPromise;
    const db = client.db();
    let user = await db.collection("User").findOne({ _id: new ObjectId(session.user.id) });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Ensure Stripe Customer exists
    let customerId = user.stripeCustomerId;
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: user.email,
            name: user.name,
            metadata: {
                userId: user._id.toString(),
            },
        });
        customerId = customer.id;

        await db.collection("User").updateOne(
            { _id: user._id },
            { $set: { stripeCustomerId: customerId } }
        );
    }

    if (action === "create_setup_intent") {
        try {
            const setupIntent = await stripe.setupIntents.create({
                customer: customerId,
                payment_method_types: ['card'],
            });

            return NextResponse.json({ clientSecret: setupIntent.client_secret });
        } catch (error) {
            console.error("SetupIntent error:", error);
            return NextResponse.json({ error: "Failed to create setup intent" }, { status: 500 });
        }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
