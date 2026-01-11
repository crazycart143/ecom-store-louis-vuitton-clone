import { sendOrderConfirmationEmail } from "@/lib/mail";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "OWNER") {
        return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    try {
        await sendOrderConfirmationEmail(
            "admin@louisvuitton.com",
            "Test Admin",
            "TEST123456",
            5500,
            [{ name: "Test Product", price: 5600, quantity: 1, image: "/images/product.jpg" }],
            "123 Test St\nTest City, TS 12345\nUS",
            new Date().toLocaleDateString(),
            5600,
            100
        );
        return NextResponse.json({ success: true, message: "Test email triggered. Check server console for errors." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
