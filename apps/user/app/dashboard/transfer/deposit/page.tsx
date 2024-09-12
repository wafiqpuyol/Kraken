import React from 'react'
import { Deposit } from "@repo/ui/Deposit"
import { addMoneyAction } from '../../../../lib/deposit'
import { getServerSession } from "next-auth"
import { prisma } from '@repo/db/client'
import { Balance } from '@repo/db/type'
import { authOptions } from "@repo/network"
const page = async () => {
    const session = await getServerSession(authOptions);
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
    return (
        <Deposit userBalance={userBalance} addMoneyAction={addMoneyAction} />
    )
}


export default page