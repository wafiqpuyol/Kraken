import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { CHARGE, EXCHANGE_RATE } from "@repo/ui/constants"
import { SUPPORTED_CURRENCY_ENUM } from "@repo/ui/types"
import { Dispatch, SetStateAction } from "react"
import { Session } from "next-auth"
import { toast, } from "../components/molecules/Toaster/use-toast"
import { startAuthentication } from "@simplewebauthn/browser"
import { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/types"
import { notification } from "@repo/db/type"
import { WS_SERVER_URL } from "./constant"
import { HEARTBEAT_VALUE, SOCKET_CLOSE_CODE } from "./constant"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatAmount(val: string, precision: number): string {
    if (val.length === 0) return "NaN"
    if (Number.isInteger(parseFloat(val))) {
        return val;
    } else {
        const firstHalf = val.split(".")[0]
        // @ts-ignore
        if (precision === 0) return firstHalf
        // @ts-ignore
        const secondHalf = val.split(".")[1].slice(0, 2)
        return firstHalf + "." + secondHalf
    }
}

export const formatDay = () => {
    const date = new Date(Date.now()).getDate().toString()
    if (date.toString().length === 1) {
        return 0 + date
    }
    return date
}

export const senderAmountWithFee = (payload: { amount: string, walletCurrency: SUPPORTED_CURRENCY_ENUM, transactionType: string, selectedCurrency: SUPPORTED_CURRENCY_ENUM }) => {

    const senderAmount = parseFloat(payload.amount)
    if (payload.transactionType === "Domestic") {
        return (senderAmount + parseInt(CHARGE[payload.walletCurrency].domestic_charge)) * 100
    }
    if (payload.transactionType === "International") {
        const convertedExchangeRate = 1 / parseFloat(EXCHANGE_RATE[payload.walletCurrency][payload.selectedCurrency] as string)
        const amountWithExchangeRate = ((senderAmount * convertedExchangeRate) + parseInt(CHARGE[payload.walletCurrency].international_charge)) * 100
        // @ts-ignore
        return parseInt(amountWithExchangeRate)
    }
}
// @ts-ignore
export const calculateAmountOnDemand = (setAmountError?: Dispatch<SetStateAction<string | null>>, session?: Session, selectedCurrency: string | null, walletCurrency: string | undefined, amount: string) => {
    if (isNaN(parseFloat(amount))) return;
    const userBalance = session?.user?.total_balance
    const senderAmount = parseFloat(amount)
    const convertedExchangeRate = 1 / parseFloat(EXCHANGE_RATE[walletCurrency as keyof typeof SUPPORTED_CURRENCY_ENUM][selectedCurrency as keyof typeof SUPPORTED_CURRENCY_ENUM] as string)
    const amountWithExchangeRate = ((senderAmount * convertedExchangeRate) + parseInt(CHARGE[walletCurrency as keyof typeof SUPPORTED_CURRENCY_ENUM].international_charge)) * 100
    // @ts-ignore
    const isExceeding = amountWithExchangeRate > (parseInt(userBalance))

    if (setAmountError && isExceeding) {
        setAmountError("Can't send more than the current balance")
    }

    return parseInt(amountWithExchangeRate.toString()) / 100
}

export const formatTimestamp = (timestamp: number) => {
    const now = new Date().getTime();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);

    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);


    if (days > 0) {
        return `${days}d ago`;
    } else if (hours > 0) {
        return `${hours}h ago`;
    } else if (minutes > 0) {
        return `${minutes}m ago`;
    } else {
        return `${seconds}s   
   ago`;
    }
}
export const responseHandler = (res: any) => {
    switch (res.status) {
        case 200:
            return toast({
                title: `${res.message}`,
                variant: "default",
                className: "bg-green-500 text-white rounded-xl",
                duration: 3000
            })
            break;
        case 201:
            return toast({
                title: `${res.message}`,
                variant: "default",
                className: "bg-green-500 text-white rounded-xl"
            })
            break;
        case 400:
            return toast({
                title: `${res.message}`,
                variant: "destructive",
                className: "bg-red-500 text-white rounded-xl",
                duration: 3000
            })
            break;
        case 401:
            return toast({
                title: `${res.message}`,
                variant: "destructive",
                className: "bg-red-500 text-white rounded-xl",
                duration: 3000
            })
            break;
        case 404:
            return toast({
                title: `${res.message}`,
                variant: "destructive",
                className: "bg-red-500 text-white rounded-xl",
                duration: 3000
            })
            break;
        case 405:
            return toast({
                title: `${res.message}`,
                variant: "destructive",
                className: "bg-red-500 text-white rounded-xl",
                duration: 3000
            })
            break;
        case 409:
            return toast({
                title: `${res.message}`,
                variant: "destructive",
                className: "bg-red-500 text-white rounded-xl",
                duration: 3000
            })
            break;
        case 422:
            return toast({
                title: `${res.message}`,
                variant: "destructive",
                className: "bg-red-500 text-white rounded-xl",
                duration: 3000
            })
            break;
        case 500:
            return toast({
                title: `${res.message}`,
                variant: "destructive",
                className: "bg-red-500 text-white rounded-xl",
                duration: 3000
            })
        case 503:
            return toast({
                title: `${res.message}`,
                variant: "destructive",
                className: "bg-red-500 text-white rounded-xl",
                duration: 3000
            })
        default:
            toast({
                title: res.message,
                variant: "destructive",
                className: "text-white bg-red-500",
                duration: 3000
            })
            break;
    }
}

export const validatePasskey = async (verifyPasskey: (step: "generateAuthentication" | "verifyAuthentication", regCred?: any) => Promise<{
    message: string; status: number; challenge?: PublicKeyCredentialRequestOptionsJSON
}>, res: {
    message: string;
    status: number;
    challenge?: PublicKeyCredentialRequestOptionsJSON;
}) => {
    try {
        res = await verifyPasskey("generateAuthentication")
        if (res.status === 200) {
            const authResponse = await startAuthentication(res.challenge)
            res = await verifyPasskey("verifyAuthentication", { challenge: res.challenge, authResponseJSON: authResponse })
            return res
        }
        if (res.status !== 200) {
            return res
        }
    } catch (error) {
        return res
    }
}

const isBinary = (obj: any) => {
    return typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Blob]';
}

export class SignallingManager {
    public ws: WebSocket;
    private static instance: SignallingManager
    public session: Session
    public static isConnected: boolean;
    private setTotalNotifications!: Dispatch<SetStateAction<notification[]>>
    private setTotalNumberOfUnreadNotificationCount!: Dispatch<SetStateAction<number>>
    private setUserTotalBalance!: Dispatch<SetStateAction<number>>

    private constructor(session: Session) {
        this.ws = new WebSocket(WS_SERVER_URL);
        this.session = session
    }

    public static getInstance(session: Session) {
        if (this.isConnected) {
            this.instance = new SignallingManager(session);
        }
        return this.instance
    }

    public init(
        setTotalNotifications: Dispatch<SetStateAction<notification[]>>,
        setTotalNumberOfUnreadNotificationCount: Dispatch<SetStateAction<number>>,
        setUserTotalBalance: Dispatch<SetStateAction<number>>
    ) {
        this.setTotalNotifications = setTotalNotifications
        this.setTotalNumberOfUnreadNotificationCount = setTotalNumberOfUnreadNotificationCount
        this.setUserTotalBalance = setUserTotalBalance

        this.ws.onopen = () => {
            this.sendMessage()
        };

        this.registerOnMessage()
        this.registerOnClose()
    }
    private registerOnMessage() {
        this.ws.onmessage = (msg: MessageEvent) => {
            if (isBinary(msg.data)) {
                this.sendPong()
                return
            }
            const parsedData = JSON.parse(msg.data);
            this.setTotalNotifications!((prev: any) => {
                return [parsedData, ...prev]
            })
            this.setTotalNumberOfUnreadNotificationCount!((prev: any) => {
                return prev + 1
            })

            this.setUserTotalBalance!(this.session?.user?.total_balance! + (JSON.parse(parsedData.message).amount))
        };
    }

    private registerOnClose() {
        this.ws.onclose = () => {
            if (SignallingManager.isConnected) {
                SignallingManager.getInstance(this.session).init(this.setTotalNotifications,
                    this.setTotalNumberOfUnreadNotificationCount,
                    this.setUserTotalBalance)
            }
        };
    }

    private sendPong() {
        const binaryData = new Uint32Array([HEARTBEAT_VALUE, this.session?.user?.uid!])
        this.ws.send(binaryData)
    }

    private async sendMessage() {
        this.ws.send((this.session?.user?.uid!).toString())
    }

    public closeConnection() {
        this.ws.close(SOCKET_CLOSE_CODE, (this.session?.user?.uid!).toString())
    }
}