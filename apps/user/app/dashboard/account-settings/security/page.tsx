import React from 'react'
import { SecurityTab } from "@repo/ui/SecurityTab"
import { authOptions } from '@repo/network'
import { redirect } from 'next/navigation'
import { getServerSession } from "next-auth"
import { prisma } from "@repo/db/client"
import { user } from "@repo/db/type"
import { getTwoFASecret, activate2fa } from "../../../../lib/twoFA"

async function page() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.uid) {
        redirect("/login")
    }
    const user = await prisma.user.findFirst({ where: { id: session.user.uid } }) as user

    return (
        <SecurityTab getTwoFASecret={getTwoFASecret} activate2fa={activate2fa} isTwoFaEnabled={user.twoFactorActivated} />
    )
}

export default page