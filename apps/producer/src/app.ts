import express from "express";
import cors from "cors";
import apiRoutes from "./routes"
import { MessageBroker } from "./utils/broker/message-broker";
import { Producer } from "kafkajs";

export const ExpressApp = async () => {
    const app = express();
    app.use(cors());
    app.use(express.json());

    const producer = await MessageBroker.connectProducer<Producer>();
    producer.on("producer.connect", () => {
        console.log("producer connected");
    });

    app.use("/api", apiRoutes);

    return app;
};