import { calculateAmountOnDemand, responseHandler } from "@/src/lib/utils"
import { p2ptransfer } from "@repo/db/type"
import { schedulePaymentPayload } from "@repo/forms/schedulePaymentSchema"
import { sendMoneyPayload } from "@repo/forms/sendMoneySchema"
import { UseFormReset } from "@repo/forms/types"
import { ITransactionDetail, IScheduleDetails } from "@repo/ui/types"
import { Session } from "next-auth"
import { useTranslations } from 'next-intl'
import { useRouter } from "next/navigation"
import { Dispatch, SetStateAction, useState } from "react"
import { Button } from "../atoms/Button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../molecules/Dialog"
import { Enable2FAPrompt } from "../molecules/Enable2FAPrompt"
import { useToast } from "../molecules/Toaster/use-toast"
import { OTPPrompt } from "../organisms/OTPPrompt"
import { SendMoneyProps } from "./SendMoneyPage"
import { SendMoneyType } from "@/src/lib/types"
import {PendingTransaction} from "./ScheduledPayment"


interface FinalProps {
    sendMoneyAction: SendMoneyProps["sendMoneyAction"],
    formReset: UseFormReset<sendMoneyPayload> | UseFormReset<schedulePaymentPayload>
    locale: string,
    session: Session,
    modalOpen: boolean,
    setModalOpen: Dispatch<SetStateAction<boolean>>
    children: React.ReactNode,
    transactionDetail: IScheduleDetails | null
    setAllTransactionHistory?: Dispatch<SetStateAction<[] | p2ptransfer[]>>
    currency: string | null
    sendOTPAction: (email: string) => Promise<{
        message: string | undefined;
        status: number;
    }>
    verifyOTP: (otp: string) => Promise<{
        message: string;
        status: number;
    }>
    setAccountLock?: Dispatch<SetStateAction<boolean>>
    sendMoneyType: keyof SendMoneyType
   addPaymentSchedule: (payload: IScheduleDetails) => Promise<{
        message: any;
        status: number;
        job: any
    }>
    setPendingTransactions?:Dispatch<SetStateAction<PendingTransaction[]>>
    setTotalPendingTransaction?: Dispatch<SetStateAction<number>>
}


export const FinalCard: React.FC<FinalProps> = ({
    sendMoneyAction, children, transactionDetail, modalOpen, session, currency,
    locale, formReset, setModalOpen, setAllTransactionHistory,
    sendOTPAction, verifyOTP, setAccountLock, sendMoneyType, addPaymentSchedule,
    setTotalPendingTransaction,setPendingTransactions
}) => {
    const t = useTranslations(sendMoneyType === "DIRECT" ? "FinalCardForDirectPayment" : "FinalCardForSchedulePayment")
    const [isLoading, setIsLoading] = useState(false)
    const [isBtnDisable, setIsBtnDisable] = useState(false)
    const [enable2FAPrompt, setEnable2FAPrompt] = useState(false)
    const [otpPrompt, setOTPPrompt] = useState(false)
    const { toast } = useToast()
    const router = useRouter();

    console.log("Final card running");

    const handleClick = async () => {
        if (!session?.user) {
            router.push(`/${locale}/login`)
        }
        setIsLoading(true)
        if (!session.user?.isTwoFAActive && !session.user?.isOtpVerified) {
            setEnable2FAPrompt(true)
            return;
        }

        try {
            const res = await sendOTPAction(session.user?.email!)
            switch (res.status) {
                case 200:
                    toast({
                        title: res.message,
                        variant: "default",
                        className: "text-white bg-green-500",
                        duration: 3000
                    })
                    setIsLoading(false)
                    setOTPPrompt(true)
                    break
            }
            responseHandler(res)
            setIsLoading(false)
        } catch (error: any) {
            toast({
                title: error.message,
                variant: "destructive",
                className: "text-white bg-red-500",
                duration: 3000
            })
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={modalOpen} onOpenChange={() => {
            setIsBtnDisable(false)
            setModalOpen(false)
            setEnable2FAPrompt(false)
            setIsLoading(false)
            setOTPPrompt(false)

        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            {
                transactionDetail && !enable2FAPrompt
                    ?

                    (
                        otpPrompt ?
                            <OTPPrompt sendMoneyType={sendMoneyType} formReset={formReset} sendMoneyAction={sendMoneyAction} transactionDetail={transactionDetail}
                                setAllTransactionHistory={setAllTransactionHistory} verifyOTP={verifyOTP} setAccountLock={setAccountLock}
                                setModalOpen={setModalOpen} addPaymentSchedule={addPaymentSchedule} setPendingTransactions={setPendingTransactions}
                                setTotalPendingTransaction={setTotalPendingTransaction}
                            />
                            :
                            <DialogContent className="sm:max-w-[400px] bg-white" onInteractOutside={(e) => {
                                e.preventDefault();
                            }}>
                                <DialogTitle className="mb-4">{t("title")}</DialogTitle>
                                <div className="flex justify-between mb-3">
                                    <div className="flex flex-col gap-y-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-500">{t("sender_number")}</span>
                                            <span className="font-medium text-sm">{transactionDetail.additionalData.sender_number}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-500">{t("receiver_number")}</span>
                                            <span className="font-medium text-sm">{transactionDetail.additionalData.receiver_number}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-500">{t("amount")}</span>
                                            <span className="font-medium text-sm">
                                                {transactionDetail.formData.amount}
                                                <span className="ml-1">{transactionDetail.additionalData.trxn_type === "International" ? transactionDetail.additionalData.international_trxn_currency : transactionDetail.additionalData.domestic_trxn_currency}</span>
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-500">{t("execution_time")}</span>
                                            <span className="font-medium text-sm">
                                                {console.log(transactionDetail.executionTime)}
                                                {new Date(transactionDetail.executionTime).toLocaleString()}                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-y-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-500">{t("category")}</span>
                                            <span className="font-medium text-sm">{transactionDetail.additionalData.trxn_type}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-500">{t("fee")}</span>
                                            <div className="font-medium text-sm">
                                                <span className="font-extrabold text-lg">{transactionDetail.additionalData.symbol}</span>
                                                <span>{transactionDetail.additionalData.trxn_type === "Domestic" ? transactionDetail.additionalData.domestic_trxn_fee : transactionDetail.additionalData.international_trxn_fee}</span>
                                            </div>
                                        </div>
                                        {
                                            transactionDetail.additionalData.trxn_type === "International" &&
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-500">{t("converted_amount")}</span>
                                                <div className="font-medium text-sm">
                                                    <span>
                                                        {calculateAmountOnDemand(undefined, undefined, currency, session.user?.wallet_currency, transactionDetail.formData.amount)}
                                                        <small className="font-extrabold text-[13px] mr-1">{transactionDetail.additionalData.symbol}</small>
                                                        <small className="font-bold text-slate-600">+{transactionDetail.additionalData.international_trxn_fee}(inc.)</small>
                                                    </span>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <Button className="w-full bg-purple-600 text-white" onClick={() => handleClick()} disabled={isLoading || isBtnDisable}>
                                    {isLoading ? t("proceeding") : t("proceed")}
                                </Button>
                            </DialogContent>
                    )

                    :
                    <Enable2FAPrompt />
            }
        </Dialog>
    )
}