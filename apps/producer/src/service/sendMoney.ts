import { MessageBroker } from "../utils/broker/message-broker"
import { Topic, EventType } from "../utils/broker/broker.type"
import { prisma } from "@repo/db/client"

export const sendMoneyService = async (payload: { payload: string }) => {
    try {
        const parsedPayload = JSON.parse(payload.payload)
        const isTransactionOutboxExist = await prisma.transaction_outbox.findFirst({
            where: {
                transactionId: parsedPayload.transactionId
            }
        })
        if (!isTransactionOutboxExist) return;
        const publishedData = {
            topic: Topic.SENDMONEY,
            event: EventType.SENDMONEY,
            message: isTransactionOutboxExist
        }
        await MessageBroker.publish(publishedData)

        await prisma.transaction_outbox.delete({
            where: {
                id: isTransactionOutboxExist.id
            }
        })
    } catch (error) {
        console.log("sendMoneyService ==>", error);
        throw error
    }
}