import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;
        const client = await clientPromise;
        const db = client.db();

        let query: any = { handle: id };

        // Try to treat as ObjectId if it's a valid hex string
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            query = { $or: [{ _id: new ObjectId(id) }, { handle: id }] };
        }

        const products = await db.collection("Product").aggregate([
            { $match: query },
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
            }
        ]).toArray();

        const product = products[0];

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Format for frontend
        const formattedProduct = {
            ...product,
            id: product._id.toString(),
            images: product.images.map((img: any) => ({ ...img, id: img._id.toString() })),
            details: product.details.map((detail: any) => ({ ...detail, id: detail._id.toString() })),
            category: product.category ? { ...product.category, id: product.category._id.toString() } : null
        };

        return NextResponse.json(formattedProduct);
    } catch (error: any) {
        console.error("Fetch product error detailed:", error);
        return NextResponse.json({
            error: error.message || "Failed to fetch product",
            stack: error.stack,
            type: error.constructor.name
        }, { status: 500 });
    }
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        const params = await props.params;
        const { id } = params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
        }

        const objectId = new ObjectId(id);

        // Delete related data first
        await Promise.all([
            db.collection("Image").deleteMany({ productId: objectId }),
            db.collection("Detail").deleteMany({ productId: objectId }),
            db.collection("Product").deleteOne({ _id: objectId })
        ]);

        return NextResponse.json({ message: "Product deleted successfully" });
    } catch (error: any) {
        console.error("Delete product error:", error);
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        const params = await props.params;
        const { id } = params;
        const body = await req.json();
        const { name, handle, price, description, categoryId, images, details } = body;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
        }

        const objectId = new ObjectId(id);

        // Update main product
        await db.collection("Product").updateOne(
            { _id: objectId },
            {
                $set: {
                    name,
                    handle,
                    price: parseFloat(price),
                    description,
                    categoryId: categoryId ? new ObjectId(categoryId) : null,
                    updatedAt: new Date()
                }
            }
        );

        // Update images (simplest way: delete all and re-add)
        if (images) {
            await db.collection("Image").deleteMany({ productId: objectId });
            if (images.length > 0) {
                await db.collection("Image").insertMany(
                    images.map((url: string) => ({ url, productId: objectId }))
                );
            }
        }

        // Update details
        if (details) {
            await db.collection("Detail").deleteMany({ productId: objectId });
            if (details.length > 0) {
                await db.collection("Detail").insertMany(
                    details.map((content: string) => ({ content, productId: objectId }))
                );
            }
        }

        return NextResponse.json({ message: "Product updated successfully" });
    } catch (error: any) {
        console.error("Update product error:", error);
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}
