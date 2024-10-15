import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../atoms/ToolTip"
import { useTranslations } from "next-intl"

export const TrxnToolTip = ({ children }: { children: React.ReactNode }) => {
    const t = useTranslations("TrxnToolTip")
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                <TooltipContent className="bg-white rounded-lg font-medium text-slate-600">
                    <p>{t("tooltip_text")}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}