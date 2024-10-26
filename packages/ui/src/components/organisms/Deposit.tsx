import { AddMoney } from '../molecules/Addmoney'
import { Balance } from '../molecules/Balance'
import { WithDrawLimits } from '../molecules/WithdrawLimit'
import { balance as UserBalance } from "@repo/db/type"
import { addMoneyPayload } from "@repo/forms/addMoneySchema"
import { preference } from "@repo/db/type"

interface DepositProps {
    onRampTransactionLimitDetail: {
        perDayTotal: number;
        perMonthTotal: number;
    } | undefined
    addMoneyAction: (args: addMoneyPayload, token: string, withDrawLimit: DepositProps["onRampTransactionLimitDetail"]) => Promise<{ message: string; status: number; }>
    userBalance: Omit<UserBalance, "id" | "userId">,
    userPreference: preference
    sendVerificationEmailAction: (locale: string) => Promise<{
        message: string;
        status: number;
    }>
    activate2fa: (otp: string, twoFAType: "signInTwoFA" | "withDrawTwoFA") => Promise<{
        message: string;
        status: number;
    }>
    disable2fa: (twoFAType: "signInTwoFA" | "withDrawTwoFA") => Promise<void>
}
export const Deposit: React.FC<DepositProps> = ({ onRampTransactionLimitDetail, addMoneyAction, userBalance, userPreference,
    sendVerificationEmailAction, activate2fa, disable2fa }) => {
    console.log(userBalance);
    return (
        <>
            <div className='flex gap-10'>
                <AddMoney disable2fa={disable2fa} activate2fa={activate2fa} userBalance={userBalance} addMoneyAction={addMoneyAction} sendVerificationEmailAction={sendVerificationEmailAction}
                    onRampTransactionLimitDetail={onRampTransactionLimitDetail} />
                <div className='flex flex-col gap-10'>
                    <Balance userBalance={userBalance} userPreference={userPreference} />
                    <WithDrawLimits onRampTransactionLimitDetail={onRampTransactionLimitDetail} />
                </div>
            </div>
        </>
    )
}
