import { MessageBroker } from "../utils/broker/message-broker"
import { Topic, EventType } from "../utils/broker/broker.type"

export const sendMoneyService = async (payload: string) => {
    try {
        const publishedData = {
            topic: Topic.SENDMONEY,
            event: EventType.SENDMONEY,
            message: payload
        }
        await MessageBroker.publish(publishedData)
    } catch (error) {
        console.log("sendMoneyService ==>", error);
        throw error
    }
}