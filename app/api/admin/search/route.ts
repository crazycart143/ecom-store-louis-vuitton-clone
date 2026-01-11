import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !["OWNER", "ADMIN", "MANAGER", "STAFF"].includes(session.user.role as string)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!query || query.length < 2) {
            return NextResponse.json({ products: [], orders: [], customers: [] });
        }

        const client = await clientPromise;
        const db = client.db();

        const searchRegex = new RegExp(query, "i");

        // 1. Search Products
        const products = await db.collection("Product")
            .find({
                $or: [
                    { name: searchRegex },
                    { handle: searchRegex },
                    { sku: searchRegex }
                ]
            })
            .limit(5)
            .toArray();

        // 2. Search Orders
        // 2. Search Orders (using Aggregation to search formatted ID and flat fields)
        const orders = await db.collection("Order").aggregate([
            {
                $addFields: {
                    orderIdString: { $toString: "$_id" }
                }
            },
            {
                $match: {
                    $or: [
                        { orderIdString: searchRegex },
                        { email: searchRegex },
                        { "shippingAddress.name": searchRegex }
                    ]
                }
            },
            { $limit: 5 }
        ]).toArray();

        // 2.1 Format Orders for Frontend (shim to match UI expectations)
        const formattedOrders = orders.map(order => ({
            ...order,
            orderNumber: `#${order._id.toString().slice(-6).toUpperCase()}`,
            customer: {
                email: order.email,
                name: order.shippingAddress?.name || "Unknown"
            }
        }));

        // 3. Search Customers (Users with role USER)
        const customers = await db.collection("User")
            .find({
                role: "USER",
                $or: [
                    { name: searchRegex },
                    { email: searchRegex }
                ]
            })
            .limit(5)
            .toArray();

        return NextResponse.json({
            products,
            orders: formattedOrders,
            customers
        });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}
