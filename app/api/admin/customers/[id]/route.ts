import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const { id: customerId } = await params;

    if (!session || !["OWNER", "ADMIN", "MANAGER", "STAFF"].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        const customerId = (await params).id;

        if (!ObjectId.isValid(customerId)) {
            return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 });
        }

        const customer = await db.collection("User").findOne(
            { _id: new ObjectId(customerId) },
            { projection: { password: 0 } }
        );

        if (!customer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }

        // Fetch customer's orders
        const orders = await db.collection("Order")
            .find({
                $or: [
                    { userId: new ObjectId(customerId) },
                    { email: customer.email }
                ]
            })
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({
            ...customer,
            _id: customer._id.toString(),
            orders: orders.map(order => ({
                ...order,
                _id: order._id.toString(),
                total: order.total || 0,
                status: order.status || "PENDING",
                fulfillment: order.fulfillment || "UNFULFILLED"
            }))
        });

    } catch (error) {
        console.error("Failed to fetch customer details:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
