import { AddMoney } from '../molecules/Addmoney'
import { Balance } from '../molecules/Balance'
import { Balance as UserBalance } from "@repo/db/type"
import { addMoneyPayload } from "@repo/forms/addMoneySchema"
import { OnRampStatus } from "@repo/db/type"
import { OnRampTransaction } from "../molecules/OnRampTransaction"

interface DepositProps {
    addMoneyAction: (args: addMoneyPayload, token: string) => Promise<{ message: string; statusCode: number; }>
    userBalance: Omit<UserBalance, "id" | "userId">
}
export const Deposit: React.FC<DepositProps> = ({ addMoneyAction, userBalance }) => {
    return (
        <>
            <div className='flex gap-10'>
                <AddMoney userBalance={userBalance} addMoneyAction={addMoneyAction} />
                <div className='flex flex-col gap-10'>
                    <Balance userBalance={userBalance} />
                    <OnRampTransaction />
                </div>
            </div>
        </>
    )
}
