import { expressApp } from "./app";
import { UserManager, WebSocket} from "./types/index";
import { WebSocketServer } from "ws";
import { PORT, WEBSOCKET_PORT } from "./config";
import { SubscriptionManager } from "./service/subscriptionManager";

const main = async () => {
    const app = await expressApp()

    app.listen(PORT, async () => {
        console.info(`Fraud App listening on port ${PORT}`)

        await SubscriptionManager.getInstance()

        const ws = new WebSocketServer({ port: Number(WEBSOCKET_PORT) });

        ws.on("connection", (socket: WebSocket) => {
            ws.on('error', console.error);
            UserManager.getInstance().startSignallingManager(socket);
        });
    })

}
main()