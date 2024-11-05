export enum EventType {
    DEPOSIT = "deposit_event",
    NOTIFICATION = "notification_event",
}

export enum Topic {
    DEPOSIT = "deposit",
    NOTIFICATION = "notification",
};

export type TOPIC_TYPE = Topic.DEPOSIT | Topic.NOTIFICATION;

export interface PublishType {
    headers?: Record<string, any>;
    topic: TOPIC_TYPE;
    event: EventType;
    message: Record<string, any>;
}

export type MessageBrokerType = {
    connectProducer: <T>() => Promise<T>;
    disconnectProducer: () => Promise<void>;
    publish: (data: PublishType) => Promise<void>;
};