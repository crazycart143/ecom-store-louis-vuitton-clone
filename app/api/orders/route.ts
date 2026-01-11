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
        const adminRoles = ["OWNER", "ADMIN", "MANAGER", "STAFF"];
        if (!adminRoles.includes(role as string)) {
            console.log(`[Orders API] Fetching for user: ${userId}, email: ${session.user.email}`);
            match = {
                $or: [
                    { userId: userId },
                    { email: session.user.email }
                ]
            };
        } else {
            console.log(`[Orders API] Fetching ALL orders (${role})`);
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

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !["OWNER", "ADMIN", "MANAGER", "STAFF"].includes(session.user.role as string)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { email, items, total, status, fulfillment } = body;

        const client = await clientPromise;
        const db = client.db();
        const { ObjectId } = await import("mongodb");

        // Attempt to find user by email to link order
        const user = await db.collection("User").findOne({ email });

        // Create the order
        const orderResult = await db.collection("Order").insertOne({
            email,
            total: parseFloat(total),
            subtotal: body.subtotal ? parseFloat(body.subtotal) : parseFloat(total),
            discountCode: body.discountCode || null,
            discountAmount: body.discountAmount ? parseFloat(body.discountAmount) : 0,
            status: status || "PENDING",
            fulfillment: fulfillment || "UNFULFILLED",
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: user ? user._id : null,
        });

        const orderId = orderResult.insertedId;

        // Create order items
        if (items && items.length > 0) {
            await db.collection("OrderItem").insertMany(
                items.map((item: any) => ({
                    orderId,
                    productId: new ObjectId(item.productId),
                    name: item.name,
                    quantity: parseInt(item.quantity),
                    price: parseFloat(item.price),
                    image: item.image || (item.images && item.images[0]?.url) || null
                }))
            );

            // Decrement stock for manual orders
            for (const item of items) {
                if (item.productId) {
                    await db.collection("Product").updateOne(
                        { _id: new ObjectId(item.productId) },
                        { $inc: { stock: -parseInt(item.quantity) } }
                    );
                }
            }
        }

        // Log the action
        await db.collection("AuditLog").insertOne({
            type: "ORDER",
            action: status === "DRAFT" ? "CREATED_DRAFT" : "CREATED_ORDER",
            adminId: session.user.id,
            adminName: session.user.name,
            targetId: orderId.toString(),
            targetName: `Order ${orderId.toString().slice(-6).toUpperCase()}`,
            timestamp: new Date(),
        }).catch(err => console.error("Audit log failed:", err));

        return NextResponse.json({ success: true, id: orderId.toString() });
    } catch (error: any) {
        console.error("Create order error:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
