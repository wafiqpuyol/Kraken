"use client"

import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader } from "./Dialog"
import { SUPPORTED_CURRENCY } from "../../lib/constant"
import { cn } from "../../lib/utils"
import { Dispatch, SetStateAction, useState } from "react"
import { Tick } from "../../icons/index"
import { preference } from "@repo/db/type"
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"
import { useTranslations } from 'next-intl';


interface SupportedCurrencyDialogProps {
    children: React.ReactNode
    currentCurrency: string
    updatePreference: (payload: Partial<preference>) => Promise<{
        message: string;
        statusCode: number;
        updatedPreference?: preference
    }>
    setPreference: Dispatch<SetStateAction<Omit<preference, "id" | "userId">>>
}

export const SupportedCurrencyDialog: React.FC<SupportedCurrencyDialogProps> = ({ children, currentCurrency, setPreference, updatePreference }) => {
    const t = useTranslations("SupportedCurrencyDialog");
    const [save, setSave] = useState(false);
    const [supportedCurrency, setSupportedCurrency] = useState(currentCurrency);
    const router = useRouter();
    const session = useSession()

    const handleClick = async () => {
        (() => setSave(true))()
        await updatePreference({ currency: supportedCurrency }).then((res) => {
            setPreference((prev: any) => ({ ...prev, currency: res.updatedPreference?.currency }))
            session.update((data) => {
                return {
                    ...data,
                    data: {
                        ...data.data,
                        preference: {
                            ...data.data.preference,
                            selected_currency: res.updatedPreference?.currency
                        }
                    }
                }
            })
            setSave(false)
        })
        router.refresh();
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] bg-white" onInteractOutside={(e) => {
                e.preventDefault();
            }}>
                <DialogHeader>
                    <DialogTitle className="text-xl mb-3">{t("title")}</DialogTitle>
                </DialogHeader>
                <div>
                    {
                        SUPPORTED_CURRENCY.map((currency, idx) => (
                            <div className="cursor-pointer hover:bg-slate-100 flex gap-4 items-center justify-center">
                                <currency.image />
                                <div className="w-full px-2">
                                    <div className="flex items-center justify-between gap-2 py-3" onClick={() => setSupportedCurrency(currency.name)}>
                                        <div>
                                            <p key={idx} className="font-medium text-slate-900">{t(`${currency.title}.title`)}</p>
                                            <span key={idx} className="text-sm text-slate-500">{t(`${currency.title}.name`)}</span>
                                        </div>
                                        {(supportedCurrency === currency.name) && <Tick />}
                                    </div>
                                    <div className={cn(idx !== [].length - 1 && "border-b-[0.2px] border-gray-200")}></div>
                                </div>
                            </div>
                        ))
                    }
                </div>
                <button disabled={currentCurrency === supportedCurrency} onClick={handleClick} className={cn(
                    "bg-purple-600 text-white rounded-xl py-2 font-medium",
                    currentCurrency === supportedCurrency && "bg-purple-300"
                )}>
                    {save ? t("saving") : t("save")}
                </button>
            </DialogContent>
        </Dialog>
    )
}
