import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const orderId = params.id;

        const client = await clientPromise;
        const db = client.db();

        // Update order fulfillment status
        const result = await db.collection("Order").updateOne(
            { _id: new ObjectId(orderId) },
            {
                $set: {
                    fulfillment: "FULFILLED",
                    fulfilledAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

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
