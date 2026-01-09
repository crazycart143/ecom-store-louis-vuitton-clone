import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const categorySlug = searchParams.get("category");

        const client = await clientPromise;
        const db = client.db();

        const pipeline: any[] = [
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
            },
            {
                $lookup: {
                    from: "Detail",
                    localField: "_id",
                    foreignField: "productId",
                    as: "details"
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ];

        if (categorySlug) {
            pipeline.unshift({
                $match: {
                    "category.slug": categorySlug
                }
            });
        }

        const products = await db.collection("Product").aggregate(pipeline).toArray();

        // Convert MongoDB _id to id for frontend compatibility
        const formattedProducts = products.map(p => ({
            ...p,
            id: p._id.toString(),
            categoryId: p.categoryId?.toString(),
            images: p.images.map((img: any) => ({ ...img, id: img._id.toString() })),
            details: p.details.map((detail: any) => ({ ...detail, id: detail._id.toString() })),
            category: p.category ? { ...p.category, id: p.category._id.toString() } : null
        }));

        return NextResponse.json(formattedProducts);
    } catch (error: any) {
        console.error("Fetch products error:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, handle, price, description, categoryId, images, details } = body;

        const client = await clientPromise;
        const db = client.db();
        const { ObjectId } = await import("mongodb");

        const productResult = await db.collection("Product").insertOne({
            name,
            handle,
            price: parseFloat(price),
            description,
            categoryId: categoryId ? new ObjectId(categoryId) : null,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const productId = productResult.insertedId;

        if (images && images.length > 0) {
            await db.collection("Image").insertMany(
                images.map((url: string) => ({ url, productId }))
            );
        }

        if (details && details.length > 0) {
            await db.collection("Detail").insertMany(
                details.map((content: string) => ({ content, productId }))
            );
        }

        return NextResponse.json({ id: productId, name, handle }, { status: 201 });
    } catch (error: any) {
        console.error("Create product error:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
