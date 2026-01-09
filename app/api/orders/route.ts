import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const role = session.user.role;

        const client = await clientPromise;
        const db = client.db();

        let match: any = {};
        if (role !== "ADMIN") {
            match = { userId: userId };
        }

        const orders = await db.collection("Order").aggregate([
            { $match: match },
            {
                $lookup: {
                    from: "OrderItem",
                    localField: "_id",
                    foreignField: "orderId",
                    as: "items"
                }
            },
            { $sort: { createdAt: -1 } }
        ]).toArray();

        // Format for frontend
        const formattedOrders = orders.map(o => ({
            ...o,
            id: o._id.toString(),
            items: o.items.map((item: any) => ({ ...item, id: item._id.toString() }))
        }));

        return NextResponse.json(formattedOrders);
    } catch (error: any) {
        console.error("Fetch orders error:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}
