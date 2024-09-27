import { preference, balance as UserBalance } from "@repo/db/type"
import { useTranslations } from 'next-intl';

interface BalanceProps {
    userBalance: Omit<UserBalance, "id" | "userId">
    userPreference: preference
}

export const Balance: React.FC<BalanceProps> = ({ userBalance, userPreference }) => {
    const t = useTranslations("Balance")

    return (
        <div className="flex bg-white rounded-lg">
            <div className="bg-card p-4 rounded-lg shadow-md w-[720px]">
                <h2 className="text-xl font-semibold text-foreground">{t("title")}</h2>
                <div className="mt-4">
                    <div className="flex justify-between py-2 border-b border-border font-medium text-gray-500">
                        <span>{t("unlocked_balance")}</span>
                        <span className="text-black/85">{userBalance.amount / 100} {t(`${userPreference.currency}.name`)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border font-medium text-gray-500">
                        <span>{t("total_locked_balance")}</span>
                        <span className="text-black/85">{userBalance.locked / 100}  {t(`${userPreference.currency}.name`)}</span>
                    </div>
                    <div className="flex justify-between py-2 font-medium text-gray-500">
                        <span >{t("total_balance")}</span>
                        <span className="text-black/85">{(userBalance.amount + userBalance.locked) / 100}  {t(`${userPreference.currency}.name`)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}