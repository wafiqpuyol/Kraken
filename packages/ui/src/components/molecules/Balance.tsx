import { Balance as UserBalance } from "@repo/db/type"
interface BalanceProps {
    userBalance: Omit<UserBalance, "id" | "userId">
}

export const Balance: React.FC<BalanceProps> = ({ userBalance }) => {
    return (
        <div className="flex bg-white rounded-lg">
            <div className="bg-card p-4 rounded-lg shadow-md w-[720px]">
                <h2 className="text-xl font-semibold text-foreground">Balances</h2>
                <div className="mt-4">
                    <div className="flex justify-between py-2 border-b border-border font-medium text-gray-500">
                        <span>Unlocked balance</span>
                        <span className="text-black/85">{userBalance.amount} BDT</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border font-medium text-gray-500">
                        <span>Unlocked balance</span>
                        <span className="text-black/85">{userBalance.locked}  BDT</span>
                    </div>
                    <div className="flex justify-between py-2 font-medium text-gray-500">
                        <span >Total balance</span>
                        <span className="text-black/85">{(userBalance.amount + userBalance.locked) / 100}  BDT</span>
                    </div>
                </div>
            </div>
        </div>
    )
}