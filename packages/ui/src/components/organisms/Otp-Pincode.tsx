import { Dialog, DialogHeader, DialogFooter, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from '../molecules/Dialog'
import { Dispatch, SetStateAction, useState, useEffect } from "react"
import { Button } from "../atoms/Button"
import type { IScheduleTabProps, PendingTransaction } from "../templates/ScheduledPayment"
import { useToast } from "../molecules/Toaster/use-toast"
import { IScheduleDetails } from "../../lib/types";
import { responseHandler } from "../../lib/utils"
import { PINCODE_MAX_LENGTH, OTP_CODE } from "../../lib/constant"
import { Input } from "../atoms/Input"
import { Label } from "../atoms/Label"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../atoms/InputOTP"
import { Phase } from "../../lib/types"

interface IOTP_PincodeProps {
    isOTP_PincodeOpen: boolean
    setIsOTP_PincodeOpen: Dispatch<SetStateAction<boolean>>
    editPaymentScheduleJob: IScheduleTabProps["editPaymentScheduleJob"]
    postEditedScheduledPayment: IScheduleDetails | null
    setPendingTransactions: Dispatch<SetStateAction<PendingTransaction[]>>
    resetStates: () => void
    verifyOTP: IScheduleTabProps["verifyOTP"]
}

interface IOTPPromptProps {
    otp: string
    setOtp: Dispatch<SetStateAction<string>>
    setIsBtnDisable: Dispatch<SetStateAction<boolean>>
}
interface IPincodeProps {
    pincode: string
    setPincode: Dispatch<SetStateAction<string>>
    setIsBtnDisable: Dispatch<SetStateAction<boolean>>
}

const content: Record<Extract<Phase, Phase.OTP | Phase.PINCODE>, any> = {
    pincode: {
        title: "Enter your secure pincode",
        desc: "To continue, please enter the pincode you’ve set earlier. This helps keep your account safe and secure.",
        staticBtnText: "Verify",
        dynamicBtnText: "Verifying"
    },
    otp: {
        title: "Reset your 6 digit OTP code",
        desc: "Enter the OTP code sent to your email.",
        staticBtnText: "Proceed",
        dynamicBtnText: "Proceeding"
    }
}

export const OTP_Pincode: React.FC<IOTP_PincodeProps> = ({
    isOTP_PincodeOpen, setIsOTP_PincodeOpen, resetStates, verifyOTP,
    editPaymentScheduleJob, postEditedScheduledPayment, setPendingTransactions
}) => {
    console.log(isOTP_PincodeOpen)
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [otp, setOtp] = useState<string>("");
    const [pincode, setPincode] = useState<string>("");
    const { toast } = useToast()
    const [currentPhase, setCurrentPhase] = useState<Extract<Phase, Phase.OTP | Phase.PINCODE>>(Phase["OTP"])
    const [isBtnDisable, setIsBtnDisable] = useState(true)


    const handleClick = async () => {
        if (currentPhase === Phase.OTP) await handleOTP()
        else await handlePincode()
    }
    const handleOTP = async () => {
        setIsLoading(true)
        try {
            const res = await verifyOTP(otp)
            if (res.status === 200) {
                setCurrentPhase(Phase.PINCODE)
            }
            responseHandler(res)
        } catch (error: any) {
            toast({
                title: error.message,
                variant: "default",
                className: "text-white bg-green-500",
                duration: 3000
            })
        }
        setIsBtnDisable(false)
        setIsLoading(false)
    }

    const handleBackToEditing = () => {
        setIsOTP_PincodeOpen(false)
    }

    const handlePincode = async () => {
        console.log(postEditedScheduledPayment)
        setIsLoading(true)
        try {
            const res = await editPaymentScheduleJob({ ...postEditedScheduledPayment, pincode })
            if (res.status === 200 && res.updatedJob) {
                setPendingTransactions((prev) => {
                    if (!res.updatedJob) return prev;
                    const filteredScheduledPaymentJob = prev.filter(job => job.trxn_id !== res.updatedJob.trxn_id)
                    console.log(filteredScheduledPaymentJob)
                    return [...filteredScheduledPaymentJob, res.updatedJob]
                })
                setIsOTP_PincodeOpen(false)
                resetStates()
            }
            console.log("RESOINSE -___ ", res)
            responseHandler(res)
        } catch (error: any) {
            toast({
                title: error.message,
                variant: "destructive",
                className: "text-white bg-red-500",
                duration: 3000
            })
        }
        setIsBtnDisable(false)
        setIsLoading(false)
    }

    return (
        <Dialog open={isOTP_PincodeOpen} onOpenChange={() => {
            setCurrentPhase(Phase.OTP)
            setIsBtnDisable(true)
        }}>
            <DialogContent className="sm:max-w-[600px]  bg-white" onInteractOutside={(e) => {
                e.preventDefault();
            }}>
                <DialogHeader>
                    <DialogTitle className='text-2xl'>{content[currentPhase].title}</DialogTitle>
                    <DialogDescription className='text-slate-700'>
                        {content[currentPhase].desc}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center space-x-2 flex-col mt-4">
                    <div className='w-full'>
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="link" className="sr-only">
                                Link
                            </Label>
                            {currentPhase === Phase.OTP && <OTPPrompt otp={otp} setOtp={setOtp} setIsBtnDisable={setIsBtnDisable} />}
                            {currentPhase === Phase.PINCODE && <Pincode pincode={pincode} setPincode={setPincode} setIsBtnDisable={setIsBtnDisable} />}
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-start mt-3">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary"
                            onClick={() => handleBackToEditing()}
                            className="bg-purple-600 text-white rounded-xl py-2 font-medium hover:bg-purple-500">
                            {"Back to Edit"}
                        </Button>
                    </DialogClose>
                    <Button
                        disabled={isLoading || isBtnDisable}
                        className="bg-purple-600 text-white rounded-xl py-2 font-medium hover:bg-purple-500"
                        onClick={() => handleClick()}>{isLoading ? content[currentPhase].dynamicBtnText : content[currentPhase].staticBtnText}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


const Pincode: React.FC<IPincodeProps> = ({ pincode, setPincode, setIsBtnDisable }) => {
    return (
        <div>

            <Input
                type='number'
                value={pincode}
                max={PINCODE_MAX_LENGTH}
                placeholder="Enter your pincode"
                onChange={(e) => {
                    if (e.target.value.length <= PINCODE_MAX_LENGTH) {
                        setPincode(e.target.value)
                        setIsBtnDisable(true)
                    }
                    if (e.target.value.length >= PINCODE_MAX_LENGTH) {
                        setIsBtnDisable(false   )
                    }
                }}
            />
        </div>
    )
}

const OTPPrompt: React.FC<IOTPPromptProps> = ({ setOtp, otp, setIsBtnDisable }) => {
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
            document.getElementById("parent").innerHTML = expiresWithin <= 0 ? "EXPIRED" : document.getElementById("parent").innerHTML;
            // @ts-ignore
            document.getElementById("parent").style.color = expiresWithin <= 0 && "#D62626";
        }, 1000)
        return () => { clearTimeout(time) }
    }, [])

    return (<div className='flex flex-col'>
        <div className="flex flex-col items-center">
            <form
                className="flex flex-col gap-4">
                <InputOTP
                    maxLength={OTP_CODE}
                    value={otp}
                    onChange={(val) => {
                        if (val.length <= OTP_CODE) {
                            setOtp(val)
                            setIsBtnDisable(true)
                        }
                        if (val.length >= OTP_CODE) {
                            setIsBtnDisable(false)
                        }
                    }}
                    className="border-purple-500">
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
            </form>
            <div id="parent" className='self-center mt-9 mr-10 text-sm font-medium text-gray-500'>expires at:- <span id="childSpan" className='text-red-500'></span> </div>
        </div>
    </div>)
}


//  payee_number: '+8801962175677',
//     amount: '49',
//     currency: 'BDT',
//     payment_date: 2025-06-27T05:27:00.000Z,
//     payee_name: 'Chutar'