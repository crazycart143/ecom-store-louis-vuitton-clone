import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAdmin = token?.role === "ADMIN";
        const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

        if (isAdminRoute && !isAdmin && req.nextUrl.pathname !== "/admin/login") {
            return NextResponse.redirect(new URL("/", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                if (req.nextUrl.pathname === "/admin/login") return true;
                return !!token;
            },
        },
    }
);

export const config = {
    matcher: ["/admin/:path*", "/account/:path*"],
};
