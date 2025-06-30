import { channels, storeName } from "@/libs/constants"
import { useTransactionActions } from "@/store/useTransactionStore"
import { Transaction } from "@/types/index"
import { compoundMessageType, IGlobalStateHandlersType } from "@/types/index"
import { useWSActions, useForcefullyDisconnect } from "@/store/useTabs"
import { getValueFromLocalStorage } from "@/libs/utils"

export const useGlobalStateHandler = () => {
    const { addTransaction } = useTransactionActions();
    const { setWSConnection, setCloseConnection, setStoreInBufferStorage } = useWSActions()


    const processIncomingChannelMessage = (message: unknown, channel: string,) => {
        const isForcefullyDisconnect = getValueFromLocalStorage(storeName.wsStore)?.state?.forcefullyDisconnect
        channels.forEach((channelName) => {
            switch (channelName) {
                case "realtime_monitoring":
                    if (channel === "realtime_monitoring") {
                        console.log("CHANNEL NAME:", channelName);
                        console.log(message);
                    }
                    break;
                case "realtime_transaction":
                    if (channel === "realtime_transaction") {
                        console.log("CHANNEL NAME:", channelName);
                        const constructTransactionMsg = {
                            id: message.id,
                            amount: message.amount,
                            currency: message.user.preference.currency,
                            ipAddress: message.user?.ipAddress || "127.0.0.1",
                            location: message.location,
                            riskScore: message.risk,
                            status: message.status,
                            timestamp: message.createdAt,
                            userName: message.user.name,
                        } as Transaction
                        console.log(constructTransactionMsg);
                        console.log(">>>>>>>>>>>>>>>>>>", isForcefullyDisconnect);
                        if (isForcefullyDisconnect) {
                            console.log("STOREing IN BUFFER STORAGE");
                            setStoreInBufferStorage(constructTransactionMsg, channel)
                            break;
                        }
                        addTransaction(constructTransactionMsg);
                    }
                    break;
            }
        })
    }

    const handleStateWSConnection = () => {
        return [setWSConnection, setCloseConnection]
    }
    return { processIncomingChannelMessage, handleStateWSConnection }
}