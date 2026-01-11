import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id: orderId } = await params;

        if (!session || !["OWNER", "ADMIN", "MANAGER", "STAFF"].includes(session.user.role as string)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db();

        // Update order fulfillment status
        const result = await db.collection("Order").updateOne(
            { _id: new ObjectId(orderId) },
            {
                $set: {
                    fulfillment: "DELIVERED",
                    fulfilledAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Audit Log
        await db.collection("AuditLog").insertOne({
            type: "ORDER",
            action: "FULFILLED_ORDER",
            adminId: session.user.id,
            adminName: session.user.name,
            targetId: orderId,
            targetName: `Order ${orderId.slice(-6).toUpperCase()}`,
            timestamp: new Date(),
        }).catch(err => console.error("Audit log failed:", err));

        return NextResponse.json({
            success: true,
            message: "Order fulfilled successfully",
        });
    } catch (error: any) {
        console.error("Fulfill order error:", error);
        return NextResponse.json(
            { error: "Failed to fulfill order" },
            { status: 500 }
        );
    }
}
