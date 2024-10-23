import React from 'react'
import { SendMoneyPage } from "@repo/ui/SendMoneyPage"
import { sendMoneyAction, getAllP2PTransactionHistories, sendOTPAction, verifyOTP, getAllP2PTransactionByTrxnID } from "../../../../lib/sendMoney"
import { useRedirectToLogin } from "../../../../hooks/useRedirect"
import { sendVerificationEmailAction } from "../../../../lib/auth"
import { generatePincode, sendEmergencyCode, resetPin } from "../../../../lib/wallet"
import { checkAccountLockStatus, updateLockStatus } from "../../../../lib/account"
import { getServerSession } from "next-auth"
import { prisma } from "@repo/db/client"
import { preference } from "@repo/db/type"
import { authOptions } from "@repo/network"


interface PageProps {
    params: { locale: string }
}
async function page({ params }: PageProps) {
    await useRedirectToLogin(params.locale, "/login")
    const session = await getServerSession(authOptions)
    const getUserPreference = await prisma.preference.findFirst({ where: { userId: session?.user?.uid } }) as preference
    const p2pTransactionHistories = await getAllP2PTransactionHistories()
    const account = await checkAccountLockStatus()
    const isAccountLock = account.isLock ?? false

    return (
        <SendMoneyPage sendMoneyAction={sendMoneyAction} p2pTransactionHistories={p2pTransactionHistories} sendVerificationEmailAction={sendVerificationEmailAction} generatePincode={generatePincode}
            sendEmergencyCode={sendEmergencyCode} resetPin={resetPin} sendOTPAction={sendOTPAction} verifyOTP={verifyOTP} isAccountLock={isAccountLock}
            checkAccountLockStatus={checkAccountLockStatus} updateLockStatus={updateLockStatus} getAllP2PTransactionByTrxnID={getAllP2PTransactionByTrxnID} />
    )
}

export default page