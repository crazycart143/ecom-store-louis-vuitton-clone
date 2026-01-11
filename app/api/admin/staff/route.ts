import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !["OWNER", "ADMIN", "MANAGER"].includes(session.user.role as string)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();

        const staff = await db.collection("User")
            .find({ role: { $in: ["OWNER", "ADMIN", "MANAGER", "STAFF"] } })
            .project({ password: 0 }) // Don't send passwords
            .toArray();

        return NextResponse.json(staff);
    } catch (error) {
        console.error("Fetch staff error:", error);
        return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    // Only OWNER and ADMIN can create new staff
    if (!session || !["OWNER", "ADMIN"].includes(session.user.role as string)) {
        return NextResponse.json({ error: "Only Owners and Admins can create new staff accounts" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, email, password, role } = body;

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        // Check if user already exists
        const existingUser = await db.collection("User").findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "Member with this email already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.collection("User").insertOne({
            name,
            email,
            password: hashedPassword,
            role: role.toUpperCase(),
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date(),
            lastActive: null
        });

        // Audit Log
        await db.collection("AuditLog").insertOne({
            type: "ROLE_CHANGE",
            action: "CREATED_STAFF",
            adminId: session.user.id,
            adminName: session.user.name,
            targetId: result.insertedId.toString(),
            targetName: name,
            timestamp: new Date(),
            metadata: { role }
        }).catch(err => console.error("Audit log failed:", err));

        return NextResponse.json({
            success: true,
            id: result.insertedId.toString()
        });
    } catch (error) {
        console.error("Create staff error:", error);
        return NextResponse.json({ error: "Failed to create staff member" }, { status: 500 });
    }
}
