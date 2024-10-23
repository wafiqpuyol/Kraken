import { Dialog, DialogTrigger, DialogContent } from './Dialog'
import { Badge } from "../atoms/Badge"
import { FaTableCellsRowLock } from "react-icons/fa6";
import { FaChevronRight } from "react-icons/fa";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../atoms/InputOTP"
import { Button } from "../atoms/Button"
import Image from 'next/image'
import { useToast } from "../molecules/Toaster/use-toast"
import { useState } from 'react';
import { startRegistration } from "@simplewebauthn/browser"
import { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/types"
import { useTranslations } from "next-intl"
import { responseHandler } from "../../lib/utils"

interface MasterKeyDialogProps {
    children: React.ReactNode
    verifyMasterKeyOTP: () => Promise<{
        masterKeyOTPVerified?: boolean;
    } | undefined>
    activate2fa: (otp: string, twoFAType: "signInTwoFA" | "withDrawTwoFA" | "masterKeyTwoFA") => Promise<{
        message: string;
        status: number;
    }>
    isMasterKeyOTPVerified: boolean
    createMasterKey: (step: "generateRegistration" | "verifyRegistration", regCred?: any) => Promise<{
        message: string;
        status: number;
        challenge?: PublicKeyCredentialCreationOptionsJSON;
    }>
    verifyPasskey: (step: "generateAuthentication" | "verifyAuthentication", regCred?: any) => Promise<{
        message: string;
        status: number;
        challenge?: PublicKeyCredentialRequestOptionsJSON;
    }>
}

export const MasterKeyDialog: React.FC<MasterKeyDialogProps> = ({ children, verifyMasterKeyOTP, activate2fa, isMasterKeyOTPVerified, createMasterKey, verifyPasskey }) => {
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast()
    const [masterKeySetupDialog, setMasterKeySetupDialog] = useState(isMasterKeyOTPVerified)
    const t = useTranslations("MasterKeyDialog")

    const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setIsLoading(true)
            const res = await activate2fa(otp, "masterKeyTwoFA");
            switch (res.status) {
                case 200:
                    toast({
                        title: res.message,
                        variant: "default"
                    })
                    const response = await verifyMasterKeyOTP()
                    setMasterKeySetupDialog(response?.masterKeyOTPVerified!)
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

    const handleMasterKeyBtn = async () => {
        try {
            let res: {
                message: string;
                status: number;
                challenge?: PublicKeyCredentialCreationOptionsJSON;
            }
            res = await createMasterKey("generateRegistration")
            if (res.status === 200) {
                const regResponse = await startRegistration({ ...res.challenge })
                res = await createMasterKey("verifyRegistration", { challenge: res.challenge, regResponseJSON: regResponse })
                responseHandler(res)
            }
            responseHandler(res)
        } catch (error: any) {
            console.log("MasterKeyDialog ===>", error.message);
            return toast({
                title: `${error.message}` || "Something went wrong while creating master key",
                variant: "destructive",
                className: "text-white bg-red-500"
            })
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[475px] bg-white " onInteractOutside={(e) => {
                e.preventDefault();
            }}>
                {
                    masterKeySetupDialog ?
                        <div>
                            <div className='mb-5 cursor-pointer'>
                                <h1 className='text-2xl font-medium mb-4'>{t("title")}</h1>
                                <p className='text-slate-600 font-medium'>{t("desc")}</p>
                            </div>

                            <div className='px-1 cursor-pointer'>
                                <div className='flex justify-between gap-5 mb-2 bg-slate-100/50 p-5 rounded-xl' onClick={handleMasterKeyBtn}>
                                    <div>
                                        <div className='flex items-center gap-x-2 mb-2'>
                                            <div className='bg-purple-200/60 p-3 rounded-full'><FaTableCellsRowLock className='text-purple-500 text-[22px]' /></div>
                                            <p className='font-medium text-[17px]'>{t("passkey_title")}</p>
                                        </div>
                                        <p className='text-slate-500 font-medium mb-2'>{t("passkey_desc")}</p>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 rounded-md text-[13px]">{t("recommended")}</Badge>
                                    </div>
                                    <div className='self-center mb-4'><FaChevronRight className='text-slate-700 text-xl' /></div>
                                </div>
                            </div>
                        </div>
                        :
                        <div>
                            <div>
                                <Image src="/authenticator-app.light.png" alt="authenticator app" width={250} height={250} className="ml-11" />
                            </div>
                            <div className="flex flex-col items-center">
                                <form onSubmit={handleOTPSubmit} className="flex flex-col gap-2">
                                    <div className="mb-5">
                                        <h1 className="self-start font-medium text-lg text-slate-900">{t("authenticator_app")}</h1>
                                        <p className="text-sm font-medium text-slate-500">
                                            {t("authenticator_app_text")}
                                        </p>

                                    </div>505997
                                    <p className="text-sm font-medium text-slate-500">
                                        {t("enter_2fa_code")}
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
                }
            </DialogContent>
        </Dialog>
    )
}