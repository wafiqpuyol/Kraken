import { WebSocket, RawData } from "./types/ws.type"
import { CLOSED } from "ws"
import { SubscriptionManager } from "./subscriptionManager"
import { UserManager } from "./userManager"
import { HEARTBEAT_VALUE, HEARTBEAT_INTERVAL } from "./utils/constant";

export class SignalingManager {
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
            await SubscriptionManager.getInstance().then(res => {
                if (res.channelExists(channelName)) {
                    console.log("channel doesn't exist");
                }
                res.publish(channelName, message)
            })
        }
        if (ws) {
            ws.send(message)
        }
    }

    private registerOnMessage(ws: WebSocket) {
        ws.on("message", async (message: RawData, isBinary) => {
            const userManagerInstance = UserManager.getInstance()
            if (isBinary) {
                const pongResponse = new Uint32Array(new Uint8Array((message as any)).buffer);
                if (pongResponse[0] === HEARTBEAT_VALUE) {
                    UserManager.getInstance().updateUser(`${pongResponse[1]}`, true)
                    return
                }
            }

            if (userManagerInstance.getUser(message.toString())?.instance?.readyState === CLOSED) {
                userManagerInstance.removeUser(message.toString())
                const subscribeManagerInstance = await SubscriptionManager.getInstance()
                await subscribeManagerInstance.unsubscribe(message.toString())
            }
            if (!userManagerInstance.isUserExists(message.toString())) {
                userManagerInstance.addUser(message.toString(), { instance: ws, isAlive: true });
            }

            if (userManagerInstance.isUserExists(message.toString())) {
                SubscriptionManager.getInstance().then(res => res.subscribe(message.toString(), ws))
                SignalingManager.sendPing()
            }
        });
    }

    public static sendPing = () => {
        const timer = setInterval(async () => {
            const allWSClients = UserManager.getInstance().getAllUsers();

            if (allWSClients.length === 0) {
                clearInterval(timer)
                return
            };

            for (let [key, value] of allWSClients) {
                if (value.instance) {
                    if (!value.isAlive) {
                        UserManager.getInstance().removeUser(key)
                        const subscribeManagerInstance = await SubscriptionManager.getInstance()
                        await subscribeManagerInstance.unsubscribe(key)
                        return;
                    }
                    value.instance.send(HEARTBEAT_VALUE, { binary: true })
                    UserManager.getInstance().updateUser(key, false)
                }
            }
        }, HEARTBEAT_INTERVAL)
    }
}