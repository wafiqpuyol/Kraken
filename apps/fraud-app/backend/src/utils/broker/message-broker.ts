import { Consumer, Kafka, logLevel } from "kafkajs";
import { MessageBrokerType, MessageHandler, MessageType, Topic, TOPIC_TYPE } from "./broker.type";
import { BROKERS, CLIENT_ID, GROUP_ID } from "../../config"

const kafka = new Kafka({
    clientId: CLIENT_ID,
    brokers: BROKERS,
    logLevel: logLevel.INFO,
});

let consumer: Consumer;

const connectConsumer = async <T>(): Promise<T> => {
    if (consumer) {
        return consumer as unknown as T;
    }
    consumer = kafka.consumer({
        groupId: GROUP_ID,
    });

    await consumer.connect();
    consumer.on("consumer.connect", () => {
        console.log("consumer-1 connected successfully");
    });
    return consumer as unknown as T;
};

const disconnectConsumer = async () => {
    if (consumer) {
        await consumer.disconnect();
    }
};

const subscribe = async (
    messageHandler: MessageHandler,
    topic: TOPIC_TYPE
) => {
    const consumer = await connectConsumer<Consumer>();
    console.log(topic);
    await consumer.subscribe({ topic: topic, fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            if (topic !== Topic.SENDMONEY) {
                return;
            }

            if (message.key && message.value) {
                const inputMessage: MessageType = JSON.parse(JSON.parse(message.value.toString()).payload);
                messageHandler(inputMessage);
                await consumer.commitOffsets([
                    { topic, partition, offset: (Number(message.offset) + 1).toString() },
                ]);
            }
        },
    });
};


export const MessageBroker: MessageBrokerType = {
    connectConsumer,
    disconnectConsumer,
    subscribe
};