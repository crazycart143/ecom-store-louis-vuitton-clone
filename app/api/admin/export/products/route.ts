import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !["OWNER", "ADMIN"].includes(session.user.role as string)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();

        const products = await db.collection("Product").find({}).toArray();

        // Fetch related images and details for a full export
        const productIds = products.map(p => p._id);
        const [images, details] = await Promise.all([
            db.collection("Image").find({ productId: { $in: productIds } }).toArray(),
            db.collection("Detail").find({ productId: { $in: productIds } }).toArray()
        ]);

        interface ExportProduct {
            _id: string;
            name: string;
            handle: string;
            price: number;
            description: string;
            categoryId: string;
            images: string[];
            details: string[];
        }

        const fullExport: ExportProduct[] = products.map(p => ({
            _id: p._id.toString(),
            name: p.name || "",
            handle: p.handle || "",
            price: p.price || 0,
            description: p.description || "",
            categoryId: p.categoryId?.toString() || "",
            images: images.filter(img => img.productId.toString() === p._id.toString()).map(img => img.url),
            details: details.filter(d => d.productId.toString() === p._id.toString()).map(d => d.content)
        }));

        // Convert to CSV string
        const headers = ["name", "handle", "price", "description", "category", "images", "details"];
        const csvRows = [
            headers.join(","),
            ...fullExport.map(p => {
                return [
                    `"${p.name.replace(/"/g, '""')}"`,
                    `"${p.handle}"`,
                    p.price,
                    `"${p.description?.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
                    `"${p.categoryId || ''}"`,
                    `"${p.images.join('|')}"`,
                    `"${p.details.join('|')}"`
                ].join(",");
            })
        ];

        const csvContent = csvRows.join("\n");

        return new NextResponse(csvContent, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename=maison_products_export_${new Date().toISOString().split('T')[0]}.csv`
            }
        });

    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json({ error: "Export failed" }, { status: 500 });
    }
}
