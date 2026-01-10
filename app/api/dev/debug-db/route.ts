import clientPromise from "@/lib/mongodb";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db();
        const orders = await db.collection("Order").find({}).toArray();
        const orderItems = await db.collection("OrderItem").find({}).toArray();

        return new Response(JSON.stringify({
            orderCount: orders.length,
            itemCount: orderItems.length,
            orders
        }, null, 2));
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }));
    }
}
