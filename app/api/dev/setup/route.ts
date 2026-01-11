import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db();

        // Security check: Only allow setup if no admin exists, OR if session is OWNER
        const adminExists = await db.collection("User").findOne({ role: { $in: ["ADMIN", "OWNER"] } });
        if (adminExists) {
            const session = await getServerSession(authOptions);
            if (!session || session.user.role !== "OWNER") {
                return NextResponse.json({ error: "Access Denied: Setup locked" }, { status: 403 });
            }
        }


        const email = "admin@louisvuitton.com";
        const password = await bcrypt.hash("Admin123!", 10);

        const existingUser = await db.collection("User").findOne({ email });

        if (existingUser) {
            await db.collection("User").updateOne(
                { email },
                { $set: { role: "ADMIN", password } } // Reset password to be sure
            );
            return NextResponse.json({ message: "Admin updated" });
        } else {
            await db.collection("User").insertOne({
                name: "Louis Vuitton Admin",
                email,
                password,
                role: "ADMIN",
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        const productCount = await db.collection("Product").countDocuments();
        if (productCount === 0) {
            await db.collection("Product").insertOne({
                name: "Capucines Mini",
                handle: "capucines-mini",
                price: 6750,
                description: "The Capucines Mini handbag is offered in a new version...",
                categoryId: null,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            // Add image
            const p = await db.collection("Product").findOne({ handle: "capucines-mini" });
            if (p) {
                await db.collection("Image").insertOne({
                    productId: p._id,
                    url: "https://eu.louisvuitton.com/images/is/image/lv/1/PP_VP_L/louis-vuitton-capucines-mini-taurillon-leather-handbags--M20848_PM2_Front%20view.png"
                });
            }
        }

        return NextResponse.json({ message: "Setup complete" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
