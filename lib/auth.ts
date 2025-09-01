import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

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
    async signIn({ user, account, profile }) {
      try {
        console.log("🔐 SignIn callback triggered:", {
          email: user.email,
          provider: account?.provider,
          providerAccountId: account?.providerAccountId,
        });

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: {
            accounts: true,
          },
        });

        if (!existingUser) {
          console.log(
            `🆕 New user signing in: ${user.email} via ${account?.provider}`
          );
        } else {
          console.log(
            `✅ Existing user signing in: ${user.email} (role: ${existingUser.role}) via ${account?.provider}`
          );

          const existingAccount = existingUser.accounts.find(
            (acc) => acc.provider === account?.provider
          );

          if (!existingAccount) {
            console.log(
              `🔗 Linking new ${account?.provider} account to existing user ${user.email}`
            );
          } else {
            console.log(`✅ Provider account already linked for ${user.email}`);
          }
        }
      } catch (error) {
        console.error("Error in signIn callback:", error);
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      console.log("🔄 JWT callback triggered:", {
        trigger,
        hasUser: !!user,
        hasToken: !!token,
        tokenId: token?.id,
        tokenRole: token?.role,
      });

      if (user) {
        try {
          console.log("👤 User object available, fetching from DB...");

          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            console.log(
              `✅ JWT updated for existing user ${dbUser.email}: role=${dbUser.role}`
            );
          } else {
            console.log(`🆕 Setting default role for new user: ${user.email}`);

            await new Promise((resolve) => setTimeout(resolve, 100));

            const newDbUser = await prisma.user.findUnique({
              where: { email: user.email! },
            });

            if (newDbUser) {
              token.id = newDbUser.id;
              token.role = newDbUser.role;
              console.log(
                `✅ JWT updated for new user ${newDbUser.email}: role=${newDbUser.role}`
              );
            } else {
              console.log(
                "⚠️ User still not found in DB, setting default values"
              );
              token.role = "READ_ONLY";
            }
          }
        } catch (error) {
          console.error("Error in jwt callback:", error);
          token.role = "READ_ONLY";
        }
      }

      if (token.id && token.role) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
          });

          if (dbUser) {
            token.role = dbUser.role;
            console.log(
              `🔄 Refreshed token data for user ${dbUser.email}: role=${dbUser.role}`
            );
          }
        } catch (error) {
          console.error("Error refreshing token data:", error);
        }
      }

      if (token.id && !token.role) {
        try {
          console.log("🔍 Token has ID but no role, fetching from DB...");
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
          });

          if (dbUser) {
            token.role = dbUser.role;
            console.log(
              `🔧 Fixed missing role for user ${dbUser.email}: role=${dbUser.role}`
            );
          }
        } catch (error) {
          console.error("Error fixing missing role:", error);
          token.role = "READ_ONLY";
        }
      }

      console.log("📤 JWT callback returning token:", {
        id: token.id,
        role: token.role,
        email: token.email,
      });

      return token;
    },

    async session({ session, token }) {
      console.log("🔍 Session callback called", {
        token: token
          ? { id: token.id, role: token.role, email: token.email }
          : null,
        sessionUser: session.user,
        sessionUserKeys: session.user ? Object.keys(session.user) : [],
      });

      if (token && token.id && token.role) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "READ_ONLY";
        console.log(
          `✅ Session updated for user ${session.user.email}: role=${session.user.role}`
        );
      } else {
        console.log("⚠️ Token missing required data:", {
          id: token?.id,
          role: token?.role,
          email: token?.email,
        });

        if (session.user?.email) {
          try {
            console.log("🔄 Attempting fallback user lookup from DB...");
            const dbUser = await prisma.user.findUnique({
              where: { email: session.user.email },
            });

            if (dbUser) {
              session.user.id = dbUser.id;
              session.user.role = dbUser.role;
              console.log(
                `🔄 Fallback: Session updated from DB for user ${dbUser.email}: role=${dbUser.role}`
              );
            } else {
              console.log("❌ User not found in DB during fallback");
            }
          } catch (error) {
            console.error("Error in fallback user lookup:", error);
          }
        }
      }

      console.log("📤 Session callback returning session:", {
        userId: session.user.id,
        userRole: session.user.role,
        userEmail: session.user.email,
        finalSessionKeys: Object.keys(session.user),
      });

      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  debug: process.env.NODE_ENV === "development",
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: "ADMIN" | "READ_ONLY";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "READ_ONLY";
  }
}
