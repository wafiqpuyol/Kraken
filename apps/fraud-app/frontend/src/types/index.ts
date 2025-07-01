export type TransactionStatus = "Completed" | "Pending" | "Failed" | "Flagged" | "Reviewing"
export interface Transaction {
    id: string
    userId: string
    userName: string
    amount: number
    currency: string
    status: TransactionStatus
    timestamp: Date
    // source: {
    //     type: string
    //     details: string
    // }
    // destination: {
    //     type: string
    //     details: string
    // }
    riskScore: number
    location: string
    ipAddress: string
    device?: string
    flags?: string[]
    type: string
}
export type TransactionType = "transfer" | "deposit" | "withdrawal" | "payment" | "exchange"

export interface MonitoringData {
    id: string
}
export type compoundMessageType = Transaction | MonitoringData
export type channel = realtimeTab
export type normalTab = "overview" | "predictive" | "workflow" | "geographic" | "team" | "risk" | "trends" | "distribution" | "activity" | "executive" | "all";
export type realtimeTab = "realtime_monitor" | "realtime_transaction";
export type { SignallingManager } from "@/libs/ws";
export type wsConnectionStatus = "Disconnected" | "Connecting" | "Connected" | "Closing" | "Closed";
export interface IGlobalStateHandlersType {
    processIncomingChannelMessage: (message: unknown, channel: string, extraArgs:{
        isForcefullyDisconnect: boolean
    }) => void, 
    handleStateWSConnection: () => void
}
// bufferStore's key will be the realTimeTab items
export interface IBufferStore {
    "realtime_transaction": Transaction[] | [],
    "realtime_monitor": MonitoringData[] | []
}
export type AllChannelStreamData = Transaction | MonitoringData