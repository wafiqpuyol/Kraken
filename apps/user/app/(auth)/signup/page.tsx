import React from 'react'
import { SignUpForm } from "@repo/ui/SignUpForm"
import { signUpAction } from "../../../lib/auth"
import { getServerSession } from "next-auth"
import { redirect } from 'next/navigation'
import { authOptions } from '@repo/network'

async function page() {
    const session = await getServerSession(authOptions)
    if (session?.user || session?.user?.uid) {
        redirect("/dashboard/home")
    }
    return (
        <div>
            <SignUpForm signUpAction={signUpAction} />
        </div>
    )
}

export default page