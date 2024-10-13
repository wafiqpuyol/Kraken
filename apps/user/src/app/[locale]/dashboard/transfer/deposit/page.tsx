import React from 'react'
import { Deposit } from "@repo/ui/Deposit"
import { addMoneyAction } from '../../../../../lib/deposit'
import { sendVerificationEmailAction } from "../../../../../lib/auth"
import { getServerSession } from "next-auth"
import { prisma } from '@repo/db/client'
import { balance, preference } from '@repo/db/type'
import { authOptions } from "@repo/network"
import { useRedirectToLogin } from "../../../../../hooks/useRedirect"
import { getAllOnRampTransactions } from "../../../../../lib/action"

async function page({ params: { locale } }: { params: { locale: string } }) {
    await useRedirectToLogin(locale, "/login")
    const session = await getServerSession(authOptions);
    const userPreference = await prisma.preference.findFirst({ where: { userId: session?.user?.uid } }) as preference
    let getBalance = await prisma.balance.findFirst({
        where: {
            userId: session?.user?.uid
        }
    });
    const onRampTransactionLimitDetail = await getAllOnRampTransactions(session?.user?.uid!)

    const userBalance: Omit<balance, "id"> = {
        amount: getBalance?.amount || 0,
        locked: getBalance?.locked || 0,
        userId: getBalance?.userId || 0,
        currency: getBalance?.currency!
    }
    return (
        <Deposit onRampTransactionLimitDetail={onRampTransactionLimitDetail} userBalance={userBalance} addMoneyAction={addMoneyAction} userPreference={userPreference} sendVerificationEmailAction={sendVerificationEmailAction} />
    )
}


export default page