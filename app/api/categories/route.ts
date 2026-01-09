import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db();

        const categories = await db.collection("Category").find({}).toArray();

        const formattedCategories = categories.map(c => ({
            ...c,
            id: c._id.toString()
        }));

        return NextResponse.json(formattedCategories);
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        const body = await req.json();
        const { name, description } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

        const result = await db.collection("Category").insertOne({
            name,
            slug,
            description,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return NextResponse.json({
            id: result.insertedId.toString(),
            name,
            slug
        }, { status: 201 });

    } catch (error: any) {
        console.error("Create category error:", error);
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}
