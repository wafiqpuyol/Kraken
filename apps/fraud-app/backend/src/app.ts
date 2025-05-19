import express from "express";
import { Consumer } from "kafkajs"
import type { Express } from "express";
import cors from "cors";
import { MessageBroker } from "./utils/broker/message-broker"
import { Topic } from "./utils/broker/broker.type";
import {transactionService} from "./service/transaction"

export const expressApp = async (): Promise<Express> => {
    const app = express();
    app.use(cors());
    app.use(express.json());

    app.get("/health", (req, res) => {
        res.send("Hello World");
    })

    const consumer = await MessageBroker.connectConsumer<Consumer>();
    consumer.on("consumer.connect", () => {
        console.log("consumer connected successfully");
    });

    await MessageBroker.subscribe(transactionService, Topic.SENDMONEY)

    return app
};