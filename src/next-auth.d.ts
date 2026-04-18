import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      userId: string;
      shopId: string;
      role: "owner" | "superadmin";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    shopId?: string;
    role?: "owner" | "superadmin";
  }
}

