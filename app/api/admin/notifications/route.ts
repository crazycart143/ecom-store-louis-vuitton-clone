import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const unreadOnly = searchParams.get("unreadOnly") === "true";

        const client = await clientPromise;
        const db = client.db();

        const filter: any = {};
        if (unreadOnly) {
            filter.read = false;
        }

        const notifications = await db
            .collection("Notification")
            .find(filter)
            .sort({ createdAt: -1 })
            .limit(50)
            .toArray();

        const formatted = notifications.map((n) => ({
            ...n,
            id: n._id.toString(),
        }));

        return NextResponse.json(formatted);
    } catch (error: any) {
        console.error("Fetch notifications error:", error);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { notificationId, markAllRead } = await req.json();

        const client = await clientPromise;
        const db = client.db();

        if (markAllRead) {
            // Mark all notifications as read
            await db.collection("Notification").updateMany(
                { read: false },
                { $set: { read: true } }
            );
            return NextResponse.json({ success: true, message: "All marked as read" });
        }

        if (notificationId) {
            const { ObjectId } = await import("mongodb");
            // Mark single notification as read
            await db.collection("Notification").updateOne(
                { _id: new ObjectId(notificationId) },
                { $set: { read: true } }
            );
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    } catch (error: any) {
        console.error("Update notification error:", error);
        return NextResponse.json(
            { error: "Failed to update notification" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db();

        // Delete all read notifications
        await db.collection("Notification").deleteMany({ read: true });

        return NextResponse.json({ success: true, message: "Cleared all read notifications" });
    } catch (error: any) {
        console.error("Delete notifications error:", error);
        return NextResponse.json(
            { error: "Failed to delete notifications" },
            { status: 500 }
        );
    }
}
