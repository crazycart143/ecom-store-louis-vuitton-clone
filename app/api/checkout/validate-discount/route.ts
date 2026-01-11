import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
    try {
        const { code, cartTotal } = await req.json();

        if (!code) {
            return NextResponse.json({ error: "Code is required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const discount = await db.collection("Discount").findOne({
            code: (code || "").trim().toUpperCase(),
            status: "active"
        });

        if (!discount) {
            return NextResponse.json({ error: "Invalid or expired promotion code" }, { status: 400 });
        }

        // 1. Check Expiry
        if (discount.expiryDate && new Date(discount.expiryDate) < new Date()) {
            return NextResponse.json({ error: "Promotion code has expired" }, { status: 400 });
        }

        // 2. Check Usage Limit
        if (discount.usageLimit !== null && discount.usedCount >= discount.usageLimit) {
            return NextResponse.json({ error: "Usage limit reached" }, { status: 400 });
        }

        // 3. Check Minimum Purchase
        if (discount.minPurchase && cartTotal < discount.minPurchase) {
            return NextResponse.json({ error: `Minimum purchase of $${discount.minPurchase} required` }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            discount: {
                _id: discount._id,
                code: discount.code,
                type: discount.type,
                value: discount.value
            }
        });

    } catch (error) {
        console.error("Discount validation error:", error);
        return NextResponse.json({ error: "Validation failed" }, { status: 500 });
    }
}
