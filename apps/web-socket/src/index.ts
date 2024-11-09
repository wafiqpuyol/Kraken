import { UserManager, WebSocket, WebSocketServer, SignalingManager } from "./types/ws.type";
import { PORT } from "./config"


const ws = new WebSocketServer({ port: PORT });

ws.on("connection", (socket: WebSocket) => {
    ws.on('error', console.error);
    UserManager.getInstance().startSignallingManager(socket)
    // SignalingManager.emit("hello from server", undefined, undefined, socket)
});