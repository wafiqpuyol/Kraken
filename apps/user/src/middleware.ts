import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from "next/server"
import axios from "axios"
import { getToken, JWT } from "next-auth/jwt"

const intlMiddleware = createMiddleware(routing);
let sessionData: JWT | null = null
const getSessionDataFromToken = async (req: NextRequest) => {
    if (sessionData !== null) return sessionData;
    sessionData = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
}

export default async function middleware(req: NextRequest) {
    await getSessionDataFromToken(req)
    if (!req.cookies.get("next-auth.session-token")) {
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/twofa`, { sessionData })
        } catch (error) {
            return intlMiddleware(req);
        }
    }
    if (req.nextUrl.pathname === "/") return intlMiddleware(req);

    const isPublicPage = routing.locales.includes(req.nextUrl.pathname.split("/")[1] as any)
    // const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);
    console.log(isPublicPage);
    if (isPublicPage) {
        return intlMiddleware(req);
    } else {
        return NextResponse.rewrite(new URL("/not-found", req.url));
    }
}

export const config = {
    matcher: ['/((?!api|_next|.*\\..*).*)', '/(bn|fr|en|hi|es|ja|pt)/:path*']
};