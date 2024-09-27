"use client"

import { Button } from '../atoms/Button'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl';

export const OnRampTransaction = () => {
    const router = useRouter()
    const locale = useLocale()
    const t = useTranslations("OnRampTransaction")
    return (
        <div className="flex bg-white rounded-lg h-32">
            <div className="bg-card p-4 rounded-lg shadow-md w-[720px]">
                <h2 className="text-xl font-semibold text-foreground mb-7">{t("title")}</h2>
                <Button className="text-white bg-black  hover:bg-black/80" onClick={() => router.push(`/${locale}/dashboard/transactions/history`)}>{t("view_transaction_button")}</Button>
            </div>
        </div>
    )
}
