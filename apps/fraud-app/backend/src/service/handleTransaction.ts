import { MessageType } from "../utils/broker/broker.type";
import { SignalingManager } from "./signalingManager"
import { prisma } from "@repo/db/client";

export const handleTransaction = async (message: MessageType, channelName: string) => {
    const { transactionId } = message;
    const pendingTransaction = await prisma.transaction.findFirst({
        where: { id: transactionId },
        include:{
            user:{
                select:{
                    name:true,
                    preference:{
                        select:{
                            currency:true
                        }
                    }   
                }
            }
        }
    })
    if (!pendingTransaction) {
        console.log("Transaction not found");
        return
    }
    // redisManager().notification(`${message.receiver_id}_notifications`, JSON.stringify(message))
    await SignalingManager.emit(JSON.stringify(pendingTransaction), channelName, "publish")
}