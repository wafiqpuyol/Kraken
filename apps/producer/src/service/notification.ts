import { MessageBroker } from "../utils/broker/message-broker"
import { Topic, EventType } from "../utils/broker/broker.type"
import { INotificationTemplate } from "../dto"

export const notificationService = async (payload: INotificationTemplate) => {
    try {
        const publishedData = {
            topic: Topic.NOTIFICATION,
            event: EventType.NOTIFICATION,
            message: payload
        }
        await MessageBroker.publish(publishedData)
    } catch (error) {
        console.log("notificationService ==>", error);
        throw error
    }
}