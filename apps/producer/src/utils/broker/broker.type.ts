export enum EventType {
    DEPOSIT = "deposit_event",
    NOTIFICATION = "notification_event",
    SENDMONEY = "send_money_event",
}

export enum Topic {
    DEPOSIT = "deposit",
    NOTIFICATION = "notification",
    SENDMONEY = "send_money",
};

export type TOPIC_TYPE = Topic.DEPOSIT | Topic.NOTIFICATION | Topic.SENDMONEY;

export interface PublishType {
    headers?: Record<string, any>;
    topic: TOPIC_TYPE;
    event: EventType;
    message: Record<string, any> | string;
}

export type MessageBrokerType = {
    connectProducer: <T>() => Promise<T>;
    disconnectProducer: () => Promise<void>;
    publish: (data: PublishType) => Promise<void>;
};