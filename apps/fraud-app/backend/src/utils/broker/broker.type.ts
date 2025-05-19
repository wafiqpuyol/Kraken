import { ISendMoneyPayload } from "../../dto"

export enum Topic { SENDMONEY = "send_money" };

export type MessageType = ISendMoneyPayload

export type TOPIC_TYPE = Topic.SENDMONEY;

export type MessageHandler = (input: MessageType) => void;

export type MessageBrokerType = {
    connectConsumer: <T>() => Promise<T>;
    disconnectConsumer: () => Promise<void>;
    subscribe: (
        messageHandler: MessageHandler,
        topic: TOPIC_TYPE
    ) => Promise<void>;
};