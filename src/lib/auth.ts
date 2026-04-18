import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import {
  createPublicSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase";

type Credentials = {
  email: string;
  password: string;
};

type UserRow = {
  shop_id: string;
  role: "owner" | "superadmin";
};

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const email = rawCredentials?.email;
        const password = rawCredentials?.password;

        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        // Step 1: verify credentials via Supabase Auth using the public (anon) client.
        const publicClient = createPublicSupabaseClient();
        const { data: authData, error: authError } =
          await publicClient.auth.signInWithPassword({ email, password });

        if (authError || !authData.user) {
          return null;
        }

        const authUserId = authData.user.id;

        // Step 2: one-time service role lookup to map auth user -> shop/role.
        const serviceClient = createServiceRoleSupabaseClient();
        const { data: userRow, error: userError } = await serviceClient
          .from("users")
          .select("shop_id,role")
          .eq("id", authUserId)
          .maybeSingle<UserRow>();

        if (userError || !userRow) {
          return null;
        }

        return {
          id: authUserId,
          email,
          shopId: userRow.shop_id,
          role: userRow.role,
        } satisfies {
          id: string;
          email: string;
          shopId: string;
          role: UserRow["role"];
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as {
          id: string;
          shopId: string;
          role: "owner" | "superadmin";
        };
        token.userId = u.id;
        token.shopId = u.shopId;
        token.role = u.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (!token.userId || !token.shopId || !token.role) {
        return session;
      }

      session.user = {
        ...(session.user ?? {}),
        userId: token.userId,
        shopId: token.shopId,
        role: token.role,
      };
      return session;
    },
  },
};

export const nextAuthCredentialsSchema = {
  email: "string",
  password: "string",
} as const satisfies Record<keyof Credentials, "string">;

