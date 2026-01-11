import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "OWNER") {
        return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        const discounts = await db.collection("Discount").find({}).toArray();
        return NextResponse.json(discounts);
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
