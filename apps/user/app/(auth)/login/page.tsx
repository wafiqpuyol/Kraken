"use client"
import React from 'react'
import { SignInForm } from "@repo/ui/SignInForm"
import { useSession } from "next-auth/react"
import { redirect } from 'next/navigation'

const page = () => {
    const session = useSession()
    if (session.status === "authenticated") {
        redirect("/dashboard/home")
    }
    return (
        <div>
            <SignInForm />
        </div>
    )
}

export default page