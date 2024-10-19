"use client"

import { Button } from "../../atoms/Button"
import { Card, CardContent } from "../../atoms/Card"
import { useSession } from "next-auth/react"
import { TwoFAEnableDialog } from "../../molecules/TwoFAEnableModal"
import { TwoFADisableDialog } from "../../molecules/TwoFADisableDialog"
import { useToast } from "../../molecules/Toaster/use-toast"
import React, { useState } from "react"
import { useTranslations } from "next-intl"
import { ChangePasswordDialog } from "../../molecules/ChangePasswordDialog"
import { changePasswordPayload } from "@repo/forms/changePasswordSchema"
import { Dialog, DialogContent, DialogTrigger } from "../../molecules/Dialog"
import { MasterKeyDialog } from "../../molecules/MasterKeyDialog"
import { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../atoms/ToolTip"

interface SecurityTabProps {
    isTwoFaEnabled: boolean
    getTwoFASecret: () => Promise<{
        message?: string;
        status?: number;
        twoFactorSecret?: string | undefined;
    }>
    activate2fa: (otp: string, twoFAType: "signInTwoFA" | "withDrawTwoFA" | "masterKeyTwoFA") => Promise<{
        message: string;
        status: number;
    }>,
    changePasswordAction: (payload: changePasswordPayload) => Promise<{
        message: string | undefined;
        status: number;
    }>
    getWithDrawTwoFASecret: () => Promise<{
        message?: string;
        status: number;
        withDrawTwoFASecret?: string | undefined;
    }>
    isWithDrawTwoFaEnabled: boolean
    verifyMasterKeyOTP: () => Promise<{
        masterKeyOTPVerified?: boolean;
    } | undefined>
    isMasterKeyOTPVerified: boolean
    createMasterKey: (step: "generateRegistration" | "verifyRegistration", regCred?: any) => Promise<{
        message: string; status: number; challenge?: PublicKeyCredentialCreationOptionsJSON
    }>
    verifyPasskey: (step: "generateAuthentication" | "verifyAuthentication", regCred?: any) => Promise<{
        message: string; status: number; challenge?: PublicKeyCredentialRequestOptionsJSON
    }>
    isMasterKeyActivated: boolean
    remove2fa: (twoFAType: "signInTwoFA" | "withDrawTwoFA") => Promise<{
        message: string;
        status: number;
    }>
}

export const SecurityTab: React.FC<SecurityTabProps> = ({ getTwoFASecret, isTwoFaEnabled, activate2fa, changePasswordAction,
    getWithDrawTwoFASecret, isWithDrawTwoFaEnabled, verifyMasterKeyOTP, isMasterKeyOTPVerified, createMasterKey, verifyPasskey, isMasterKeyActivated, remove2fa }) => {
    const session = useSession()
    const { toast } = useToast()
    const [code, setCode] = useState("");
    const [twoFAEnabled, setTwoFAEnabled] = useState(isTwoFaEnabled);
    const [withDrawTwoFAEnabled, setWithDrawTwoFAEnabled] = useState(isWithDrawTwoFaEnabled);
    const t = useTranslations("SecurityTab")

    const handleSignInTwoFABtn = async () => {
        const res = await getTwoFASecret()
        switch (res.status) {
            case 200:
                setCode(res.twoFactorSecret as string)
                break
            case 401:
                toast({
                    title: res.message,
                    variant: "destructive"
                })
                break
            case 500:
                toast({
                    title: res.message,
                    variant: "destructive"
                })
                break
        }
    }
    const handleWithDrawTwoFABtn = async () => {
        const res = await getWithDrawTwoFASecret()
        switch (res.status) {
            case 200:
                setCode(res.withDrawTwoFASecret as string)
                break
            case 401:
                toast({
                    title: res.message,
                    variant: "destructive"
                })
                break
            case 500:
                toast({
                    title: res.message,
                    variant: "destructive"
                })
                break
        }
    }

    return (
        <div className="space-y-6">
            <Card className="rounded-2xl bg-white">
                <CardContent className="pt-6">
                    <h2 className="text-2xl font-semibold mb-4">{t("signIn_title")}</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            {/* gap-x-40 */}
                            <div className="flex items-center justify-between space-x-40">
                                <h3 className="text-sm font-medium  text-gray-500 self-start">{t("signIn_with")}</h3>
                                <div>
                                    <p className="mt-1 font-medium">
                                        {t("email")}
                                        <span className="text-slate-600 ml-2">({session.data?.user?.email})</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center justify-between text-gray-500 space-x-44">
                                <h3 className="text-sm font-medium ">{t("password")}</h3>
                                <p className="mt-1 text-sm">{t("password_text")}</p>
                            </div>
                            <ChangePasswordDialog changePasswordAction={changePasswordAction}>
                                <Button variant="outline" className="text-purple-600 bg-purple-200">{t("change")}</Button>
                            </ChangePasswordDialog>
                        </div>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center justify-between space-x-36">
                                <h3 className="text-sm font-medium text-gray-500">{t("auto_sign_out")}</h3>
                                <div className="">
                                    <p className="mt-1 font-medium">{t("auto_sign_out_title")}</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {t("auto_sign_out_text")}
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" className="text-purple-600 bg-purple-200">{t("edit")}</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl">
                <CardContent className="pt-6">
                    <h2 className="text-2xl font-semibold mb-4">{t("twoFA_title")}</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center justify-between space-x-28">
                                <h3 className="text-sm font-medium text-gray-500">{t("authenticator_app")}</h3>
                                <p className="mt-1 text-sm text-slate-600">
                                    {t("authenticator_app_text")}
                                    <a href="#" className="text-purple-600 hover:underline font-medium"> {t("learn_more")}</a>
                                </p>
                            </div>
                            {
                                twoFAEnabled ?
                                    <TwoFADisableDialog isMasterKeyActivated={isMasterKeyActivated} twoFAType="signInTwoFA" verifyPasskey={verifyPasskey}
                                        setWithDrawTwoFAEnabled={setWithDrawTwoFAEnabled} setTwoFAEnabled={setTwoFAEnabled} remove2fa={remove2fa}>
                                        <Button variant="outline" className="text-purple-600 bg-purple-200" >{t("remove")}</Button>
                                    </TwoFADisableDialog>
                                    :
                                    <TwoFAEnableDialog setTwoFAEnabled={setTwoFAEnabled} code={code} activate2fa={activate2fa} twoFAType="signInTwoFA">
                                        <Button variant="outline" className="text-purple-600 bg-purple-200"
                                            onClick={handleSignInTwoFABtn}>
                                            {t("enable")}
                                        </Button>
                                    </TwoFAEnableDialog>
                            }
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl">
                <CardContent className="pt-6">
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold">{t("advance_settings")}</h2>
                        <p className="text-sm text-gray-500 font-medium">{t("desc")}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center justify-between space-x-[110px] w-[1050px]">
                                <div className="w-[150px]">
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">{t("master_key")}</h3>
                                </div>
                                <p className="mt-1 text-sm text-slate-600">
                                    {t("master_key_desc")}
                                    <a href="#" className="text-purple-600 hover:underline font-medium"> {t("learn_more")}</a>
                                </p>
                            </div>
                            {
                                isMasterKeyActivated ?
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="outline" className="text-purple-600 bg-purple-200">{t("activated")}</Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="w-[400px] bg-white rounded-lg font-medium text-slate-600">
                                                <p>{t("toolTip_text")}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    :
                                    <MasterKeyDialog verifyPasskey={verifyPasskey} createMasterKey={createMasterKey} isMasterKeyOTPVerified={isMasterKeyOTPVerified} activate2fa={activate2fa} verifyMasterKeyOTP={verifyMasterKeyOTP}>
                                        <Button variant="outline" className="text-purple-600 bg-purple-200">{t("enable")}</Button>
                                    </MasterKeyDialog>
                            }
                        </div>

                        <div className="flex justify-between items-start">
                            <div className="flex items-center justify-between space-x-[100px] w-[1050px]">
                                <h3 className="text-sm font-medium text-gray-500 w-[200px]">{t("withdraw_2FA")}</h3>
                                <p className="mt-1 text-sm text-slate-600">
                                    {t("withdraw_2FA_desc")}
                                    <a href="#" className="text-purple-600 hover:underline font-medium"> {t("learn_more")}</a>
                                </p>
                            </div>
                            {
                                isMasterKeyActivated || twoFAEnabled
                                    ?
                                    withDrawTwoFAEnabled
                                        ?
                                        <TwoFADisableDialog isMasterKeyActivated={isMasterKeyActivated} twoFAType="withDrawTwoFA" verifyPasskey={verifyPasskey}
                                            setWithDrawTwoFAEnabled={setWithDrawTwoFAEnabled} setTwoFAEnabled={setTwoFAEnabled} remove2fa={remove2fa}>
                                            <Button variant="outline" className="text-purple-600 bg-purple-200" >{t("remove")}</Button>
                                        </TwoFADisableDialog>
                                        :
                                        (twoFAEnabled
                                            ? <TwoFAEnableDialog
                                                setTwoFAEnabled={setTwoFAEnabled} code={code} setWithDrawTwoFAEnabled={setWithDrawTwoFAEnabled} activate2fa={activate2fa}
                                                twoFAType="withDrawTwoFA"><Button variant="outline" className="text-purple-600 bg-purple-200"
                                                    onClick={handleWithDrawTwoFABtn}>
                                                    {t("enable")}
                                                </Button>
                                            </TwoFAEnableDialog>
                                            :
                                            <Enable2FADialog>
                                                <Button variant="outline" className="text-purple-600 bg-purple-200">{t("enable")}</Button>
                                            </Enable2FADialog>
                                        )
                                    :
                                    <Enable2FADialog>
                                        <Button variant="outline" className="text-purple-600 bg-purple-200">{t("enable")}</Button>
                                    </Enable2FADialog>
                            }
                        </div>

                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

const Enable2FADialog = ({ children }: { children: React.ReactNode }) => {
    const t = useTranslations("Enable2FADialog");
    return (
        <Dialog >
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[440px] bg-white p-8" onInteractOutside={(e) => {
                e.preventDefault();
            }}>
                <p className="my-4 font-semibold text-lg">{t("title")}</p>
                <span className="px-2 text-sm font-medium text-slate-500 leading-[1.8rem]">{t("desc1")} &gt; {t("select")} <span className="font-bold py-[2px] border-black/40 px-[5px] rounded-lg border-[1px] mr-2">{t("security")}</span> {t("desc2")} &gt; {t("click_on")} {" "}
                    <span className="font-bold py-[2px] border-black/40 px-[5px] rounded-lg border-[1px] mr-2">{t("authenticator_app")}</span>
                    {t("desc3")}.</span>
            </DialogContent>
        </Dialog>)
}