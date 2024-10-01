import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from "next/server"


const intlMiddleware = createMiddleware(routing);


export default function middleware(req: NextRequest) {
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