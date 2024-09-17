"use client"

import { useState } from "react"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../atoms/InputOTP"
import { Button } from "../atoms/Button"
import { useToast } from "../molecules/Toaster/use-toast"
import { useRouter } from "next/navigation"

interface TwoFAFormProps {
    activate2fa: (otp: string) => Promise<{
        message: string;
        status: number;
    }>
}
export const TwoFAForm: React.FC<TwoFAFormProps> = ({ activate2fa }) => {
    const [otp, setOtp] = useState("");
    const { toast } = useToast()
    const router = useRouter()

    const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const res = await activate2fa(otp);
            switch (res.status) {
                case 200:
                    toast({
                        title: "OTP verified successfully",
                        variant: "default"
                    })
                    router.push("/dashboard/home")
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
        <div>
            <div>
                <img src="./authenticator-app.light.png" alt="authenticator app" className="w-72 ml-11" />
            </div>
            <div className="flex flex-col items-center">
                <form onSubmit={handleOTPSubmit} className="flex flex-col gap-2">
                    <div className="mb-5">
                        <h1 className="self-start font-medium text-lg text-slate-900">Authenticator app</h1>
                        <p className="text-sm font-medium text-slate-500">
                            Enter the Sign-in 2FA code from your authenticator app.
                        </p>

                    </div>
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
    )
}
