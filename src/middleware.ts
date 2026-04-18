import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname;
    const tokenRole = req.nextauth.token?.role;

    if (pathname.startsWith("/superadmin") && tokenRole !== "superadmin") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    return NextResponse.next();
  },
  {
    pages: { signIn: "/login" },
  },
);

export const config = {
  matcher: ["/dashboard/:path*", "/superadmin/:path*"],
};

