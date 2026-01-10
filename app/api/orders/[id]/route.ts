import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const client = await clientPromise;
        const db = client.db();

        const order = await db.collection("Order").aggregate([
            { $match: { _id: new ObjectId(params.id) } },
            {
                $lookup: {
                    from: "OrderItem",
                    localField: "_id",
                    foreignField: "orderId",
                    as: "items"
                }
            }
        ]).toArray();

        if (order.length === 0) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const formattedOrder = {
            ...order[0],
            id: order[0]._id.toString(),
            items: order[0].items.map((item: any) => ({ ...item, id: item._id.toString() }))
        };

        return NextResponse.json(formattedOrder);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "MANAGER", "STAFF"].includes(session.user.role as string)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const client = await clientPromise;
        const db = client.db();

        await db.collection("Order").updateOne(
            { _id: new ObjectId(params.id) },
            { $set: { ...body, updatedAt: new Date() } }
        );

        // Audit Log
        if (body.status === "PAID") {
            await db.collection("AuditLog").insertOne({
                type: "ORDER",
                action: "FINALIZED_DRAFT",
                adminId: session.user.id,
                adminName: session.user.name,
                targetId: params.id,
                targetName: `Order ${params.id.slice(-6).toUpperCase()}`,
                timestamp: new Date(),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();

        // Delete order and its items
        await db.collection("Order").deleteOne({ _id: new ObjectId(params.id) });
        await db.collection("OrderItem").deleteMany({ orderId: new ObjectId(params.id) });

        // Audit Log
        await db.collection("AuditLog").insertOne({
            type: "ORDER",
            action: "DELETED_ORDER",
            adminId: session.user.id,
            adminName: session.user.name,
            targetId: params.id,
            targetName: `Order ${params.id.slice(-6).toUpperCase()}`,
            timestamp: new Date(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
    }
}
