"use client"

import Image from "next/image"
import { usePathname } from 'next/navigation'
import Link from "next/link"
import { getSession } from "next-auth/react"
import { Button } from "@repo/ui/Button"
import { signOut } from "next-auth/react"
import { Profile } from "@repo/ui/Profile"
import { useTranslations, useLocale } from 'next-intl';
import { ButtonSkeleton } from "@repo/ui/ButtonSkeleton"
import { useEffect, useState } from 'react'
import { disableMasterKey, isMasterKeyActiveAndVerified } from '../lib/masterkey'

interface NavbarProps {
    disable2fa: (twoFAType: "signInTwoFA" | "withDrawTwoFA") => Promise<void>
    maserKeyVerificationStatus: {
        activate: boolean;
        verified: boolean;
    }
}

export const Navbar: React.FC<NavbarProps> = ({ disable2fa, maserKeyVerificationStatus }) => {
    const pathName = usePathname()
    const [session, setSession] = useState<any>(null)
    const locale = useLocale();
    const t = useTranslations('Navbar')
    const [showSkeleton, setShowSkeleton] = useState(true)
    const [masterKeyStatus, setMaseterKeyStatus] = useState<NavbarProps["maserKeyVerificationStatus"]>(maserKeyVerificationStatus)

    useEffect(() => {
        const timeOutId = setTimeout(async () => {
            setShowSkeleton(false)
        }, 1500);
        (async () => setSession(await getSession()))()
        return () => {
            clearTimeout(timeOutId);
            setShowSkeleton(true);
        }
    }, [pathName.endsWith("/login")])

    useEffect(() => {
        if (session && session.user.isTwoFAActive && !session.user.isOtpVerified
            && !masterKeyStatus.verified) {
            (async () => setMaseterKeyStatus(await isMasterKeyActiveAndVerified()))()
        }
    }, [session])

    const handleClick = async () => {
        await disable2fa("signInTwoFA")
        await disableMasterKey()
        signOut({ callbackUrl: `/${locale}/login` })
    }

    return (
        <div className="bg-purple-600 px-8 flex justify-between items-center fixed w-full z-10">
            <Link href={`/${locale}`}>
                <Image width={140} height={140} src='/kraken.webp' alt="Kraken Logo" />
            </Link>
            {
                showSkeleton
                    ?
                    <div className='flex gap-8'>
                        <ButtonSkeleton />
                        <ButtonSkeleton />
                    </div>
                    :
                    <div className="flex space-x-4 sticky">
                        {
                            session?.user?.isTwoFAActive
                                ?
                                (session?.user?.isOtpVerified)
                                    ?
                                    (
                                        pathName.endsWith(`/${locale}`)
                                            ?
                                            <Button className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-zinc-200">
                                                <Link href={`/${locale}/dashboard/portfolio`}>{t("my_account")}</Link>
                                            </Button>
                                            :
                                            <Profile>
                                                <Button className='bg-white font-medium text-slate-500 px-1 hover:bg-slate-100' onClick={handleClick}>{t("logout")}</Button>
                                            </Profile>
                                    )
                                    :
                                    (
                                        masterKeyStatus?.activate && masterKeyStatus.verified
                                            ?
                                            pathName.endsWith(`/${locale}`)
                                                ?
                                                <Button className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-zinc-200">
                                                    <Link href={`/${locale}/dashboard/portfolio`}>{t("my_account")}</Link>
                                                </Button>
                                                :
                                                <Profile>
                                                    <Button className='bg-white font-medium text-slate-500 px-1 hover:bg-slate-100' onClick={handleClick}>{t("logout")}</Button>
                                                </Profile>
                                            :
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
                                session?.user && !session.user.isTwoFAActive
                                    ?
                                    pathName.endsWith(`/${locale}`)
                                        ?
                                        <Button className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-zinc-200"><Link href={`/${locale}/dashboard/portfolio`}>{t("my_account")}</Link></Button>
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
        </div>
    )
}