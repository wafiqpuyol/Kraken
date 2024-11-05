import { IDepositPayload } from "../dto"
import { MessageBroker } from "../utils/broker/message-broker"
import { Topic, EventType } from "../utils/broker/broker.type"

export const depositService = async (payload: IDepositPayload) => {
    try {
        const publishedData = {
            topic: Topic.DEPOSIT,
            event: EventType.DEPOSIT,
            message: payload
        }
        await MessageBroker.publish(publishedData)
    } catch (error) {
        console.log("depositService ==>", error);
        throw error
    }
}