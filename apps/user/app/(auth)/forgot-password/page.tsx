import React from 'react'
import { ForgotPasswordForm } from "@repo/ui/ForgotPasswordForm"
import { forgotPasswordAction } from "../../../lib/auth"
const page = () => {
    return (
        <ForgotPasswordForm forgotPasswordAction={forgotPasswordAction} />
    )
}

export default page