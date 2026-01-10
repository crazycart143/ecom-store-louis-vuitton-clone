import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
        } & DefaultSession["user"];
        isImpersonating?: boolean;
        originalAdminId?: string;
        originalAdminName?: string;
        originalAdminEmail?: string;
    }

    interface User extends DefaultUser {
        role: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        isImpersonating?: boolean;
        originalAdminId?: string;
        originalAdminName?: string;
        originalAdminEmail?: string;
        originalAdminRole?: string;
    }
}
