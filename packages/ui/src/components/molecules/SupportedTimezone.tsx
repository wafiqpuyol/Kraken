import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader } from "./Dialog"
import { SUPPORTED_TIMEZONE } from "../../lib/constant"
import { cn } from "../../lib/utils"
import { Dispatch, SetStateAction, useState } from "react"
import { Tick } from "../../icons/index"
import { preference } from "@repo/db/type"
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';


interface SupportedTimezoneDialogProps {
    children: React.ReactNode
    currentTimezone: string
    updatePreference: (payload: Partial<preference>) => Promise<{
        message: string;
        statusCode: number;
        updatedPreference?: preference
    }>
    setPreference: Dispatch<SetStateAction<Omit<preference, "id" | "userId">>>
}

export const SupportedTimezoneDialog: React.FC<SupportedTimezoneDialogProps> = ({ children, currentTimezone, setPreference, updatePreference }) => {
    const t = useTranslations("SupportedCurrencyDialog");
    const [save, setSave] = useState(false);
    const [supportedTimezone, setSupportedTimezone] = useState(currentTimezone);
    const router = useRouter();

    const handleClick = async () => {
        (() => setSave(true))()
        await updatePreference({ timezone: supportedTimezone }).then((res) => {
            setPreference((prev: any) => ({ ...prev, timezone: res.updatedPreference?.timezone }))
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
                    <DialogTitle className="text-xl mb-3">Timezone</DialogTitle>
                </DialogHeader>
                <div>
                    {
                        SUPPORTED_TIMEZONE.map((timezone, idx) => (
                            <div className="cursor-pointer hover:bg-slate-100" onClick={() => {
                                setSupportedTimezone(timezone)
                            }}>
                                <div className="px-4">
                                    <div className="flex items-center justify-between">
                                        <p key={idx} className="font-medium text-slate-900 py-5">{timezone}</p>
                                        {supportedTimezone === timezone && <Tick />}
                                    </div>
                                    <div className={cn(idx !== SUPPORTED_TIMEZONE.length - 1 && "border-b-[0.2px] border-gray-200")}></div>
                                </div>
                            </div>
                        ))
                    }
                </div>
                <button disabled={currentTimezone === supportedTimezone} onClick={handleClick} className={cn(
                    "bg-purple-600 text-white rounded-xl py-2 font-medium",
                    currentTimezone === supportedTimezone && "bg-purple-300"
                )}>
                    {save ? t("saving") : t("save")}
                </button>
            </DialogContent>
        </Dialog>
    )
}
