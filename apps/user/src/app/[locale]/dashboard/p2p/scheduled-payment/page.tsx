import React from 'react'
import { PaymentScheduler } from "@repo/ui/ScheduledPayment"
import { useRedirectToLogin } from "../../../../../hooks/useRedirect"
import { sendVerificationEmailAction } from "../../../../../lib/auth"
import { generatePincode, sendEmergencyCode, resetPin } from "../../../../../lib/wallet"
import { checkAccountLockStatus, updateLockStatus } from "../../../../../lib/account"
import {sendMoneyAction,sendOTPAction,verifyOTP} from "../../../../../lib/sendMoney"
import {addPaymentSchedule,cancelPaymentSchedule,editPaymentScheduleJob} from "../../../../../lib/scheduler/scheduler"


interface PageProps {
    params: { locale: string }
}
async function page({ params }: PageProps) {
    await useRedirectToLogin(params.locale, "/login")
    const account = await checkAccountLockStatus()
    const isAccountLock = account.isLock ?? false

    return (
        <PaymentScheduler 
        sendMoneyAction={sendMoneyAction}
        sendOTPAction={sendOTPAction}
        sendVerificationEmailAction={sendVerificationEmailAction}
        verifyOTP={verifyOTP}
        generatePincode={generatePincode}
        resetPin={resetPin}
        sendEmergencyCode={sendEmergencyCode}
        addPaymentSchedule={addPaymentSchedule}
        cancelPaymentSchedule={cancelPaymentSchedule}
        editPaymentScheduleJob={editPaymentScheduleJob}
        checkAccountLockStatus={checkAccountLockStatus}
        updateLockStatus={updateLockStatus}
        isAccountLock={isAccountLock}
        />
    )
}

export default page