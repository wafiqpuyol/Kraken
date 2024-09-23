
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
        <div className='grid grid-cols-10 min-h-[640px]'>
            <div className='overflow-hidden h-[100vh] hidden xl:block col-start-1 col-span-5'>
                <img src="./login.svg" alt="Signup" width={100} height={100} className="w-full h-full object-cover object-center" />
            </div>
            <div className='col-span-full xl:col-span-5'>
                <SignInForm activate2fa={activate2fa} isTwoFAEnabled={isTwoFAEnabled} />
            </div>
        </div>
    )
}

export default page