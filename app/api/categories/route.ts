import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

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
