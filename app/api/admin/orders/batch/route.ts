import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);

    // Authorization check
    if (!session || !["ADMIN", "MANAGER", "STAFF"].includes(session.user.role as string)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { orderIds, action } = body;

        if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return NextResponse.json({ error: "No orders selected" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const objectIds = orderIds.map(id => new ObjectId(id));
        let updateData: any = {};
        let auditAction = "";

        if (action === "fulfill") {
            updateData = { fulfillment: "FULFILLED" };
            auditAction = "BATCH_FULFILLED";
        } else if (action === "unfulfill") {
            updateData = { fulfillment: "UNFULFILLED" };
            auditAction = "BATCH_UNFULFILLED";
        } else if (action === "cancel") {
            updateData = { status: "CANCELLED" };
            auditAction = "BATCH_CANCELLED";
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        updateData.updatedAt = new Date();

        // Update orders
        const result = await db.collection("Order").updateMany(
            { _id: { $in: objectIds } },
            { $set: updateData }
        );

        // Log the batch action
        await db.collection("AuditLog").insertOne({
            type: "ORDER",
            action: auditAction,
            adminId: session.user.id,
            adminName: session.user.name,
            targetId: "BATCH",
            targetName: `${orderIds.length} Orders`,
            details: { orderIds },
            timestamp: new Date(),
        }).catch(err => console.error("Batch audit log failed:", err));

        return NextResponse.json({
            success: true,
            modifiedCount: result.modifiedCount
        });
    } catch (error: any) {
        console.error("Batch order action error:", error);
        return NextResponse.json({ error: "Failed to process batch action" }, { status: 500 });
    }
}
