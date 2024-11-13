"use client"

import { p2ptransfer } from "@repo/db/type"
import { useSession } from "next-auth/react"
import { cn } from "../../lib/utils"
import { TransactionModal } from "../molecules/TransactionModal"
import { Skeleton } from "../molecules/Skeleton"
import { useEffect, useState, memo } from "react"
import { useTranslations } from "next-intl"
import { Input } from "../atoms/Input"
import { Button } from "../atoms/Button"

interface TransactionHistoryProps {
    p2pTransactionHistories: p2ptransfer[] | []
    getAllP2PTransactionByTrxnID: (trxn_id: string) => Promise<[]>
}
export const TransactionHistory: React.FC<TransactionHistoryProps> = memo(({ p2pTransactionHistories, getAllP2PTransactionByTrxnID }) => {
    const [isSkeleton, setIsSkeleton] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [disableSearchBtn, setDisableSearchBtn] = useState(true)
    const currentUserID = useSession().data?.user?.uid;
    const t = useTranslations("TransactionHistory")
    const [inputData, setInputData] = useState("")
    const [searchedTransactionHistory, setSearchedTransactionHistory] = useState<[p2ptransfer] | []>([])

    useEffect(() => {
        const timerId = setTimeout(() => setIsSkeleton(false), 2500)
        return () => clearTimeout(timerId)
    }, [])

    const handleOnChange = (val: string) => {
        // when component mounts, inputData is empty string
        if (inputData.length === 0 && val.length === 0) return
        setDisableSearchBtn(false)
        setInputData(val)
        if (val.length === 0) {
            setSearchedTransactionHistory([])
            setDisableSearchBtn(true)
        }
    }

    const handleSearchBtn = async () => {
        setIsLoading(true)
        setIsSkeleton(true)
        if (searchedTransactionHistory[0]?.transactionID !== inputData.trim()) {
            const res = await getAllP2PTransactionByTrxnID(inputData.trim())
            setSearchedTransactionHistory(res)
        } else {
            setSearchedTransactionHistory(searchedTransactionHistory)
        }
        setIsLoading(false)
        setIsSkeleton(false)
    }

    return (
        <div className="flex bg-white rounded-lg">
            <div className="bg-card p-4 rounded-lg shadow-md w-[720px] p-8">
                <h2 className="text-2xl font-semibold text-foreground mb-8">{t("title")}</h2>

                <div className="flex justify-start gap-4 mb-3">
                    <Input type="text" value={inputData} placeholder="Enter transaction ID" onChange={e => handleOnChange(e.target.value.trim())} disabled={isSkeleton} />
                    <Button className="bg-purple-600 text-white" onClick={handleSearchBtn} disabled={isSkeleton || isLoading || disableSearchBtn}>Search</Button>
                </div>
                <div className="overflow-y-scroll h-[300px]">
                    {
                        isSkeleton || !currentUserID
                            ?
                            <TransactionHistorySkeleton />
                            :
                            (searchedTransactionHistory !== null && searchedTransactionHistory.length > 0)
                                ?
                                <TransactionHistoryCard p2pTransactionHistories={searchedTransactionHistory} currentUserID={currentUserID} t={t} />
                                :
                                (!inputData.length && p2pTransactionHistories.length > 0)
                                &&
                                <TransactionHistoryCard p2pTransactionHistories={p2pTransactionHistories} currentUserID={currentUserID} t={t} />
                    }
                    {
                        ((inputData.length && !searchedTransactionHistory.length) || !p2pTransactionHistories.length)
                        &&
                        <div className="flex p-10 justify-center items-center">
                            <p className="text-gray-500 text-xl font-medium">{t("no_transaction_history")}</p>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
})

const TransactionHistoryCard = ({ p2pTransactionHistories, currentUserID, t }: { p2pTransactionHistories: p2ptransfer[], currentUserID: number, t: any }) => (
    p2pTransactionHistories.map(obj => {

        if (Object.keys(obj).length === 0) {
            return <></>;
        }

        const transactionType = obj.transactionType;
        const amount = obj.amount
        const timestamp = new Date(obj.timestamp).toLocaleString().split(",").reverse().join().replace(",", "  ")
        return (
            <TransactionModal transactionDetail={obj}>
                <div className="shadow-md cursor-pointer mt-4 bg-slate-100/30 px-4 py-5 border-b border-border rounded-2xl">
                    <div className="flex flex-row justify-between py-2 font-medium items-center ">
                        <div className="flex flex-col">
                            <span className="text-lg mb-2">{(transactionType === "Send" && obj.fromUserId === currentUserID) ? t("sent_money") : t("received_money")}</span>
                            <div className="text-gray-800 text-lg">
                                {(transactionType === "Send" && obj.fromUserId === currentUserID)
                                    ?
                                    <span>
                                        <small className="text-gray-500 text-[1rem] mr-1">{t("to")}</small>
                                        {obj.receiver_name}
                                    </span>
                                    :
                                    <span>
                                        <small className="text-gray-500 text-[1rem] mr-1">{t("from")}</small>
                                        {obj.sender_name}
                                    </span>
                                }
                            </div>
                            <small className="text-gray-500">{t("transID_label")} {obj.transactionID}</small>
                        </div>
                        <div className="flex flex-col self-end">
                            <div className={
                                cn("mb-1 text-[0.95rem]", (obj.status === "Failed" || (transactionType === "Send" && obj.fromUserId === currentUserID)) ? "text-red-500" : "text-green-500")
                            }
                            >{
                                    obj.status === "Success"
                                        ?
                                        ((transactionType === "Send" && obj.fromUserId === currentUserID) ? `-${amount / 100}` : `+${amount / 100}`)
                                        :
                                        `${amount / 100}`}
                                {' '} {obj.currency}</div>
                            <small className="w-40">{timestamp}</small>
                        </div>
                    </div>
                </div>
            </TransactionModal>)
    })
)


const TransactionHistorySkeleton = () => (
    new Array(4).fill("").map(() => (
        <div className="mt-4 px-4" >
            <Skeleton className="h-4 w-full bg-slate-600/30 h-[140px]" />
        </div>
    ))
)