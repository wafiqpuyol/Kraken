import React from 'react'
import { Deposit } from "@repo/ui/Deposit"
import { addMoneyAction } from '../../../../lib/deposit'
import { getServerSession } from "next-auth"
import { prisma } from '@repo/db/client'
import { Balance, OnRampTransaction } from '@repo/db/type'

const page = async () => {
    const session = await getServerSession();

    let getBalance = await prisma.balance.findFirst({
        where: {
            userId: session?.user?.uid
        }
    });

    const userBalance: Omit<Balance, "id"> = {
        amount: getBalance?.amount || 0,
        locked: getBalance?.locked || 0,
        userId: getBalance?.userId || 0
    }

    const getOnRampTransactions: OnRampTransaction[] = await prisma.onRampTransaction.findMany({
        where: {
            userId: session?.user?.uid
        }
    });

    const onRamps = getOnRampTransactions.map((obj: OnRampTransaction) => ({
        time: obj.startTime,
        amount: obj.amount,
        status: obj.status,
        provider: obj.provider
    }))
    return (
        <Deposit userBalance={userBalance} addMoneyAction={addMoneyAction} onRamps={onRamps} />
    )
}


export default page