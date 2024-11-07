"use client"
import { Button } from "../atoms/Button"
import { Label } from "../atoms/Label"
import { user, preference } from "@repo/db/type"
import { SupportedLangDialog } from "./SupportedLangDialog"
import { SupportedCurrencyDialog } from "./SupportedCurrencyDialog"
import { SupportedTimezoneDialog } from "./SupportedTimezone"
import { useState } from "react"
import { useTranslations } from 'next-intl';
import { responseHandler } from "../../lib/utils"
import { useToast } from "./Toaster/use-toast"
import { SignallingManager } from "../../lib/utils"
import { useSession } from "next-auth/react"
import { Session } from "next-auth"

interface PreferencesProps {
    userDetails: user
    userPreference: preference
    updatePreference: (payload: Partial<preference>) => Promise<{
        message: string;
        statusCode: number;
    }>
    notificationStatus: boolean
}


export const Preferences: React.FC<PreferencesProps> = ({ userDetails, userPreference, updatePreference, notificationStatus }) => {
    const t = useTranslations("Preferences")
    const [preference, setPreference] = useState<Omit<preference, "id" | "userId">>({
        ...userPreference
    })
    const language = preference.language === "U.S. English" ? "US English" : preference.language

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">{t("title")}</h2>
            <div className="space-y-4">
                {/* Language*/}
                <div className="flex justify-between items-center">
                    <div className="flex space-x-12">
                        <Label htmlFor="language" className="mt-2 text-slate-500 w-36">{t("language")}</Label>
                        <div className="mr-2">
                            <p className="font-base">{t(`${language}.name`)}</p>
                        </div>
                    </div>
                    <SupportedLangDialog currentLang={preference.language} updatePreference={updatePreference} setPreference={setPreference}>
                        <Button variant="link" className="text-purple-600">{t("edit")}</Button>
                    </SupportedLangDialog>
                </div>
                {/* Currency */}
                <div className="flex justify-between items-center">
                    <div className="flex space-x-[50px]">
                        <Label htmlFor="currency" className="mt-2 text-slate-500 w-36">{t("currency")}</Label>
                        <div className="mr-2">
                            <p className="font-base">{t(`${preference.currency}.name`)}</p>
                        </div>
                    </div>
                    <SupportedCurrencyDialog currentCurrency={preference.currency} updatePreference={updatePreference} setPreference={setPreference}>
                        <Button variant="link" className="text-purple-600">{t("edit")}</Button>
                    </SupportedCurrencyDialog>
                </div>
                {/* Timezone */}
                <div className="flex justify-between items-center">
                    <div className="flex space-x-[50px]">
                        <Label htmlFor="timezone" className="mt-2 text-slate-500 w-36">{t("timezone")}</Label>
                        <div className="mr-2">
                            <p className="font-base">{preference.timezone}</p>
                        </div>
                    </div>
                    <SupportedTimezoneDialog currentTimezone={preference.timezone} setPreference={setPreference} updatePreference={updatePreference}>
                        <Button variant="link" className="text-purple-600">{t("edit")}</Button>
                    </SupportedTimezoneDialog>
                </div>
                <NotificationToggle updatePreference={updatePreference} notificationStatus={notificationStatus} />
            </div>
        </div >
    )
}

const NotificationToggle = ({ notificationStatus, updatePreference }: {
    notificationStatus: boolean, updatePreference: (payload: Partial<preference>) => Promise<{
        message: string;
        statusCode: number;
    }>
}) => {
    const [toggleNotification, setToggleNotification] = useState<boolean>(notificationStatus)
    const { toast } = useToast()
    const session = useSession()

    const handleClick = async () => {
        try {
            const res = await updatePreference({ notification_status: !toggleNotification });
            switch (res.statusCode) {
                case 200:
                    let updatedSessionData: any
                    (() => setToggleNotification(!toggleNotification))()
                    if (toggleNotification) {
                        SignallingManager.getInstance().closeConnection()
                        updatedSessionData = { notification_status: !toggleNotification }
                    } else {
                        SignallingManager.getInstance().sendMessage()
                        updatedSessionData = { notification_status: toggleNotification }
                    }

                    session.update((data: Session) => {
                        return {
                            ...data,
                            user: {
                                ...data.user,
                                preference: {
                                    ...data.user?.preference,
                                    ...updatedSessionData
                                }
                            }
                        }
                    })

                    return toast({
                        title: "Notification status updated successfully",
                        variant: "default",
                        className: "bg-green-500 text-white rounded-xl",
                        duration: 3000
                    })
            }
            responseHandler(res)
        } catch (error: any) {
            toast({
                title: `${error.message}`,
                variant: "destructive",
                className: "bg-red-500 text-white rounded-xl",
                duration: 3000
            })
        }
    }

    return (
        <div className="flex justify-between items-start">
            <div className="flex items-center justify-between space-x-[120px]">
                <h3 className="text-sm font-medium text-slate-500">Notification</h3>
                <p className="mt-1 text-sm">Customize your notification preference</p>
            </div>

            <Button variant="outline" className="text-purple-600 bg-purple-200" onClick={() => handleClick()}>{
                toggleNotification ? "Disable" : "Enable"}</Button>
        </div>
    )
}