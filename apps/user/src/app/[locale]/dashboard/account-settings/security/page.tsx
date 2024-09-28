import React from 'react'
import { SecurityTab } from "@repo/ui/SecurityTab"
import { authOptions } from '@repo/network'
import { getServerSession } from "next-auth"
import { prisma } from "@repo/db/client"
import { user } from "@repo/db/type"
import { getTwoFASecret, activate2fa } from "../../../../../lib/twoFA"
import { changePasswordAction } from "../../../../../lib/auth"
import { useRedirectToLogin } from "../../../../../hooks/useRedirect"


async function page({ params: { locale } }: { params: { locale: string } }) {
    await useRedirectToLogin(locale, "/login")
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findFirst({ where: { id: session?.user?.uid } }) as user

    return (
        <SecurityTab getTwoFASecret={getTwoFASecret} activate2fa={activate2fa} isTwoFaEnabled={user.twoFactorActivated} changePasswordAction={changePasswordAction} />
    )
}

export default page