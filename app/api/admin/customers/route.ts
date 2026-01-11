import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !["OWNER", "ADMIN", "MANAGER"].includes(session.user.role)) {
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
                    lastOrder: { $max: "$orders.createdAt" },
                    lastActive: 1, // New field from User collection
                    // Get location from the latest order if available
                    latestOrder: {
                        $arrayElemAt: [
                            { $sortArray: { input: "$orders", sortBy: { createdAt: -1 } } },
                            0
                        ]
                    }
                }
            },
            {
                $project: {
                    id: 1,
                    name: 1,
                    email: 1,
                    role: 1,
                    createdAt: 1,
                    ordersCount: 1,
                    totalSpent: 1,
                    lastActive: { $ifNull: ["$lastActive", { $ifNull: ["$lastOrder", "$createdAt"] }] },
                    location: {
                        $let: {
                            vars: {
                                shipping: "$latestOrder.shippingAddress"
                            },
                            in: {
                                $cond: [
                                    { $and: [{ $gt: ["$$shipping.city", null] }, { $gt: ["$$shipping.country", null] }] },
                                    { $concat: ["$$shipping.city", ", ", "$$shipping.country"] },
                                    { $cond: [{ $gt: ["$$shipping.country", null] }, "$$shipping.country", "Unknown"] }
                                ]
                            }
                        }
                    }
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

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !["OWNER", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        const { userId, role } = await req.json();
        const { ObjectId } = await import("mongodb");

        if (!["USER", "ADMIN", "MANAGER", "STAFF", "OWNER"].includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        const targetUser = await db.collection("User").findOne({ _id: new ObjectId(userId) });
        if (!targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        await db.collection("User").updateOne(
            { _id: new ObjectId(userId) },
            { $set: { role, updatedAt: new Date() } }
        );

        // Log the role change
        await db.collection("AuditLog").insertOne({
            type: "SECURITY",
            action: `ROLE_CHANGE_${role}`,
            adminId: session.user.id,
            adminName: session.user.name,
            targetId: userId,
            targetName: targetUser.name,
            details: `Changed role from ${targetUser.role} to ${role}`,
            timestamp: new Date(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update role:", error);
        return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
    }
}
