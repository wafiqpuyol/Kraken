import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader, DialogClose } from "./Dialog"
import { useTranslations } from "next-intl"
import { cn } from "../../lib/utils"
import { useToast } from "../molecules/Toaster/use-toast"
import { useState } from "react"
import { Button } from "../atoms/Button"
import { validatePasskey, responseHandler } from "../../lib/utils"
import { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/types"
import { useSession } from "next-auth/react"
import { Session } from "next-auth"

interface TwoFADisableDialogProps {
    children: React.ReactNode,
    twoFAType: "signInTwoFA" | "withDrawTwoFA",
    isMasterKeyActivated: boolean
    setTwoFAEnabled: React.Dispatch<React.SetStateAction<boolean>>
    setWithDrawTwoFAEnabled: React.Dispatch<React.SetStateAction<boolean>>
    remove2fa: (twoFAType: "signInTwoFA" | "withDrawTwoFA") => Promise<{
        message: string;
        status: number;
    }>
    verifyPasskey: (step: "generateAuthentication" | "verifyAuthentication", regCred?: any) => Promise<{
        message: string; status: number; challenge?: PublicKeyCredentialRequestOptionsJSON
    }>
}

export const TwoFADisableDialog: React.FC<TwoFADisableDialogProps> = ({ children, twoFAType, isMasterKeyActivated, remove2fa, setTwoFAEnabled, setWithDrawTwoFAEnabled, verifyPasskey }) => {
    const t = useTranslations("TwoFADisableDialog")
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [isDisable, setIsDisable] = useState(false)
    const session = useSession()

    const handleClick = async () => {
        if (!isMasterKeyActivated) return;
        try {
            setIsLoading(true)
            let res: {
                message: string;
                status: number;
                challenge?: PublicKeyCredentialRequestOptionsJSON;
            }
            res = await validatePasskey(verifyPasskey, res)
            responseHandler(res)
            setTimeout(async () => {
                res = await remove2fa(twoFAType)
                responseHandler(res)
                let updatedSessionData: any
                if (twoFAType === "signInTwoFA") {
                    setTwoFAEnabled(false)
                    updatedSessionData = { isOtpVerified: false, isTwoFAActive: false }
                } else {
                    setWithDrawTwoFAEnabled(false)
                    updatedSessionData = { isWithDrawTwoFAActivated: false, isWithDrawOTPVerified: false }
                }
                session.update((data: Session) => {
                    return {
                        ...data,
                        user: {
                            ...data.user,
                            ...updatedSessionData
                        }
                    }
                })
            }, 2000)
            res.status === 200 ? setIsDisable(true) : setIsDisable(false)
        } catch (error: any) {
            console.log("TwoFADisableDialog ==>", error);
            toast({
                title: error.message || `Something went wrong while removing ${twoFAType}`,
                variant: "destructive",
                className: "text-white bg-red-500"
            })
        }
        setIsLoading(false)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className={cn("sm:max-w-[420px] bg-white", isMasterKeyActivated && "bg-red-500 text-white border-red-500")}
                onInteractOutside={(e) => {
                    e.preventDefault();
                }}>
                <DialogHeader>
                    <DialogTitle>{
                        !isMasterKeyActivated ?
                            twoFAType === "signInTwoFA" ? t("signIn2FA_title") : t("withdraw2FA_title")
                            :
                            `⚠️ ${t("warning")}`
                    }</DialogTitle>
                </DialogHeader>
                {
                    !isMasterKeyActivated ?
                        <>
                            <p className="text-sm text-slate-500">{twoFAType === "signInTwoFA" ? t("signIn2FA_desc1") : t("withdraw2FA_desc1")}</p>
                            <p className="text-sm text-slate-500">{t("desc2")} <span className="font-bold py-[2px] border-black/40 px-[5px] rounded-lg border-[1px]">{"Master Key"}</span> {t("desc3")}</p>
                        </>
                        :
                        <div className="mt-2">
                            <p>{t("remove_2FA_warning")} <span className="font-bold">{t(`${twoFAType}`)}</span></p>
                        </div>
                }
                {!isMasterKeyActivated ? <DialogClose
                    className="bg-purple-600 text-white rounded-xl py-2 font-medium"
                > {t("btn")} </DialogClose>
                    :
                    <Button
                        onClick={handleClick}
                        disabled={isLoading || isDisable}
                        className="bg-white text-black mt-5 rounded-xl py-2 font-medium">
                        {isLoading ? t("proceeding") : t("proceed")}
                    </Button>
                }
            </DialogContent>
        </Dialog>
    )
}