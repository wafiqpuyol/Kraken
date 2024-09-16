import React from 'react'
import { resetPasswordAction } from "../../../lib/auth"
import { ResetPasswordForm } from "@repo/ui/ResetPasswordForm"
const page = ({ searchParams }: { searchParams: { token?: string } }) => {
    const { token } = searchParams
    return (
        <ResetPasswordForm resetPasswordAction={resetPasswordAction} resetPasswordToken={token} />
    )
}

export default page