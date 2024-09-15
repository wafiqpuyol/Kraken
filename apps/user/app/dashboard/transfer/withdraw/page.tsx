import React from 'react'
import { Withdraw } from "@repo/ui/Withdraw"
import { authOptions } from "@repo/network"
import { redirect } from 'next/navigation'
import { getServerSession } from "next-auth"

async function page() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.uid) {
        redirect("/login")
    }
    return (
        <Withdraw />
    )
}

export default page