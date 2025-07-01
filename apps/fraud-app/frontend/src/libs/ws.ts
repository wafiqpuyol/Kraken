import { WS_SERVER_URL } from "../libs/constants"
import { HEARTBEAT_VALUE, SOCKET_CLOSE_CODE } from "../libs/constants";
import { stringToAsciiCodes } from "./utils"
import { channel as channelType } from "@/types/index"
import { getValueFromLocalStorage } from "./utils"
import { storeName } from "./constants"
import { IGlobalStateHandlersType } from "@/types/index"

const isBinary = (obj: unknown) => {
    return typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Blob]';
}


export class SignallingManager {
    public ws: WebSocket;
    private static instance: SignallingManager
    public static isConnected: boolean;
    private channel: string | undefined;
    private setConnect: ((socketInstance: SignallingManager) => void) | undefined;
    private setDisconnect: (() => void) | undefined;

    private constructor() {
        console.log("SignallingManager constructor calling");
        this.ws = new WebSocket(WS_SERVER_URL);
    }

    public static getInstance() {
        if (!this.isConnected) {
            // console.log("Again SignallingManager instance calling");
            this.instance = new SignallingManager();
            console.log("&&&&&&&&&&&&&&&&&", this.instance.ws.readyState);
        }
        return this.instance
    }

    public init(globalStateHandlers: [IGlobalStateHandlersType["processIncomingChannelMessage"], IGlobalStateHandlersType["handleStateWSConnection"]], channel?: string) {
        this.ws.onopen = () => {
            console.log("Coonection opened");
            if (this.ws.readyState === 1) {
                // call   setWSConnection() action
                // console.log("setConnect --->", this.setConnect);
                if (!this.setConnect) {
                    this.setConnect = globalStateHandlers[1]()[0]
                }
                this.setConnect(this)
            }
            if (channel) {
                this.channel = channel
                this.sendMessage(channel)
            }
            this.registerOnMessage(globalStateHandlers[0])
        };

        this.registerOnClose(globalStateHandlers)
    }
    private registerOnMessage(msgHandler?: (message: unknown, channel: channelType) => void) {
        this.ws.onmessage = (msg: MessageEvent) => {
            if (isBinary(msg.data)) {
                console.log("received binary data");
                this.sendPong()
                return
            }
            const { message, channel } = JSON.parse(msg.data)
            console.log(JSON.parse(message), channel);
            msgHandler?.(JSON.parse(message), channel)
        };
    }

    private registerOnClose(handlers: [IGlobalStateHandlersType["processIncomingChannelMessage"], IGlobalStateHandlersType["handleStateWSConnection"]]) {
        this.ws.onclose = () => {
            console.log("Entered close connection");
            // if (SignallingManager.isConnected) {
            //     const val = getValueFromLocalStorage(storeName.wsStore).state.currentActiveChannel
            //     console.log("current channel ============>", val);
            //     this.closeConnection() 
            //     if (val) {
            //         SignallingManager.getInstance().init(undefined, val)
            //     }
            // }

            if (!this.setDisconnect) {
                this.setDisconnect = handlers[1]()[1]
            }
            if (SignallingManager.isConnected) {
                //call setCloseConnection action
                this.setDisconnect()
            }
            const val = getValueFromLocalStorage(storeName.wsStore).state.currentActiveChannel
            // console.log("current channel ============>", val);
            if (val) {
                SignallingManager.getInstance().init(handlers, val)
            }
        };
    }

    private sendPong() {
        const binaryData = new Uint32Array([HEARTBEAT_VALUE, ...stringToAsciiCodes(this.channel!)])
        this.ws.send(binaryData)
    }

    private async sendMessage(channel: string) {
        console.log(channel);
        this.ws.send(channel)
    }

    public closeConnection() {
        console.log("BYE BYE");
        this.ws.close(SOCKET_CLOSE_CODE, this.channel)
    }
}