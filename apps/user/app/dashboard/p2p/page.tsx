import React from 'react'
import { SendMoneyPage } from "@repo/ui/SendMoneyPage"
import { sendMoneyAction } from "../../../lib/sendMoney"
import { getServerSession } from "next-auth"
import { redirect } from 'next/navigation'
import { authOptions } from '@repo/network'
async function page() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.uid) {
        redirect("/login")
    }
    return (
        <SendMoneyPage sendMoneyAction={sendMoneyAction} />
    )
}

export default page