"use client"

import { Button } from "../../atoms/Button"
import { Card, CardContent } from "../../atoms/Card"
import { Badge } from "../../atoms/Badge"
import { useSession } from "next-auth/react"
import { TwoFAEnableDialog } from "../../molecules/TwoFAEnableModal"
import { TwoFADisableDialog } from "../../molecules/TwoFADisableDialog"
import { useToast } from "../../molecules/Toaster/use-toast"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { ChangePasswordDialog } from "../../molecules/ChangePasswordDialog"
import { changePasswordPayload } from "@repo/forms/changePasswordSchema"

interface SecurityTabProps {
    isTwoFaEnabled: boolean
    getTwoFASecret: () => Promise<{
        message?: string;
        status?: number;
        twoFactorSecret?: string | undefined;
    }>
    activate2fa: (otp: string) => Promise<{
        message: string;
        status: number;
    }>,
    changePasswordAction: (payload: changePasswordPayload) => Promise<{
        message: string | undefined;
        status: number;
    }>

}
export const SecurityTab: React.FC<SecurityTabProps> = ({ getTwoFASecret, isTwoFaEnabled, activate2fa, changePasswordAction }) => {
    const session = useSession()
    const { toast } = useToast()
    const [code, setCode] = useState("");
    const t = useTranslations("SecurityTab")

    const handleClick = async () => {
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

    return (
        <div className="space-y-6 bg-white">
            <Card>
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
                                        <span className="text-slate-500 ml-2">({session.data?.user?.email})</span>
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

            <Card>
                <CardContent className="pt-6">
                    <h2 className="text-2xl font-semibold mb-4">{t("twoFA_title")}(2FA)</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center justify-between space-x-32">
                                <div className="flex flex-col items-start">
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">{t("passkeys")}</h3>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 rounded-md">{t("recommended")}</Badge>
                                </div>
                                <p className="mt-1 text-sm text-slate-500">
                                    {t("passkeys_text")}
                                    <a href="#" className="text-purple-600 hover:underline font-medium"> {t("learn_more")}</a>
                                </p>
                            </div>
                            <Button variant="outline" className="text-purple-600 bg-purple-200">{t("add_passkey")}</Button>
                        </div>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center justify-between space-x-28">
                                <h3 className="text-sm font-medium text-gray-500">{t("authenticator_app")}</h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    {t("authenticator_app_text")}
                                    <a href="#" className="text-purple-600 hover:underline font-medium"> {t("learn_more")}</a>
                                </p>
                            </div>
                            {
                                isTwoFaEnabled ?
                                    <TwoFADisableDialog ><Button variant="outline" className="text-purple-600 bg-purple-200">{t("remove")}</Button></TwoFADisableDialog>
                                    :
                                    <TwoFAEnableDialog code={code} activate2fa={activate2fa}><Button variant="outline" className="text-purple-600 bg-purple-200" onClick={handleClick}>Enable</Button></TwoFAEnableDialog>
                            }
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}