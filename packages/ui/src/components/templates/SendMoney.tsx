"use client"

import { Button } from "../atoms/Button"
import { cn } from "../../lib/utils"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { useTranslations } from "next-intl";

interface ISendMoneyProps {
    children: React.ReactNode
}
export const SendMoney: React.FC<ISendMoneyProps> = ({ children }) => {
    const t = useTranslations("SendMoney")
    const pathName = usePathname();
    return (
        <div className="min-h-screen bg-gray-100 p-8 w-[1400px]">
            <div className="w-full mx-auto">
                <div className="mt-4 flex space-x-4">
                    <Button className={cn("rounded-lg px-4 py-3 text-lg ", pathName.endsWith("/send-money") ? `bg-white text-black/85` : `bg-gray-100 text-gray-500/90`)}><Link href="send-money">{t("sendMoney_tab")}</Link></Button>
                    <Button className={cn("rounded-lg px-4 py-3 text-lg ", pathName.endsWith("/scheduled-payment") ? `bg-white text-black/85` : `bg-gray-100 text-gray-500/90`)}><Link href="scheduled-payment">{t("scheduledPayment_tab")}</Link></Button>
                </div>
                {children}
            </div>
        </div>
    )
}