import { IWebhookPayload } from "../../dto"

export enum Topic { DEPOSIT = "deposit" };

export type MessageType = IWebhookPayload

export type TOPIC_TYPE = Topic.DEPOSIT;

export type MessageHandler = (input: MessageType) => void;

export type MessageBrokerType = {
    connectConsumer: <T>() => Promise<T>;
    disconnectConsumer: () => Promise<void>;
    subscribe: (
        messageHandler: MessageHandler,
        topic: TOPIC_TYPE
    ) => Promise<void>;
};