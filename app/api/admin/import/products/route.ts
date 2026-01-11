import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !["OWNER", "ADMIN", "MANAGER"].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { products } = await req.json();

        if (!Array.isArray(products) || products.length === 0) {
            return NextResponse.json({ error: "No products provided" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        let successCount = 0;
        let errors: string[] = [];

        for (const p of products) {
            try {
                // 1. Resolve Category (Find or Create)
                let categoryId = null;
                if (p.category) {
                    const catSlug = slugify(p.category);
                    let category = await db.collection("Category").findOne({ slug: catSlug });

                    if (!category) {
                        const newCat = await db.collection("Category").insertOne({
                            name: p.category,
                            slug: catSlug,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                        categoryId = newCat.insertedId;
                    } else {
                        categoryId = category._id;
                    }
                }

                // 2. Prepare Product Data
                const handle = p.handle || slugify(p.name);

                // Check if product with handle exists -> skip or update? We'll skip for now to avoid duplicates error
                const existing = await db.collection("Product").findOne({ handle });
                if (existing) {
                    errors.push(`Skipped ${p.name}: Handle '${handle}' already exists.`);
                    continue;
                }

                const productDoc = {
                    name: p.name,
                    handle,
                    price: parseFloat(p.price) || 0,
                    description: p.description || "",
                    categoryId,
                    scheduledAt: null,
                    requiredTags: [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                const result = await db.collection("Product").insertOne(productDoc);
                const productId = result.insertedId;

                // 3. Insert Images
                if (p.images && p.images.length > 0) {
                    // p.images should be an array of URLs
                    const imageDocs = p.images.map((url: string) => ({
                        url: url.trim(),
                        productId
                    })).filter((img: any) => img.url);

                    if (imageDocs.length > 0) {
                        await db.collection("Image").insertMany(imageDocs);
                    }
                }

                // 4. Insert Details
                if (p.details && p.details.length > 0) {
                    const detailDocs = p.details.map((content: string) => ({
                        content: content.trim(),
                        productId
                    })).filter((d: any) => d.content);
                    if (detailDocs.length > 0) {
                        await db.collection("Detail").insertMany(detailDocs);
                    }
                }

                successCount++;

            } catch (err: any) {
                console.error(`Error importing product ${p.name}:`, err);
                errors.push(`Failed to import ${p.name}: ${err.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            imported: successCount,
            errors
        });

    } catch (error) {
        console.error("Import error:", error);
        return NextResponse.json({ error: "Import failed" }, { status: 500 });
    }
}
