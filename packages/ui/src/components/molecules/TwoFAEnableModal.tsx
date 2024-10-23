"use client"
import { Dispatch, ReactNode, SetStateAction, useState } from "react"
import { Button } from "../atoms/Button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./Dialog"
import { QRCodeSVG } from 'qrcode.react';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../atoms/InputOTP"
import { useToast } from "./Toaster/use-toast"
import { useSession } from "next-auth/react"
import { Session } from "next-auth"
import { useTranslations } from "next-intl"
import { responseHandler } from "../../lib/utils"

export interface TwoFADialogProps {
    children: ReactNode
    code: string
    activate2fa: (otp: string, twoFAType: "signInTwoFA" | "withDrawTwoFA") => Promise<{
        message: string;
        status: number;
    }>
    twoFAType: "signInTwoFA" | "withDrawTwoFA"
    setTwoFAEnabled?: Dispatch<SetStateAction<boolean>>
    setWithDrawTwoFAEnabled?: Dispatch<SetStateAction<boolean>>
}
export const TwoFAEnableDialog: React.FC<TwoFADialogProps> = ({ children, code, activate2fa, setTwoFAEnabled, twoFAType, setWithDrawTwoFAEnabled }) => {
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast()
    const session = useSession()
    const t = useTranslations("TwoFAEnableDialog")

    const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setIsLoading(true)
            const res = await activate2fa(otp, twoFAType);
            switch (res.status) {
                case 200:
                    toast({
                        title: `${res.message}`,
                        variant: "default"
                    })
                    let updatedSessionData: any
                    if (twoFAType === "signInTwoFA") {
                        setTwoFAEnabled!(true)
                        updatedSessionData = { isOtpVerified: true, isTwoFAActive: true }
                    } else {
                        setWithDrawTwoFAEnabled!(true)
                        updatedSessionData = { isWithDrawTwoFAActivated: true, isWithDrawOTPVerified: true }
                    }
                    setOtp("")
                    setIsLoading(false)
                    session.update((data: Session) => {
                        return {
                            ...data,
                            user: {
                                ...data.user,
                                ...updatedSessionData
                            }
                        }
                    })
                    break;
            }
            responseHandler(res)
        } catch (error: any) {
            toast({
                title: `${error.message}`,
                variant: "destructive"
            })
        }
        setIsLoading(false)
    };


    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white" onInteractOutside={(e) => {
                e.preventDefault();
            }}>
                <DialogHeader>
                    <DialogTitle>{t("header")}</DialogTitle>
                </DialogHeader>
                <div className="py-4">

                    <div className="flex flex-col items-center p-5 gap-y-2">
                        <QRCodeSVG value={code} />
                        <ol className="text-xs text-slate-600 py-2 px-4"> <ol />
                            <li>{t("instruction_1")}</li>
                            <li>{t("instruction_2")}</li>
                            <li>{t("instruction_3")}</li>
                        </ol>
                    </div>

                    <div className="flex flex-col items-center">
                        <form onSubmit={handleOTPSubmit} className="flex flex-col gap-2">
                            <p className="text-sm font-medium text-slate-500">
                                {t("title")}
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
                            <Button disabled={otp.length !== 6 || isLoading} type="submit" className="bg-purple-500 text-white mt-2">
                                {t("continue")}
                            </Button>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}