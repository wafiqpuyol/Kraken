import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);
console.log("wafiq------------------------->");
export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(bn|fr|en|hi|es|ja|pt)/:path*']
};