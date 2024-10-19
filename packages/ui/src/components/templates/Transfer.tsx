"use client"

import { Button } from "../atoms/Button"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { cn } from "../../lib/utils"
import { useTranslations } from "next-intl";

interface TransferProps {
    children: React.ReactNode
}
export const Transfer: React.FC<TransferProps> = ({ children }) => {
    const t = useTranslations("Transfer")
    const pathName = usePathname();
    return (
        <div className="w-screen p-8">
            <div className="text-4xl text-purple-600 mb-8 font-bold">
                {t("title")}
            </div>
            <div className="flex gap-5">
                <Button className={cn("rounded-lg px-4 py-3 text-lg ", pathName.endsWith("/withdraw") ? `bg-white text-black/85` : `bg-gray-100 text-gray-500/90`)}><Link href="withdraw">Withdraw</Link></Button>
            </div>
            <div className="mt-10">
                {children}
            </div>
        </div>
    )
}
