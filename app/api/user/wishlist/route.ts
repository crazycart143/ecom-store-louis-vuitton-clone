import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import clientPromise from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();

        const user = await db.collection("User").findOne({ email: session.user.email });
        if (!user || !user.wishlist || !Array.isArray(user.wishlist)) {
            return NextResponse.json([]);
        }

        const rawWishlist = user.wishlist || [];

        const { ObjectId } = require("mongodb");
        const objectIds = rawWishlist
            .filter((id: string) => ObjectId.isValid(id) && id.length === 24)
            .map((id: string) => new ObjectId(id));
        const stringIds = rawWishlist.filter((id: string) => !ObjectId.isValid(id) || id.length !== 24);

        const products = await db.collection("Product").aggregate([
            {
                $match: {
                    $or: [
                        { _id: { $in: objectIds } },
                        { id: { $in: stringIds } }
                    ]
                }
            },
            {
                $lookup: {
                    from: "Image",
                    localField: "_id",
                    foreignField: "productId",
                    as: "images"
                }
            },
            {
                $lookup: {
                    from: "Category",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: {
                    path: "$category",
                    preserveNullAndEmptyArrays: true
                }
            }
        ]).toArray();

        // Map back to the expected format
        const formattedProducts = products.map((p: any) => ({
            ...p,
            id: p._id.toString(),
            _id: p._id.toString(),
            images: (p.images || []).map((img: any) => ({ ...img, id: img._id.toString() })),
            category: p.category ? { ...p.category, id: p.category._id.toString() } : null
        }));

        return NextResponse.json(formattedProducts);
    } catch (error) {
        console.error("Wishlist fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { productId } = await req.json();
        if (!productId) {
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        // Use $addToSet to prevent duplicates
        await db.collection("User").updateOne(
            { email: session.user.email },
            {
                $addToSet: { wishlist: productId },
                $set: { lastActive: new Date() }
            }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Wishlist add error:", error);
        return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { productId } = await req.json();
        if (!productId) {
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        await db.collection("User").updateOne(
            { email: session.user.email },
            { $pull: { wishlist: productId } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Wishlist remove error:", error);
        return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
    }
}
