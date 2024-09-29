import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader } from "./Dialog"
import { SUPPORTED_LANGUAGE } from "../../lib/constant"
import { cn } from "../../lib/utils"
import { Dispatch, SetStateAction, useState } from "react"
import { Tick } from "../../icons/index"
import { preference } from "@repo/db/type"
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';

interface SupportedLangDialogProps {
    children: React.ReactNode
    currentLang: string
    updatePreference: (payload: Partial<preference>) => Promise<{
        message: string;
        statusCode: number;
        updatedPreference?: preference
    }>
    setPreference: Dispatch<SetStateAction<Omit<preference, "id" | "userId">>>
}

export const SupportedLangDialog: React.FC<SupportedLangDialogProps> = ({ children, currentLang, updatePreference, setPreference }) => {
    const params = useParams()
    const path = usePathname()
    const router = useRouter()
    const t = useTranslations("SupportedLangDialog")
    const redirectURL = path.replace(`/${params.locale}`, "")
    const [supportedLang, setSupportedLang] = useState({
        language: currentLang,
        code: params.locale
    });
    const [save, setSave] = useState(false);
    const handleClick = async () => {
        (() => setSave(true))()
        await updatePreference({ language: supportedLang.language }).then((res) => {
            setPreference((prev: any) => ({ ...prev, language: res.updatedPreference?.language }))
            setSave(false)
        })
        router.push(`/${supportedLang.code}${redirectURL}`)
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
                    <DialogTitle className="text-xl mb-3">Language</DialogTitle>
                </DialogHeader>
                <div>
                    {
                        SUPPORTED_LANGUAGE.map((lang, idx) => (
                            <div className="cursor-pointer hover:bg-slate-100" onClick={() => {
                                setSupportedLang({ language: lang.title, code: lang.code })
                            }}>
                                <div className="px-2">
                                    <div className="flex items-center justify-between">
                                        <p key={idx} className="font-medium text-slate-900 py-4">{t(`${lang.title}.name`)}</p>
                                        {supportedLang.language === lang.title && <Tick />}
                                    </div>
                                    <div className={cn(idx !== SUPPORTED_LANGUAGE.length - 1 && "border-b-[0.2px] border-gray-200")}></div>
                                </div>
                            </div>
                        ))
                    }
                </div>
                <button disabled={currentLang === supportedLang.language} onClick={handleClick} className={cn(
                    "bg-purple-600 text-white rounded-xl py-2 font-medium",
                    currentLang === supportedLang.language && "bg-purple-300"
                )}>
                    {save ? t("saving") : t("save")}
                </button>
            </DialogContent>
        </Dialog>
    )
}
