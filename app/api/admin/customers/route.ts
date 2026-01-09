import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();

        // Fetch users and their order counts/spend
        const customers = await db.collection("User").aggregate([
            {
                $lookup: {
                    from: "Order",
                    localField: "email",
                    foreignField: "email",
                    as: "orders"
                }
            },
            {
                $project: {
                    id: { $toString: "$_id" },
                    name: 1,
                    email: 1,
                    role: 1,
                    createdAt: 1,
                    ordersCount: { $size: "$orders" },
                    totalSpent: { $sum: "$orders.total" },
                    lastOrder: { $max: "$orders.createdAt" }
                }
            },
            { $sort: { totalSpent: -1 } }
        ]).toArray();

        return NextResponse.json(customers);
    } catch (error: any) {
        console.error("Fetch customers error:", error);
        return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
    }
}
