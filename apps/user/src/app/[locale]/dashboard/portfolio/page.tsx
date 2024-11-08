import { useRedirectToLogin } from "../../../../hooks/useRedirect"
import { Portfolio } from "@repo/ui/Portfolio"
import { prisma } from "@repo/db/client";
import { p2ptransfer } from "@repo/db/type";
import { authOptions } from "@repo/network";
import { getServerSession } from "next-auth"
import { redisManager } from "@repo/cache/redisManager";

type Accumulator = {
    internationalAmount: number
    domesticAmount: number
    date: Date
}[]

const Home = async ({ params: { locale } }: { params: { locale: string } }) => {
    await useRedirectToLogin(locale, "/login")
    let onRamps
    let p2pTransfers
    const session = await getServerSession(authOptions)

    onRamps = await redisManager().getCache(`${session?.user?.uid}getAllOnRampTransactions`)
    p2pTransfers = await redisManager().getCache(`${session?.user?.uid}_getAllP2PTransactions`)
    if (!p2pTransfers || !onRamps) {
        onRamps = await prisma.onramptransaction.findMany({ where: { userId: session?.user?.uid } })
        p2pTransfers = await (await prisma.p2ptransfer.findMany({
            where: { fromUserId: session?.user?.uid },
            select: {
                amount: true,
                currency: true,
                transactionCategory: true,
                status: true,
                transactionID: true,
                domestic_trxn_fee: true,
                international_trxn_fee: true,
                fee_currency: true,
                receiver_name: true,
                sender_name: true,
                timestamp: true,
            }
        }))
        await redisManager().setCache(`${session?.user?.uid}_getAllOnRampTransactions`, onRamps)
        await redisManager().setCache(`${session?.user?.uid}_getAllP2PTransactions`, p2pTransfers)
    };
    p2pTransfers = p2pTransfers.
        // @ts-ignore
        reduce((acc: Accumulator, init: p2ptransfer) => {
            if (init.transactionCategory === "International") {
                acc.push({ internationalAmount: init.amount / 100, domesticAmount: 0, date: init.timestamp, ...init })
            } else {
                acc.push({ domesticAmount: init.amount / 100, internationalAmount: 0, date: init.timestamp, ...init })
            }
            return acc;
        }, [])
    return (
        <div><Portfolio onRamps={onRamps} p2pTransfers={p2pTransfers} /></div>
    )
}

export default Home