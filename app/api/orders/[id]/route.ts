import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    // Check auth
    if (!session || !["ADMIN", "OWNER", "MANAGER"].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { status, fulfillment } = await req.json();

        const client = await clientPromise;
        const db = client.db();

        const updateData: any = {};
        if (status) updateData.status = status;
        if (fulfillment) updateData.fulfillment = fulfillment;
        updateData.updatedAt = new Date();

        // Try to update by ObjectId first, then by string id field
        let result;
        if (ObjectId.isValid(id)) {
            result = await db.collection("Order").updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );
        }

        // If not found by ObjectId, try by string id field
        if (!result || result.matchedCount === 0) {
            result = await db.collection("Order").updateOne(
                { id: id },
                { $set: updateData }
            );
        }

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Order update error:", error);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || !["ADMIN", "OWNER", "MANAGER"].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();

        let result;
        if (ObjectId.isValid(id)) {
            result = await db.collection("Order").deleteOne({ _id: new ObjectId(id) });
        }

        if (!result || result.deletedCount === 0) {
            result = await db.collection("Order").deleteOne({ id: id });
        }

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Also delete order items
        await db.collection("OrderItem").deleteMany({
            orderId: ObjectId.isValid(id) ? new ObjectId(id) : id
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Order delete error:", error);
        return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    if (!session || !["ADMIN", "OWNER", "MANAGER", "STAFF"].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();

        // Try to find by ObjectId first, then by string id field
        let order;
        if (ObjectId.isValid(id)) {
            order = await db.collection("Order").findOne({ _id: new ObjectId(id) });
        }

        // If not found by ObjectId, try by string id field
        if (!order) {
            order = await db.collection("Order").findOne({ id: id });
        }

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({ ...order, id: order.id || order._id.toString() });
    } catch (error) {
        console.error("Order fetch error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
