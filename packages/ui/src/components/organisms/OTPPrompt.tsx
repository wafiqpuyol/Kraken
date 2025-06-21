import { responseHandler } from "@/src/lib/utils"
import { p2ptransfer } from "@repo/db/type"
import { schedulePaymentPayload } from "@repo/forms/schedulePaymentSchema"
import { sendMoneyPayload } from "@repo/forms/sendMoneySchema"
import { UseFormReset } from "@repo/forms/types"
import { ITransactionDetail } from "@repo/ui/types"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Button } from "../atoms/Button"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../atoms/InputOTP"
import { DialogContent } from "../molecules/Dialog"
import { useToast } from "../molecules/Toaster/use-toast"
import { SendMoneyProps } from "../templates/SendMoneyPage"
import { SendMoneyType } from "@/src/lib/types"
import { PendingTransaction } from "../templates/ScheduledPayment"
import { formateScheduledTrxnData } from "../../lib/utils"

interface IOTPPrompt {
    transactionDetail: ITransactionDetail,
    sendMoneyAction: SendMoneyProps["sendMoneyAction"],
    formReset: UseFormReset<sendMoneyPayload> | UseFormReset<schedulePaymentPayload>
    setAllTransactionHistory?: Dispatch<SetStateAction<[] | p2ptransfer[]>>
    verifyOTP: (otp: string) => Promise<{
        message: string;
        status: number;
    }>
    setAccountLock?: Dispatch<SetStateAction<boolean>>
    setModalOpen: Dispatch<SetStateAction<boolean>>
    sendMoneyType: keyof SendMoneyType
    addPaymentSchedule: (payload: IScheduleDetails) => Promise<{
        message: any;
        status: number;
        job: any
    }>
    setPendingTransactions?: Dispatch<SetStateAction<PendingTransaction[]>>
    setTotalPendingTransaction?: Dispatch<SetStateAction<number>>
}

type a = {
    message: string;
    status: number;
}

export const OTPPrompt = ({
    transactionDetail, sendMoneyAction, formReset, setAllTransactionHistory, verifyOTP,
    setAccountLock, setModalOpen, sendMoneyType, addPaymentSchedule, setPendingTransactions,
    setTotalPendingTransaction
}: IOTPPrompt) => {
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false)
    const [isBtnDisable, setIsBtnDisable] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        var expiryDate = new Date(Date.now() + 1000 * 92).getTime()
        let time = setInterval(() => {
            var now = new Date().getTime()
            var distance = expiryDate - now
            var expiresWithin = Math.floor((distance % (1000 * 92)) / 1000);
            if (distance < 0) {
                clearInterval(time)
            }

            if (expiresWithin > 0) {
                // @ts-ignore
                document.getElementById("childSpan").innerHTML = expiresWithin + "s";
                // @ts-ignore
                document.getElementById("childSpan").style.color = expiresWithin <= 10 ? "#D62626" : "#9333EA"
            }
            // @ts-ignore
            document.getElementById("parent").innerHTML = expiresWithin <= 0 ? "OTP time expired" : document.getElementById("parent").innerHTML;
            // @ts-ignore
            document.getElementById("parent").style.color = expiresWithin <= 0 && "#D62626";
        }, 1000)
        return () => { clearTimeout(time) }
    }, [])

    const handleOTPSubmit = async () => {
        try {
            setIsLoading(true)
            let res: any
            res = await verifyOTP(otp)
            if (res.status === 200) {
                if (sendMoneyType === "DIRECT") res = await sendMoneyAction(transactionDetail)
                if (sendMoneyType === "SCHEDULED") res = await addPaymentSchedule(transactionDetail)
                console.log("RESPONSE +++++>", res)
            }

            switch (res.status) {
                case 200:
                    toast({
                        title: res.message,
                        variant: "default",
                        className: "text-white bg-green-500",
                        duration: 3000
                    })
                    if (sendMoneyType == "DIRECT") {
                        setAllTransactionHistory && setAllTransactionHistory((prev) => {
                            const updatedArr = [...prev]
                            // @ts-ignore
                            updatedArr.unshift(res.transaction!)
                            return updatedArr
                        })
                    }
                    if (sendMoneyType === "SCHEDULED") {
                        setPendingTransactions && setPendingTransactions((prev) => {
                            if (!res.job) return prev;
                            const allPrevJobs = [formateScheduledTrxnData(res.job), ...prev]
                            allPrevJobs.unshift()
                            return allPrevJobs
                        })
                        setTotalPendingTransaction && setTotalPendingTransaction((prev) => prev + 1)
                    }
                    resetForm(sendMoneyType, formReset)
                    setOtp("")
                    setModalOpen(false)
                    break

                case 403:
                    toast({
                        title: res.message,
                        variant: "destructive",
                        className: "text-white bg-red-500",
                        duration: 3000
                    })
                    setAccountLock && setAccountLock(true)
                    resetForm(sendMoneyType, formReset)
                    break;
            }
            responseHandler(res)
            res.status === 200 ? setIsBtnDisable(true) : setIsBtnDisable(false)
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

    const resetForm = (trxnType: IOTPPrompt["sendMoneyType"], formReset: IOTPPrompt["formReset"]) => {
        if (trxnType === "DIRECT") {
            formReset({ amount: "", currency: "", phone_number: "", pincode: "" })
        }
        if (trxnType === "SCHEDULED") {
            formReset({ amount: "", currency: "", payee_number: "", payment_date: undefined, pincode: "" })
        }
    }

    return (
        <DialogContent className="sm:max-w-[400px] bg-white p-8" onInteractOutside={(e) => {
            e.preventDefault();
        }}>
            <div className="flex flex-col items-center">
                <form onSubmit={handleOTPSubmit} className="flex flex-col gap-4">
                    <p className="text-lg font-medium text-slate-00">
                        We've sent you an 6 digit otp code your email.
                    </p>
                    <InputOTP maxLength={6} value={otp} onChange={setOtp} className="border-purple-500">
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                    <Button disabled={otp.length !== 6 || isLoading || isBtnDisable} type="submit" className="bg-purple-500 text-white mt-2">
                        {isLoading ? "verifying..." : "Continue"}
                    </Button>
                </form>
                <div id="parent" className='self-center mt-9 mr-10 text-sm font-medium text-gray-500'>expires at:- <span id="childSpan" className='text-red-500'></span> </div>
            </div>
        </DialogContent>
    )
}



// {
//     "name": "process-payment",
//     "data": {
//         "formData": {
//             "pincode": "123456",
//             "payee_number": "+8801962175677",
//             "amount": "25",
//             "currency": "BDT",
//             "payment_date": "2025-07-05T03:00:00.000Z"
//         },
//         "additionalData": {
//             "symbol": "৳",
//             "sender_number": "+8801905333510",
//             "receiver_number": "+8801962175677",
//             "trxn_type": "Domestic",
//             "domestic_trxn_fee": "4",
//             "international_trxn_fee": null,
//             "domestic_trxn_currency": "BDT",
//             "international_trxn_currency": "BDT"
//         },
//         "executionTime": "2025-07-05T03:00:00.000Z",
//         "scheduleId": "92af066e-fd53-435b-98c6-82c2b63a755a",
//         "userId": 26506964
//     },
//     "opts": {
//         "attempts": 3,
//         "delay": 1326423137,
//         "removeOnFail": {
//             "count": 0
//         },
//         "jobId": "schedule_92af066e-fd53-435b-98c6-82c2b63a755a_cc98b850-cec8-4a66-9f0f-f6fba39c55af",
//         "removeOnComplete": {
//             "count": 0
//         },
//         "backoff": {
//             "delay": 5000,
//             "type": "exponential"
//         }
//     },
//     "id": "schedule_92af066e-fd53-435b-98c6-82c2b63a755a_cc98b850-cec8-4a66-9f0f-f6fba39c55af",
//     "progress": 0,
//     "returnvalue": null,
//     "stacktrace": [],
//     "delay": 1326423137,
//     "priority": 0,
//     "attemptsStarted": 0,
//     "attemptsMade": 0,
//     "stalledCounter": 0,
//     "timestamp": 1750357976863,
//     "queueQualifiedName": "bull:payment-schedule-queue"
// }

