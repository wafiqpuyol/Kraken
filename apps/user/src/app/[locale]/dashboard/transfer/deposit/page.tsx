import React from 'react'
import { Deposit } from "@repo/ui/Deposit"
import { addMoneyAction } from '../../../../../lib/deposit'
import { getServerSession } from "next-auth"
import { prisma } from '@repo/db/client'
import { balance, preference } from '@repo/db/type'
import { authOptions } from "@repo/network"
import { useRedirectToLogin } from "../../../../../hooks/useRedirect"

async function page({ params: { locale } }: { params: { locale: string } }) {
    await useRedirectToLogin(locale, "/login")
    const session = await getServerSession(authOptions);
    const userPreference = await prisma.preference.findFirst({ where: { userId: session?.user?.uid } }) as preference
    let getBalance = await prisma.balance.findFirst({
        where: {
            userId: session?.user?.uid
        }
    });

    const userBalance: Omit<balance, "id"> = {
        amount: getBalance?.amount || 0,
        locked: getBalance?.locked || 0,
        userId: getBalance?.userId || 0
    }
    return (
        <Deposit userBalance={userBalance} addMoneyAction={addMoneyAction} userPreference={userPreference} />
    )
}


export default page