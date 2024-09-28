import React from 'react'
import { SendMoneyPage } from "@repo/ui/SendMoneyPage"
import { sendMoneyAction } from "../../../../lib/sendMoney"
import { useRedirectToLogin } from "../../../../hooks/useRedirect"

async function page({ params }: { params: { locale: string } }) {
    await useRedirectToLogin(params.locale, "/login")
    return (
        <SendMoneyPage sendMoneyAction={sendMoneyAction} />
    )
}

export default page