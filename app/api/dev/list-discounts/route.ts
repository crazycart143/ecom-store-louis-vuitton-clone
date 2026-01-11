import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db();
        const discounts = await db.collection("Discount").find({}).toArray();
        return NextResponse.json(discounts);
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
