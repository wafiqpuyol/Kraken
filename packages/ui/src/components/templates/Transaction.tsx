"use client"

import { Button } from "../atoms/Button"
import { cn } from "../../lib/utils"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { useTranslations } from "next-intl";

interface ITransactionProps {
    children: React.ReactNode
}
export const Transaction: React.FC<ITransactionProps> = ({ children }) => {
    const t = useTranslations("Transaction")
    const pathName = usePathname();
    return (
        <div className="min-h-screen bg-gray-100 p-8 w-[1400px]">
            <div className="w-full mx-auto">
                <h1 className="text-4xl font-bold text-purple-600">
                    {t("title")}
                </h1>
                <div className="mt-4 flex space-x-4">
                    <Button className={cn("rounded-lg px-4 py-3 text-lg ", pathName.endsWith("/p2p-history") ? `bg-white text-black/85` : `bg-gray-100 text-gray-500/90`)}><Link href="p2p-history">{t("p2pHistory_tab")}</Link></Button>
                    <Button className={cn("rounded-lg px-4 py-3 text-lg ", pathName.endsWith("/withdraw-history") ? `bg-white text-black/85` : `bg-gray-100 text-gray-500/90`)}><Link href="withdraw-history">{t("withDrawalHistory_tab")}</Link></Button>
                </div>
                {children}
            </div>
        </div>
    )
}