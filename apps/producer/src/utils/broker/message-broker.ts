import { Kafka, logLevel, Producer } from "kafkajs";
import { MessageBrokerType, PublishType, Topic } from "./broker.type";
import { BROKERS, CLIENT_ID, NUMBER_OF_PARTITIONS } from "../../config"

const kafka = new Kafka({
    clientId: CLIENT_ID,
    brokers: BROKERS,
    logLevel: logLevel.INFO,
});

let producer: Producer;

const createTopic = async (topic: string[]) => {
    const topics = topic.map((t) => ({
        topic: t,
        numPartitions: NUMBER_OF_PARTITIONS,
        replicationFactor: 1,
    }));

    const admin = kafka.admin();
    await admin.connect();
    const topicExists = await admin.listTopics();

    for (const t of topics) {
        if (!topicExists.includes(t.topic)) {
            await admin.createTopics({
                topics: [t],
            });
        }
    }
    await admin.disconnect();
};

const connectProducer = async <T>(): Promise<T> => {
    await createTopic([Topic.DEPOSIT, Topic.NOTIFICATION]);

    if (producer) {
        return producer as unknown as T;
    }

    producer = kafka.producer();
    await producer.connect();

    return producer as unknown as T;
};

const disconnectProducer = async () => {
    if (producer) {
        await producer.disconnect();
    }
};

const publish = async (data: PublishType) => {
    const producer = await connectProducer<Producer>();
    const result = await producer.send({
        topic: data.topic,
        messages: [
            {
                headers: data.headers,
                key: data.event,
                value: JSON.stringify(data.message),
            },
        ],
    });
};

export const MessageBroker: MessageBrokerType = {
    connectProducer,
    disconnectProducer,
    publish
};