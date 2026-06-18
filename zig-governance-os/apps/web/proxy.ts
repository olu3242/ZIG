import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = new Set(["/", "/login", "/signup", "/forgot-password", "/favicon.svg"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname) || request.cookies.has("zig_session")) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

function isPublic(pathname: string): boolean {
  return publicRoutes.has(pathname);
}
