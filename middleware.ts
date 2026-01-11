import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAdmin = ["OWNER", "ADMIN", "MANAGER", "STAFF"].includes(token?.role as string);
        const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

        if (isAdminRoute && !isAdmin && req.nextUrl.pathname !== "/admin/login") {
            return NextResponse.redirect(new URL("/", req.url));
        }

        const isAdminOnlyRoute = ["/admin/logs", "/admin/settings", "/admin/staff"].some(path =>
            req.nextUrl.pathname.startsWith(path)
        );
        const isHighLevelAdmin = ["OWNER", "ADMIN"].includes(token?.role as string);

        if (isAdminOnlyRoute && !isHighLevelAdmin) {
            return NextResponse.redirect(new URL("/admin", req.url));
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
