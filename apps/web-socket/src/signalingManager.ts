import { WebSocket } from "./types/ws.type"
import { SubscriptionManager } from "./subscriptionManager"
import { UserManager } from "./userManager"

export class SignalingManager {
    private static instance: UserManager;
    private ws: WebSocket

    constructor(ws: WebSocket) {
        this.ws = ws;
        this.registerOnClose(ws)
        this.registerOnMessage(ws)
    }

    private registerOnClose(ws: WebSocket,) {
        ws.on("close", (code: number, reason: Buffer) => {
            const userManagerInstance = UserManager.getInstance()
            if (userManagerInstance.isUserExists(reason.toString())) {
                userManagerInstance.removeUser(reason.toString())
                SubscriptionManager.getInstance().then(res => res.unsubscribe(reason.toString()))
            }
        });
    }

    public static async emit(message: string, channelName?: string, messageType?: "publish", ws?: WebSocket) {
        if (messageType === "publish" && channelName) {
            await SubscriptionManager.getInstance().then(res => res.publish(channelName, message))
        }
        if (ws) {
            ws.send(message)
        }
    }

    private registerOnMessage(ws: WebSocket) {
        ws.on("message", (message) => {
            const userManagerInstance = UserManager.getInstance()
            if (!userManagerInstance.isUserExists(message.toString())) {
                userManagerInstance.addUser(message.toString(), { instance: ws });
            }

            if (userManagerInstance.isUserExists(message.toString())) {
                SubscriptionManager.getInstance().then(res => res.subscribe(message.toString(), ws))
            }
        });
    }
}