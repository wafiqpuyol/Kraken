import React from 'react'
import { SendMoneyPage } from "@repo/ui/SendMoneyPage"
import { sendMoneyAction } from "../../../lib/sendMoney"
const page = () => {
    return (
        <SendMoneyPage sendMoneyAction={sendMoneyAction} />
    )
}

export default page