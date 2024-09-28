import React from 'react'
import { ForgotPasswordForm } from "@repo/ui/ForgotPasswordForm"
import { forgotPasswordAction } from "../../../../lib/auth"
import { useRedirect } from "../../../../hooks/useRedirect"

const page = async ({ params }: { params: { locale: string } }) => {
    await useRedirect(params.locale, "/dashboard/home")

    return (
        <ForgotPasswordForm forgotPasswordAction={forgotPasswordAction} />
    )
}

export default page