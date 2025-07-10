"use client"

import { useState } from "react"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../atoms/InputOTP"
import { Button } from "../atoms/Button"
import { useToast } from "../molecules/Toaster/use-toast"
import { useRouter } from "next/navigation"
import { useTranslations, useLocale } from 'next-intl';
import { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/types"
import { startAuthentication } from "@simplewebauthn/browser"
import { useSession } from "next-auth/react"
import { Session } from "next-auth"
import { responseHandler } from "../../lib/utils"

interface TwoFAFormProps {
    activate2fa: (otp: string, twoFAType: "signInTwoFA" | "withDrawTwoFA") => Promise<{
        message: string;
        status: number;
    }>
    verifyPasskey: (step: "generateAuthentication" | "verifyAuthentication", regCred?: any) => Promise<{
        message: string;
        status: number;
        challenge?: PublicKeyCredentialRequestOptionsJSON;
    }>
}
export const TwoFAForm: React.FC<TwoFAFormProps> = ({ activate2fa, verifyPasskey }) => {
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast()
    const router = useRouter()
    const t = useTranslations("TwoFAForm")
    const local = useLocale()
    const session = useSession()

    const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setIsLoading(true)
            const res = await activate2fa(otp, "signInTwoFA");
            switch (res.status) {
                case 200:
                    toast({
                        title: "OTP verified successfully",
                        variant: "default"
                    })
                    setOtp("")
                    setIsLoading(false)
                    session.update((data: Session) => {
                        return {
                            ...data,
                            user: {
                                ...data.user,
                                isOtpVerified: true
                            }
                        }
                    })
                    router.push(`/${local}/dashboard/portfolio`)
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

    const handlePasskey = async () => {
        if (session.data && !session.data.user?.isMasterKeyActivated) {
            toast({
                title: "Master key is not activated. Please activate your master key first",
                variant: "destructive",
                className: "bg-red-500 text-white rounded-xl",
                duration: 3000
            })
            return
        }
        try {
            let res: {
                message: string;
                status: number;
                challenge?: PublicKeyCredentialRequestOptionsJSON;
            }
            res = await verifyPasskey("generateAuthentication")
            if (res.status === 200) {
                const authResponse = await startAuthentication(res.challenge)
                res = await verifyPasskey("verifyAuthentication", { challenge: res.challenge, authResponseJSON: authResponse })
                if (res.status === 200) {
                    session.update((data: Session) => {
                        return {
                            ...data,
                            user: {
                                ...data.user,
                                isMasterKeyVerified: true
                            }
                        }
                    })
                    router.push(`/${local}/dashboard/portfolio`)
                }
            }
            responseHandler(res)
        } catch (error) {
            console.log("handlePasskey ===>", error);
        }
    }
    return (
        <div>
            <div>
                <img src="../master-key-authenticator.webp" alt="authenticator app" className="w-[230px] h-[230px] ml-20" />
            </div>
            <div className="flex flex-col items-center">
                <form onSubmit={handleOTPSubmit} className="flex flex-col gap-2">
                    <div className="mb-5">
                        <h1 className="self-start font-medium text-lg text-slate-900">{t("title")}</h1>
                        <p className="text-sm font-medium text-slate-500">
                            {t("desc")}
                        </p>

                    </div>
                    <p className="text-sm font-medium text-slate-500">
                        {t("enter_title")}
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
                        {t("continue_button")}
                    </Button>
                </form>
                <p className="mt-5 text-sm font-medium text-slate-500 cursor-pointer" onClick={handlePasskey}>Forgot your 2FA? <span className="text-purple-500 font-bold">Enter your Passkey</span></p>
            </div>
        </div>
    )
}
