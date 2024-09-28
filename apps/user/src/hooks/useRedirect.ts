import { authOptions } from '@repo/network';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export const useRedirect = async (locale: string, path: string) => {
    const session = await getServerSession(authOptions)
    if (session?.user?.uid) {
        if (session.user.isTwoFAActive && session.user.isOtpVerified) {
            redirect(`/${locale}${path}`)
        }
        if (!session.user.isTwoFAActive) {
            redirect(`/${locale}${path}`)
        }
    }
}

export const useRedirectToLogin = async (locale: string, path: string) => {
    const session = await getServerSession(authOptions)
    if (!session?.user || !session?.user?.uid) {
        redirect(`/${locale}${path}`)
    }
    if (session?.user?.uid) {
        if (session.user.isTwoFAActive && !session.user.isOtpVerified) {
            redirect(`/${locale}${path}`)
        }
    }
}
