import { AddMoney } from '../molecules/Addmoney'
import { Balance } from '../molecules/Balance'
import { balance as UserBalance } from "@repo/db/type"
import { addMoneyPayload } from "@repo/forms/addMoneySchema"
import { OnRampTransaction } from "../molecules/OnRampTransaction"
import { preference } from "@repo/db/type"

interface DepositProps {
    addMoneyAction: (args: addMoneyPayload, token: string) => Promise<{ message: string; statusCode: number; }>
    userBalance: Omit<UserBalance, "id" | "userId">,
    userPreference: preference
}
export const Deposit: React.FC<DepositProps> = ({ addMoneyAction, userBalance, userPreference }) => {
    return (
        <>
            <div className='flex gap-10'>
                <AddMoney userBalance={userBalance} addMoneyAction={addMoneyAction} />
                <div className='flex flex-col gap-10'>
                    <Balance userBalance={userBalance} userPreference={userPreference} />
                    <OnRampTransaction />
                </div>
            </div>
        </>
    )
}
