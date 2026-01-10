import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const client = await clientPromise;
                const db = client.db();
                const user = await db.collection("User").findOne({ email: credentials.email });

                if (!user || !user.password) {
                    throw new Error("User not found");
                }

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.password as string
                );

                if (!isPasswordCorrect) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }

            // Handle Impersonation Trigger
            if (trigger === "update" && session?.targetUserId) {
                const allowedRoles = ["ADMIN", "MANAGER", "STAFF"];
                if (allowedRoles.includes(token.role as string) || token.originalAdminId) {
                    const client = await clientPromise;
                    const db = client.db();
                    const { ObjectId } = await import("mongodb");

                    if (session.targetUserId === "stop") {
                        // Log Stop Event
                        if (token.originalAdminId) {
                            db.collection("AuditLog").insertOne({
                                type: "IMPERSONATION",
                                action: "STOPPED_IMPERSONATION",
                                adminId: token.originalAdminId,
                                adminName: token.originalAdminName,
                                targetId: token.id,
                                targetName: token.name,
                                timestamp: new Date(),
                            }).catch(err => console.error("Audit log failed:", err));

                            // Restore Admin identity
                            token.id = token.originalAdminId;
                            token.name = token.originalAdminName;
                            token.email = token.originalAdminEmail;
                            token.role = token.originalAdminRole as string;
                        }
                        delete token.originalAdminId;
                        delete token.originalAdminName;
                        delete token.originalAdminEmail;
                        delete token.originalAdminRole;
                        delete token.isImpersonating;
                    } else {
                        // Switch to Target User
                        const targetUser = await db.collection("User").findOne({
                            _id: new ObjectId(session.targetUserId)
                        });

                        if (targetUser) {
                            const adminId = token.originalAdminId || token.id;
                            const adminName = token.originalAdminName || (token.name as string);

                            // Log Start Event
                            db.collection("AuditLog").insertOne({
                                type: "IMPERSONATION",
                                action: "STARTED_IMPERSONATION",
                                adminId,
                                adminName,
                                targetId: targetUser._id.toString(),
                                targetName: targetUser.name,
                                timestamp: new Date(),
                            }).catch(err => console.error("Audit log failed:", err));

                            token.originalAdminId = token.originalAdminId || token.id;
                            token.originalAdminName = token.originalAdminName || (token.name as string);
                            token.originalAdminEmail = token.originalAdminEmail || (token.email as string);
                            token.originalAdminRole = token.originalAdminRole || token.role;

                            token.id = targetUser._id.toString();
                            token.name = targetUser.name as string;
                            token.email = targetUser.email as string;
                            token.role = targetUser.role || "USER";
                            token.isImpersonating = true;
                        }
                    }
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = (token.id as string) || "";
                session.user.role = (token.role as string) || "USER";
                session.isImpersonating = token.isImpersonating as boolean;
                session.originalAdminId = token.originalAdminId as string;
                session.originalAdminName = token.originalAdminName as string;
                session.originalAdminEmail = token.originalAdminEmail as string;

                // Update lastActive timestamp in background
                try {
                    const client = await clientPromise;
                    const db = client.db();
                    const { ObjectId } = await import("mongodb");

                    // We don't await this to keep the session response fast
                    db.collection("User").updateOne(
                        { _id: new ObjectId(token.id as string) },
                        { $set: { lastActive: new Date() } }
                    ).catch(err => console.error("Failed to update lastActive:", err));
                } catch (error) {
                    // Silently fail if DB update fails to not break session
                }
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
