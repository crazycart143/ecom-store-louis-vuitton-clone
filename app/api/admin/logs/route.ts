import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Authorization check
        if (!session || !["ADMIN", "MANAGER", "STAFF"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db();

        // Get query parameters for pagination/filtering
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "50");
        const skip = parseInt(searchParams.get("skip") || "0");

        const logs = await db.collection("AuditLog")
            .find({})
            .sort({ timestamp: -1 })
            .limit(limit)
            .skip(skip)
            .toArray();

        // Convert MongoDB IDs to strings
        const formattedLogs = logs.map(log => ({
            ...log,
            id: log._id.toString(),
            _id: undefined
        }));

        return NextResponse.json(formattedLogs);
    } catch (error) {
        console.error("Failed to fetch logs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
