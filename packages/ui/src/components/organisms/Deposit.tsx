import { AddMoney } from '../molecules/Addmoney'
import { Balance } from '../molecules/Balance'
import { Balance as UserBalance } from "@repo/db/type"
import { addMoneyPayload } from "@repo/forms/addMoneySchema"
import { OnRampStatus } from "@repo/db/type"

interface DepositProps {
    addMoneyAction: (args: addMoneyPayload) => void
    userBalance: Omit<UserBalance, "id" | "userId">
    onRamps: {
        time: Date,
        amount: number,
        status: OnRampStatus,
        provider: string
    }[]
}
export const Deposit: React.FC<DepositProps> = ({ addMoneyAction, userBalance, onRamps }) => {
    return (
        <>
            <div className='flex gap-10'>
                <AddMoney userBalance={userBalance} addMoneyAction={addMoneyAction} />
                <Balance userBalance={userBalance} />
            </div>
            <div>
                <div className="pt-4">
                    {/* <OnRampTransactions transactions={transactions} /> */}
                </div>
            </div>
        </>
    )
}
