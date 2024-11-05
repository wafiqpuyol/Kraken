import express from "express";
import cors from "cors";
import { Topic, MessageType } from "./utils/broker/broker.type";
import { MessageBroker } from "./utils/broker/message-broker";
import { Consumer } from "kafkajs";
import { prisma } from "@repo/db/client"
import { redisManager } from "@repo/cache/redisManager"

export const ExpressApp = async () => {
    const app = express();
    app.use(cors());
    app.use(express.json());

    const consumer = await MessageBroker.connectConsumer<Consumer>();
    consumer.on("consumer.connect", () => {
        console.log("consumer connected successfully");
    });

    await MessageBroker.subscribe(messageHandler, Topic.DEPOSIT)

    return app;
};

const messageHandler = async (message: MessageType) => {
    try {
        const result = await prisma.$transaction([
            prisma.balance.update({
                where: {
                    userId: message.userId
                },
                data: {
                    amount: {
                        increment: (message.amount - message.lockedAmount)
                    },
                    locked: {
                        increment: message.lockedAmount
                    }
                }
            }),
            prisma.onramptransaction.update({
                where: {
                    token: message.token
                },
                data: {
                    status: message.tokenValidation,
                }
            })
        ]);
        redisManager().setCache("getAllOnRampTransactions", result[1])
    } catch (error) {
        console.log("messageHandler ---->", error);
    }
}