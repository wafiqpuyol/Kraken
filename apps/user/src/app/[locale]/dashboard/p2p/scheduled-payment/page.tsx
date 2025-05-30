import React from 'react'
import { PaymentScheduler } from "@repo/ui/ScheduledPayment"
import { useRedirectToLogin } from "../../../../../hooks/useRedirect"
import { sendVerificationEmailAction } from "../../../../../lib/auth"
import { generatePincode, sendEmergencyCode, resetPin } from "../../../../../lib/wallet"
import { checkAccountLockStatus, updateLockStatus } from "../../../../../lib/account"


interface PageProps {
    params: { locale: string }
}
async function page({ params }: PageProps) {
    // await useRedirectToLogin(params.locale, "/login")
    // const account = await checkAccountLockStatus()
    // const isAccountLock = account.isLock ?? false

    return (
        <PaymentScheduler
            
        />
    )
}

export default page