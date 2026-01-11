import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db();

        // Update all products that don't have stock or have stock = 0
        const result = await db.collection("Product").updateMany(
            { $or: [{ stock: { $exists: false } }, { stock: 0 }] },
            { $set: { stock: 20 } }
        );

        return NextResponse.json({
            message: "Stock updated successfully",
            modifiedCount: result.modifiedCount
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
