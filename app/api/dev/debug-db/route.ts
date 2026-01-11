import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
        return new Response(JSON.stringify({ error: "Access Denied: Highly classification required" }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        const orders = await db.collection("Order").find({}).toArray();

        // Auto-promote Admin to Owner if no Owner exists
        const ownerExists = await db.collection("User").findOne({ role: "OWNER" });
        if (!ownerExists) {
            await db.collection("User").updateMany(
                { role: "ADMIN" },
                { $set: { role: "OWNER" } }
            );
        }

        const users = await db.collection("User").find({}).project({ password: 0 }).toArray();

        return new Response(JSON.stringify({
            orderCount: orders.length,
            userCount: users.length,
            users,
            orders
        }, null, 2));
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }));
    }
}
