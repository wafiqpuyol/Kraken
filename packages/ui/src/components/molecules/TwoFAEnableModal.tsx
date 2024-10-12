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

interface TwoFADialogProps {
    children: ReactNode
    code: string
    activate2fa: (otp: string) => Promise<{
        message: string;
        status: number;
    }>
    setTwoFA: Dispatch<SetStateAction<boolean>>
}
export const TwoFAEnableDialog: React.FC<TwoFADialogProps> = ({ children, code, activate2fa, setTwoFA }) => {
    const [otp, setOtp] = useState("");
    const { toast } = useToast()
    const session = useSession()

    const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const res = await activate2fa(otp);
            switch (res.status) {
                case 200:
                    toast({
                        title: `${res.message}`,
                        variant: "default"
                    })
                    setTwoFA(true)
                    session.update((data: Session) => {
                        return {
                            ...data,
                            user: {
                                ...data.user,
                                isOtpVerified: true,
                                isTwoFAActive: true
                            }
                        }
                    })
                    break;
                case 400:
                    toast({
                        title: `${res.message}`,
                        variant: "destructive"
                    })
                    break;
                case 401:
                    toast({
                        title: `${res.message}`,
                        variant: "destructive"
                    })
                    break;
                case 500:
                    toast({
                        title: `${res.message}`,
                        variant: "destructive"
                    })
            }

        } catch (error: any) {
            toast({
                title: `${error.message}`,
                variant: "destructive"
            })
        }
    };


    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle>Add Authenticator app</DialogTitle>
                </DialogHeader>
                <div className="py-4">

                    <div className="flex flex-col items-center p-5 gap-y-2">
                        <QRCodeSVG value={code} />
                        <ol className="text-xs text-slate-600 py-2 px-4"> <ol />
                            <li>1. Download and install a 2FA app on your device. We recommend Google Authenticator.</li>
                            <li>2. Scan the QR code.</li>
                            <li>3. Enter the authentication code from the app.</li>
                        </ol>
                    </div>

                    <div className="flex flex-col items-center">
                        <form onSubmit={handleOTPSubmit} className="flex flex-col gap-2">
                            <p className="text-sm font-medium text-slate-500">
                                Enter code from 2FA app
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
                            <Button disabled={otp.length !== 6} type="submit" className="bg-purple-500 text-white mt-2">
                                Continue
                            </Button>
                        </form>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    )
}
