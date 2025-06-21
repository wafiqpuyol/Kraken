import { TrxnToolTip } from "./TrxnToolTip"
import {cn} from "@/src/lib/utils"
import { useTranslations } from 'next-intl';

interface IToggleTransactionTypeProps {
    currentCurrency : string
    walletCurrency : string
}

export const ToggleTransactionType:React.FC<IToggleTransactionTypeProps> = ({currentCurrency,walletCurrency}) => {
    const t = useTranslations("SendMoneyPage")
    return (
        <div className="mb-5">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-destructive">{t("transaction_type")}</label>
            <div className="py-1 px-5 flex gap-1 justify-between border-[1px] border-slate-300 rounded-2xl">
                <TrxnToolTip>
                    <button type="button" className={cn("text-slate-800 py-1 font-medium", (currentCurrency === walletCurrency) && "bg-purple-500 text-white px-2 rounded-xl")}>{t("Domestic")}</button>
                </TrxnToolTip>
                <div className="w-[2px] bg-slate-400"></div>
                <TrxnToolTip>
                    <button type="button" className={cn("text-slate-800 py-1 font-medium", (currentCurrency !== walletCurrency) && "bg-purple-500 text-white px-2 rounded-xl")}>{t("International")}</button>
                </TrxnToolTip>
            </div>
        </div>
    )
}