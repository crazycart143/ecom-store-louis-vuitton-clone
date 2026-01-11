import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET all discount codes
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !["OWNER", "ADMIN", "MANAGER"].includes(session.user.role as string)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();

        const discounts = await db.collection("Discount")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json(discounts);
    } catch (error) {
        console.error("Fetch discounts error:", error);
        return NextResponse.json({ error: "Failed to fetch discounts" }, { status: 500 });
    }
}

// POST create new discount code
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !["OWNER", "ADMIN", "MANAGER"].includes(session.user.role as string)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { code, type, value, status, expiryDate, minPurchase, usageLimit } = body;

        if (!code || !type || value === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        // Check for duplicate code
        const existing = await db.collection("Discount").findOne({
            code: code.toUpperCase()
        });

        if (existing) {
            return NextResponse.json({ error: "Discount code already exists" }, { status: 400 });
        }

        const newDiscount = {
            code: code.toUpperCase(),
            type, // 'percentage' | 'fixed'
            value: Number(value),
            status: status || "active", // 'active' | 'inactive'
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            minPurchase: minPurchase ? Number(minPurchase) : 0,
            usageLimit: usageLimit ? Number(usageLimit) : null,
            usedCount: 0,
            createdBy: session.user.id,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection("Discount").insertOne(newDiscount);

        // Audit Log
        await db.collection("AuditLog").insertOne({
            type: "MARKETING",
            action: "CREATED_DISCOUNT",
            adminId: session.user.id,
            adminName: session.user.name,
            targetId: result.insertedId.toString(),
            targetName: code.toUpperCase(),
            timestamp: new Date(),
            metadata: { type, value }
        }).catch(err => console.error("Audit log failed:", err));

        return NextResponse.json({
            success: true,
            id: result.insertedId.toString()
        });
    } catch (error) {
        console.error("Create discount error:", error);
        return NextResponse.json({ error: "Failed to create discount" }, { status: 500 });
    }
}
