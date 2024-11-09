import { notification } from "@repo/db/type"

export type INotificationTemplate = notification & { receiver_id: number }