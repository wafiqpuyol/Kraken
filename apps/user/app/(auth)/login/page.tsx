
import React from 'react'
import { SignInForm } from "@repo/ui/SignInForm"
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
            <SignInForm />
        </div>
    )
}

export default page