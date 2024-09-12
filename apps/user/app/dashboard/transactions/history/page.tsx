import React from 'react'
import { prisma } from "@repo/db/client"
import { OnRampTransaction } from "@repo/db/type"
import { getServerSession } from "next-auth"
import { authOptions } from "@repo/network"
import { History } from "@repo/ui/History"

const page = async () => {
    const session = await getServerSession(authOptions)
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
        < History onRamps={onRamps} />
    )
}

export default page