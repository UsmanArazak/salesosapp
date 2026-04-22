import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { createPublicSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase";
import type { UserRole } from "@/types";

type UsersRow = {
  shop_id: string;
  role: UserRole;
};

function isUserRole(value: unknown): value is UserRole {
  return value === "owner" || value === "superadmin";
}

function parseCredentials(
  credentials: Record<string, string> | undefined,
): { email: string; password: string } | null {
  const email = credentials?.email?.trim();
  const password = credentials?.password;
  if (!email || !password) return null;
  return { email, password };
}

/**
 * SalesOS NextAuth configuration.
 *
 * Constraints (Prompt 1):
 * - Credentials verification uses Supabase Auth with the public (anon) client.
 * - The ONLY allowed service-role usage is a one-time lookup of `users` by id
 *   to extract `shop_id` and `role` for JWT enrichment.
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = parseCredentials(rawCredentials);
        if (!parsed) return null;

        const publicClient = createPublicSupabaseClient();
        const signIn = await publicClient.auth.signInWithPassword(parsed);
        if (signIn.error || !signIn.data.user) return null;

        const authUserId = signIn.data.user.id;

        const serviceClient = createServiceRoleSupabaseClient();
        const profile = await serviceClient
          .from("users")
          .select("shop_id, role")
          .eq("id", authUserId)
          .maybeSingle<UsersRow>();

        if (profile.error || !profile.data) return null;
        if (!isUserRole(profile.data.role)) return null;

        return {
          id: authUserId,
          email: parsed.email,
          shopId: profile.data.shop_id,
          role: profile.data.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.shopId = user.shopId;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      const role: UserRole = token.role === "superadmin" ? "superadmin" : "owner";
      session.user = {
        ...(session.user ?? {}),
        userId: token.userId ?? "",
        shopId: token.shopId ?? "",
        role,
      };
      return session;
    },
  },
};

