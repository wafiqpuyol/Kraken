"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../atoms/Select"
import { Button } from "../atoms/Button"
import { Label } from "../atoms/Label"
import { user, preference } from "@repo/db/type"
import { SupportedLangDialog } from "./SupportedLangDialog"
import { SupportedCurrencyDialog } from "./SupportedCurrencyDialog"
import { SupportedTimezoneDialog } from "./SupportedTimezone"
import { useState } from "react"
import { useTranslations } from 'next-intl';

interface PreferencesProps {
    userDetails: user
    userPreference: preference
    updatePreference: (payload: Partial<preference>) => Promise<{
        message: string;
        statusCode: number;
    }>
}


export const Preferences: React.FC<PreferencesProps> = ({ userDetails, userPreference, updatePreference }) => {
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
                {/* Auto log-out */}
                <div className="flex justify-between items-center">
                    <div className="flex space-x-[100px]">
                        <Label htmlFor="autoLogout" className="mt-2 text-slate-500 w-44">{t("auto_log_out")}</Label>
                        <Select defaultValue="8">
                            <SelectTrigger id="autoLogout">
                                <SelectValue placeholder="Select auto log-out time" />
                            </SelectTrigger>
                            <SelectContent className='bg-white text-black'>
                                <SelectItem className="cursor-pointer" value="8">Default (8 hours)</SelectItem>
                                <SelectItem className="cursor-pointer" value="4">4 hours</SelectItem>
                                <SelectItem className="cursor-pointer" value="2">2 hours</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="link" className="text-purple-600">{t("edit")}</Button>
                </div>
            </div>
        </div >
    )
}