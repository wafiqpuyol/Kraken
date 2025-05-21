import express from "express";
import type { Express } from "express";
import cors from "cors";

export const expressApp = async (): Promise<Express> => {
    const app = express();
    app.use(cors());
    app.use(express.json());

    app.get("/health", (req, res) => {
        res.send("Hello World");
    })

    return app
};