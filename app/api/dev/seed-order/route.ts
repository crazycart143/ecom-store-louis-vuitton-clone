import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db();

        // 1. Get a product to order
        const product = await db.collection("Product").findOne({});
        if (!product) return NextResponse.json({ error: "No products found" });

        const session = await getServerSession(authOptions);
        const userEmail = session?.user?.email || "client@test.com";
        const userId = session?.user?.id || null;

        // 2. Create Order
        const orderResult = await db.collection("Order").insertOne({
            userId: userId,
            email: userEmail,
            total: product.price,
            status: "PAID",
            createdAt: new Date()
        });

        // 3. Create Order Items
        await db.collection("OrderItem").insertOne({
            orderId: orderResult.insertedId,
            name: product.name,
            price: product.price,
            quantity: 1,
            productId: product._id
        });

        return NextResponse.json({ message: "Order seeded", id: orderResult.insertedId });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
