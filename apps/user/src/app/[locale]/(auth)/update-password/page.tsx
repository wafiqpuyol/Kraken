import React from 'react'
import { resetPasswordAction } from "../../../../lib/auth"
import { ResetPasswordForm } from "@repo/ui/ResetPasswordForm"
import { useRedirect } from "../../../../hooks/useRedirect"

const page = async ({ searchParams, params }: { searchParams: { token?: string }, params: { locale: string } }) => {
    await useRedirect(params.locale, "/dashboard/portfolio")

    const { token } = searchParams
    return (
        <ResetPasswordForm resetPasswordAction={resetPasswordAction} resetPasswordToken={token} />
    )
}

export default page 