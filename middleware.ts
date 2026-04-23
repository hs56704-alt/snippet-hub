import {auth} from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
    "/feed",
    "/bookmarks",
    "/snippets/new",
    "/profile/edit",
]

const authRoutes = [ "/login" , "/register"];

export default auth(function middleware(req){
    const { nextUrl, auth:session } = req as NextRequest & {
        auth : { user?: { id : string }} | null;
    };


    const isLoggedIn = !!session?.user;
    const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
    );
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);

    if(isProtectedRoute && !isLoggedIn){
        const loginUrl = new URL("/login", nextUrl.origin);
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isAuthRoute && isLoggedIn) {
        return NextResponse.redirect(new URL("/feed", nextUrl.origin));
    }

    return NextResponse.next();

});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};