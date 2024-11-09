import { Kafka, Consumer, logLevel } from "kafkajs"
import { BROKERS, CLIENT_ID, GROUP_ID } from "./config"
import { Topic, MessageHandler, MessageType, TOPIC_TYPE } from "./types/broker.type"
import { UserManager } from "./userManager"

export class Broker {
    private static instance: Broker
    private kafkaClient: Kafka
    private consumer: Consumer | null = null
    public currentSocketClientId: string | null = null

    private constructor() {
        this.kafkaClient = new Kafka({
            clientId: CLIENT_ID,
            brokers: BROKERS,
            logLevel: logLevel.INFO,
        })
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new Broker()
        }
        return this.instance
    }

    async connectConsumer<T>(): Promise<T> {
        if (this.consumer) {
            return this.consumer as unknown as T;
        }

        this.consumer = this.kafkaClient.consumer({
            groupId: GROUP_ID,
        });

        await this.consumer.connect();
        this.consumer.on("consumer.connect", () => {
            console.log("connected to kafka");
        })
        return this.consumer as unknown as T;
    };

    async disconnectConsumer() {
        if (this.consumer) {
            await this.consumer.disconnect();
        }
    };

    async subscribe(
        messageHandler: MessageHandler,
        topic: TOPIC_TYPE
    ) {
        const consumer = await this.connectConsumer<Consumer>();
        await consumer.subscribe({ topic: topic, fromBeginning: true });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                if (topic !== Topic.NOTIFICATION) {
                    return;
                }
                if (message.key && message.value) {
                    const inputMessage: MessageType = JSON.parse(message.value.toString());
                    if (!UserManager.getInstance().getUser(inputMessage.receiver_id.toString())) {
                        return
                    }
                    await messageHandler(inputMessage)
                    await consumer.commitOffsets([
                        { topic, partition, offset: (Number(message.offset) + 1).toString() },
                    ]);
                }
            },
        });
    };
}