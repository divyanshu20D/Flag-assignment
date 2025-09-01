import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],

    callbacks: {
        /**
         * Runs when the JWT is created/updated.
         * Persist extra user info (id, role, workspaceId) in the token.
         */
        async jwt({ token, user }) {
            if (user) {
                try {
                    // Fetch user from DB (with workspace info)
                    const dbUser = await prisma.user.findUnique({
                        where: { id: user.id },
                        include: { workspace: true },
                    })

                    if (dbUser) {
                        // Assign default workspace if missing
                        if (!dbUser.workspaceId) {
                            const defaultWorkspace = await prisma.workspace.findFirst()
                            if (defaultWorkspace) {
                                const updatedUser = await prisma.user.update({
                                    where: { id: dbUser.id },
                                    data: {
                                        role: "READ_ONLY",
                                        workspaceId: defaultWorkspace.id,
                                    },
                                })
                                token.id = updatedUser.id
                                token.role = updatedUser.role
                                token.workspaceId = updatedUser.workspaceId
                            }
                        } else {
                            token.id = dbUser.id
                            token.role = dbUser.role
                            token.workspaceId = dbUser.workspaceId
                        }
                    }
                } catch (error) {
                    console.error("Error in jwt callback:", error)
                }
            }
            return token
        },

        /**
         * Runs whenever a session is checked.
         * Expose custom fields from the token to the session.
         */
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as "ADMIN" | "READ_ONLY"
                session.user.workspaceId = token.workspaceId as string
            }
            return session
        },
    },

    pages: {
        signIn: "/login",
    },

    session: {
        strategy: "jwt", // ✅ use JWT sessions
    },
}

// -----------------
// TypeScript Augmentation
// -----------------
declare module "next-auth" {
    interface Session {
        user: {
            id: string
            email: string
            name?: string | null
            image?: string | null
            role: "ADMIN" | "READ_ONLY"
            workspaceId: string
        }
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: "ADMIN" | "READ_ONLY"
        workspaceId: string
    }
}
