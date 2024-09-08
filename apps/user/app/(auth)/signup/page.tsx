"use client"
import React from 'react'
import { SignUpForm } from "@repo/ui/SignUpForm"
import { signUpAction } from "../../../lib/action"
const page = () => {
    return (
        <div>
            <SignUpForm signUpAction={signUpAction} />
        </div>
    )
}

export default page