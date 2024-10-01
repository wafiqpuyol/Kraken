import React from 'react'
import { SendMoneyPage } from "@repo/ui/SendMoneyPage"
import { sendMoneyAction, getAllP2PTransactionHistories } from "../../../../lib/sendMoney"
import { useRedirectToLogin } from "../../../../hooks/useRedirect"
import { sendVerificationEmailAction } from "../../../../lib/auth"

async function page({ params }: { params: { locale: string } }) {
    await useRedirectToLogin(params.locale, "/login")
    const p2pTransactionHistories = await getAllP2PTransactionHistories()
    return (
        <SendMoneyPage sendMoneyAction={sendMoneyAction} p2pTransactionHistories={p2pTransactionHistories} sendVerificationEmailAction={sendVerificationEmailAction} />
    )
}

export default page