"use client"

import { p2ptransfer, preference } from "@repo/db/type"
import { useSession } from "next-auth/react"
import { cn } from "../../lib/utils"
import { TransactionModal } from "../molecules/TransactionModal"
import { Skeleton } from "../molecules/Skeleton"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

interface TransactionHistoryProps {
    p2pTransactionHistories: p2ptransfer[] | []
}
export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ p2pTransactionHistories }) => {
    const [isSekelton, setIsSekelton] = useState(true)
    const currentUserID = useSession().data?.user?.uid;
    const t = useTranslations("TransactionHistory")

    useEffect(() => {
        const timerId = setTimeout(() => setIsSekelton(false), 2500)
        return () => clearTimeout(timerId)
    }, [])

    return (
        <div className="flex bg-white rounded-lg">
            <div className="bg-card p-4 rounded-lg shadow-md w-[720px] p-8">
                <h2 className="text-2xl font-semibold text-foreground mb-8">{t("title")}</h2>


                <div className="overflow-y-scroll h-[300px]">
                    {
                        isSekelton
                            ?
                            new Array(4).fill("").map(() => (
                                <div className="mt-4 px-4" >
                                    <Skeleton className="h-4 w-full bg-slate-600/30 h-[140px]" />
                                </div>
                            ))
                            :
                            (p2pTransactionHistories.length > 0 && currentUserID)
                                ?
                                p2pTransactionHistories.map(obj => {
                                    const transactionType = obj.transactionType;
                                    const amount = obj.amount
                                    const timestamp = new Date(obj.timestamp).toLocaleString().split(",").reverse().join().replace(",", "  ")
                                    return (
                                        <TransactionModal transactionDetail={obj}>
                                            <div className="cursor-pointer mt-4 bg-slate-100/30 px-4 border-b border-border">
                                                <div className="flex flex-row justify-between py-2 font-medium items-center ">
                                                    <div className="flex flex-col">
                                                        <span className="text-lg mb-2">{(transactionType === "Send" && obj.fromUserId === currentUserID) ? t("sent_money") : t("received_money")}</span>
                                                        <div className="text-gray-800 text-lg">
                                                            {(transactionType === "Send" && obj.fromUserId === currentUserID)
                                                                ?
                                                                <span>
                                                                    <small className="text-gray-500 text-[1rem] mr-1">{t("to")}</small>
                                                                    {obj.user_p2ptransfer_toUserIdTouser?.name}
                                                                </span>
                                                                :
                                                                <span>
                                                                    <small className="text-gray-500 text-[1rem] mr-1">{t("from")}</small>
                                                                    {obj.user_p2ptransfer_fromUserIdTouser?.name}
                                                                </span>
                                                            }
                                                        </div>
                                                        <small className="text-gray-500">{t("transID_label")} {obj.transactionID}</small>
                                                    </div>
                                                    <div className="flex flex-col self-end">
                                                        <div className={
                                                            cn("mb-1 text-[0.95rem]", (transactionType === "Send" && obj.fromUserId === currentUserID) ? "text-red-500" : "text-green-500")
                                                        }
                                                        >{(transactionType === "Send" && obj.fromUserId === currentUserID) ? `-${amount}` : `+${amount}`} {obj.currency}</div>
                                                        <small className="w-40">{timestamp}</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </TransactionModal>
                                    )
                                })
                                :
                                <div className="flex p-10 justify-center items-center">
                                    <p className="text-gray-500 text-xl font-medium">{t("no_transaction_history")}</p>
                                </div>
                    }
                </div>
            </div>
        </div>
    )
}