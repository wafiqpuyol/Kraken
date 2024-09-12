"use client"
import React from 'react'
import { SignUpForm } from "@repo/ui/SignUpForm"
import { signUpAction } from "../../../lib/auth"
import { useSession } from "next-auth/react"
import { redirect } from 'next/navigation'

const page = () => {
    const session = useSession()
    if (session.status === "authenticated") {
        redirect("/dashboard/home")
    }
    return (
        <div>
            <SignUpForm signUpAction={signUpAction} />
        </div>
    )
}

export default page