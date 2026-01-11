import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !["OWNER", "ADMIN"].includes(session.user.role as string)) {
        return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

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
