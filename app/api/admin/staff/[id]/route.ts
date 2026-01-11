import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const { id } = await props.params;

    if (!session || !["OWNER", "ADMIN"].includes(session.user.role as string)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { role, password, name, status } = body;

        const client = await clientPromise;
        const db = client.db();

        // 1. Fetch current target user to verify permissions
        const targetUser = await db.collection("User").findOne({ _id: new ObjectId(id) });
        if (!targetUser) {
            return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
        }

        // 2. verify hierarchy
        // ADMIN can only edit MANAGER and STAFF
        // OWNER can edit everyone except maybe themselves in some contexts, but they can edit ADMINs
        if (session.user.role === "ADMIN") {
            if (!["MANAGER", "STAFF"].includes(targetUser.role)) {
                return NextResponse.json({ error: "Insufficient permissions to edit this user level" }, { status: 403 });
            }
        }

        const updateData: any = { updatedAt: new Date() };
        if (role) updateData.role = role.toUpperCase();
        if (name) updateData.name = name;
        if (status !== undefined) updateData.status = status; // "active" | "inactive"
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const result = await db.collection("User").updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        // Audit Log
        await db.collection("AuditLog").insertOne({
            type: "STAFF_UPDATE",
            action: "UPDATED_STAFF",
            adminId: session.user.id,
            adminName: session.user.name,
            targetId: id,
            targetName: name || targetUser.name,
            timestamp: new Date(),
            metadata: { updatedFields: Object.keys(body) }
        }).catch(err => console.error("Audit log failed:", err));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update staff error:", error);
        return NextResponse.json({ error: "Failed to update staff member" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const { id } = await props.params;

    if (!session || !["OWNER", "ADMIN"].includes(session.user.role as string)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();

        // Check target user role
        const targetUser = await db.collection("User").findOne({ _id: new ObjectId(id) });
        if (!targetUser) {
            return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
        }

        if (session.user.role === "ADMIN") {
            if (!["MANAGER", "STAFF"].includes(targetUser.role)) {
                return NextResponse.json({ error: "Insufficient permissions to delete this user level" }, { status: 403 });
            }
        }

        const result = await db.collection("User").deleteOne({
            _id: new ObjectId(id)
        });

        // Audit Log
        await db.collection("AuditLog").insertOne({
            type: "STAFF_UPDATE",
            action: "DELETED_STAFF",
            adminId: session.user.id,
            adminName: session.user.name,
            targetId: id,
            targetName: targetUser?.name || "Unknown Staff",
            timestamp: new Date(),
        }).catch(err => console.error("Audit log failed:", err));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete staff error:", error);
        return NextResponse.json({ error: "Failed to delete staff member" }, { status: 500 });
    }
}
