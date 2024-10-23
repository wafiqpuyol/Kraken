import React from 'react'
import { SecurityTab } from "@repo/ui/SecurityTab"
import { authOptions } from '@repo/network'
import { getServerSession } from "next-auth"
import { prisma } from "@repo/db/client"
import { user } from "@repo/db/type"
import { getTwoFASecret, activate2fa, getWithDrawTwoFASecret, remove2fa } from "../../../../../lib/twoFA"
import { changePasswordAction } from "../../../../../lib/auth"
import { useRedirectToLogin } from "../../../../../hooks/useRedirect"
import { verifyMasterKeyOTP, createMasterKey, verifyPasskey, isMasterKeyActiveAndVerified } from "../../../../../lib/masterkey"

async function page({ params: { locale } }: { params: { locale: string } }) {
    await useRedirectToLogin(locale, "/login")
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findFirst({ where: { id: session?.user?.uid } }) as user
    const isWithDrawTwoFaEnabled = (await prisma.wallet.findFirst({ where: { userId: user.id } }))?.withDrawTwoFAActivated ?? false
    const isMasterKeyOTPVerified = (await verifyMasterKeyOTP())?.masterKeyOTPVerified as boolean
    const { activate: isMasterKeyActivated } = await isMasterKeyActiveAndVerified()
    return (
        <SecurityTab getTwoFASecret={getTwoFASecret} getWithDrawTwoFASecret={getWithDrawTwoFASecret} verifyMasterKeyOTP={verifyMasterKeyOTP}
            activate2fa={activate2fa} isTwoFaEnabled={user.twoFactorActivated} isMasterKeyOTPVerified={isMasterKeyOTPVerified}
            isWithDrawTwoFaEnabled={isWithDrawTwoFaEnabled} changePasswordAction={changePasswordAction}
            createMasterKey={createMasterKey} verifyPasskey={verifyPasskey} isMasterKeyActivated={isMasterKeyActivated}
            remove2fa={remove2fa} />
    )
}

export default page