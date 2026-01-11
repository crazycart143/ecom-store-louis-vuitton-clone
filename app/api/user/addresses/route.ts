import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { randomUUID } from "crypto";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection("User").findOne({ _id: new ObjectId(session.user.id) });

    return NextResponse.json(user?.addresses || []);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        // Validation could go here

        const newAddress = {
            id: randomUUID(),
            ...body, // line1, city, etc.
            isDefault: body.isDefault || false
        };

        const client = await clientPromise;
        const db = client.db();

        // If this is default, unset others
        if (newAddress.isDefault) {
            await db.collection("User").updateOne(
                { _id: new ObjectId(session.user.id), "addresses.isDefault": true },
                { $set: { "addresses.$.isDefault": false } }
            );
        }

        // checking if addresses field exists, if not strictly needed since push creates it but good to know
        await db.collection("User").updateOne(
            { _id: new ObjectId(session.user.id) },
            { $push: { addresses: newAddress } }
        );

        return NextResponse.json(newAddress);
    } catch (e) {
        return NextResponse.json({ error: "Failed to add address" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const addressId = searchParams.get("id");

    if (!addressId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db();

    await db.collection("User").updateOne(
        { _id: new ObjectId(session.user.id) },
        { $pull: { addresses: { id: addressId } } as any }
    );

    return NextResponse.json({ success: true });
}
