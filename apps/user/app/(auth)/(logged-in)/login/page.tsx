
import React from 'react'
import { SignInForm } from "@repo/ui/SignInForm"
import { getServerSession } from "next-auth"
import { redirect } from 'next/navigation'
import { authOptions } from '@repo/network'
import { prisma } from "@repo/db/client"
import { user } from "@repo/db/type"
import { activate2fa } from "../../../../lib/twoFA"

async function page() {
    const session = await getServerSession(authOptions)
    if (session?.user || session?.user?.uid) {
        redirect("/dashboard/home")
    }
    const user = await prisma.user.findFirst({ where: { id: session?.user?.uid } }) as user
    const isTwoFAEnabled = user.twoFactorActivated;
    return (
        <div>
            <SignInForm activate2fa={activate2fa} isTwoFAEnabled={isTwoFAEnabled} />
        </div>
    )
}

export default page