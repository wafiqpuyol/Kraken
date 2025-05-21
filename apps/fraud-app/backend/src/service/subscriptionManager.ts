import { createClient, RedisClientType } from "redis"
import { WebSocket } from "../types/index"
import { Broker } from "../utils/broker/brokerManager"
import { Topic } from "../utils/broker/broker.type";
import { SignalingManager } from "./signalingManager"
import { MessageType } from "../utils/broker/broker.type"
// import { redisManager } from "@repo/cache/redisManager"
import {handleTransaction} from "./handleTransaction"

export class SubscriptionManager {
    private static instance: SubscriptionManager
    private redisPubSubClient: RedisClientType
    private redisCommandExecutionClient: RedisClientType
    private subscription: Map<string, { [key: string]: any }> = new Map()
    private ws: WebSocket | null = null

    private constructor() {
        this.redisCommandExecutionClient = createClient({ url: "redis://localhost:6379" })
        this.redisCommandExecutionClient
            .on("error", err => console.warn("Redis CommandExecution Client Error, ", err))
            .connect()
        this.redisPubSubClient = createClient({ url: "redis://localhost:6379" })
        this.redisPubSubClient
            .on("error", err => console.warn("Redis PubSub Client Error, ", err))
            .connect()
    }

    public static async getInstance() {
        if (!this.instance) {
            this.instance = new SubscriptionManager()
            await Broker.getInstance().connectConsumer()
            await Broker.getInstance().subscribe(handleTransaction,Topic.SENDMONEY)
        }
        return this.instance
    }

    public async publish(channelName: string, message: string) {
        this.redisCommandExecutionClient.publish(channelName, message)
    }

    public async subscribe(channelName: string, ws: WebSocket) {
        this.ws = ws
        if (this.subscription.has(channelName)) {
            this.subscription.get(channelName)!.instance = ws
            return
        }

        this.subscription.set(channelName, { instance: ws })
        await this.redisPubSubClient.subscribe(channelName, (message: string, channel) => {
            this.subscription.get(channelName)!.instance.send(JSON.stringify({ message, channel }))
        })
        console.log(this.subscription);
    }

    public async unsubscribe(channelName: string) {
        if (this.subscription.has(channelName.toString())) {
            this.ws = null
            await this.redisPubSubClient.UNSUBSCRIBE(channelName)
            this.subscription.delete(channelName)
            return
        }
        console.log("channel id does not exist", channelName);
    }

    public channelExists(channelName: string) {
        console.log(this.subscription);
        return this.subscription.has(channelName)
    }
}