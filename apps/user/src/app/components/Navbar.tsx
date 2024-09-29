"use client"

import { usePathname } from 'next/navigation'
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@repo/ui/Button"
import { signOut } from "next-auth/react"
import { Profile } from "@repo/ui/Profile"
import { useTranslations, useLocale } from 'next-intl';
import { ButtonSkeleton } from "@repo/ui/ButtonSkeleton"

interface NavbarProps {
    disable2fa: () => Promise<void>
}

export const Navbar: React.FC<NavbarProps> = ({ disable2fa }) => {
    const pathName = usePathname()
    const session = useSession();
    const locale = useLocale();
    const t = useTranslations('Navbar')

    const handleClick = async () => {
        await disable2fa()
        signOut({ callbackUrl: `/${locale}/login` })
    }

    return (
        <nav className="bg-purple-600 px-8 py-6 flex justify-between items-center relative">
            <Link href={`/${locale}`}>
                <img className="w-32" src='http://localhost:3000/kraken.webp' alt="Kraken Logo" />
            </Link>
            {
                !session.data?.user
                    ?
                    <div className='flex gap-8'>
                        <ButtonSkeleton />
                        <ButtonSkeleton />
                    </div>
                    :
                    <div className="flex space-x-4 sticky">
                        {
                            session.data?.user?.isTwoFAActive
                                ?
                                (session.data?.user?.isOtpVerified)
                                    ?
                                    (
                                        pathName.endsWith(`/${locale}`)
                                            ?
                                            <Button className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-zinc-200">
                                                <Link href={`/${locale}/dashboard/home`}>{t("my_account")}</Link>
                                            </Button>
                                            :
                                            <Profile>
                                                <Button className='bg-white font-medium text-slate-500 px-2 hover:bg-slate-100' onClick={handleClick}>{t("logout")}</Button>
                                            </Profile>
                                    )
                                    :
                                    (
                                        pathName.endsWith(`/${locale}`)
                                            ?
                                            <>
                                                <Button className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-zinc-200"><Link href={`/${locale}/login`}>{t("login")}</Link></Button>
                                                <Button className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-600"><Link href={`/${locale}/signup`}>{t("signUp")}</Link></Button>
                                            </>
                                            :
                                            (
                                                pathName.startsWith(`/${locale}/login`)
                                                    ?
                                                    <Button className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-600"><Link href={`/${locale}/signup`}>{t("signUp")}</Link></Button>
                                                    :
                                                    <Button className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-zinc-200"><Link href={`/${locale}/login`}>{t("login")}</Link></Button>
                                            )
                                    )
                                :
                                session.data?.user && !session.data.user.isTwoFAActive
                                    ?
                                    pathName.endsWith(`/${locale}`)
                                        ?
                                        <Button className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-zinc-200"><Link href={`/${locale}/dashboard/home`}>My Account</Link></Button>
                                        :
                                        <Profile><Button className='bg-white font-medium text-slate-500 px-2 hover:bg-slate-100' onClick={handleClick}>{t("logout")}</Button></Profile>
                                    :
                                    (
                                        pathName.endsWith(`/${locale}`)
                                            ?
                                            <>
                                                <Button className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-zinc-200"><Link href={`/${locale}/login`}>{t("login")}</Link></Button>
                                                <Button className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-600"><Link href={`/${locale}/signup`}>{t("signUp")}</Link></Button>
                                            </>
                                            :
                                            (
                                                pathName.startsWith(`/${locale}/login`)
                                                    ?
                                                    <Button className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-600"><Link href={`/${locale}/signup`}>{t("signUp")}</Link></Button>
                                                    :
                                                    <Button className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-zinc-200"><Link href={`/${locale}/login`}>{t("login")}</Link></Button>
                                            )
                                    )
                        }
                    </div>
            }
        </nav>
    )
}