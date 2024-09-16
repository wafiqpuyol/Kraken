import React from 'react'
import { getServerSession } from "next-auth"
import { redirect } from 'next/navigation'
import { authOptions } from '@repo/network'
import { ChangePasswordForm } from "@repo/ui/ChangePasswordForm"
import { changePasswordAction } from "../../../../lib/auth"

async function page() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.uid) {
        redirect("/login")
    }
    return (
        <ChangePasswordForm changePasswordAction={changePasswordAction} />
    )
}

export default page