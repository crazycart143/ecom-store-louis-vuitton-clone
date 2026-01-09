import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db();
        // Assume single document for store settings
        const settings = await db.collection("StoreSettings").findOne({});
        return NextResponse.json(settings || {
            storeName: "Louis Vuitton Clone",
            supportEmail: "support@louisvuitton.com",
            currency: "USD",
            taxRate: 0.08
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        const body = await req.json();

        await db.collection("StoreSettings").updateOne(
            {},
            { $set: { ...body, updatedAt: new Date() } },
            { upsert: true }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
    }
}
