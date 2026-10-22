import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === "/wp-admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/wp-admin/";
    return NextResponse.redirect(url, 308);
  }
  if (/^\/wp-admin(?:\/|$)/i.test(path) && !path.startsWith("/wp-admin")) {
    const url = request.nextUrl.clone();
    url.pathname = path.replace(/^\/wp-admin/i, "/wp-admin");
    return NextResponse.redirect(url, 308);
  }
  if (
    path.length > 1 &&
    path.endsWith("/") &&
    !/^\/(wp-admin|wp-json|wp-content|wp-includes|wc-api)(\/|$)/.test(path)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = path.replace(/\/+$/, "");
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
