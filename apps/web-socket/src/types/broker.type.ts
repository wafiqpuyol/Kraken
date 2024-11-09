import { INotificationTemplate } from "../dto"

export enum Topic { NOTIFICATION = "notification", };
export type MessageType = INotificationTemplate
export type TOPIC_TYPE = Topic.NOTIFICATION;
export type MessageHandler = (input: MessageType) => Promise<void>;