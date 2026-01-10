import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { NotificationHelpers } from "@/lib/notifications";

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password are required" },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db();

        const existingUser = await db.collection("User").findOne({ email });

        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await db.collection("User").insertOne({
            email,
            password: hashedPassword,
            name,
            role: "USER",
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Create admin notification for new customer
        await NotificationHelpers.newCustomer(email, result.insertedId.toString());

        return NextResponse.json(
            { message: "User created successfully", user: { email, name } },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
