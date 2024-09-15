import React from 'react'
import { prisma } from "@repo/db/client"
import { onramptransaction } from "@repo/db/type"
import { getServerSession } from "next-auth"
import { authOptions } from "@repo/network"
import { History } from "@repo/ui/History"

const page = async () => {
    const session = await getServerSession(authOptions)
    const getOnRampTransactions: onramptransaction[] = await prisma.onramptransaction.findMany({
        where: {
            userId: session?.user?.uid
        }
    });
    const onRamps = getOnRampTransactions.map((obj: onramptransaction) => ({
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