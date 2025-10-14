import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth

    // Public routes
    const publicPaths = ["/", "/auth/signin", "/auth/signup", "/auth/error"]

    // If user is not logged in and trying to access a protected route → redirect
    if (!isLoggedIn && !publicPaths.includes(nextUrl.pathname)) {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // Otherwise, continue
    return NextResponse.next()
})

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
    ],
}
