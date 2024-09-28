import React from 'react'
import { Withdraw } from "@repo/ui/Withdraw"
import { useRedirectToLogin } from "../../../../../hooks/useRedirect"

async function page({ params: { locale } }: { params: { locale: string } }) {
    await useRedirectToLogin(locale, "/login")
    return (
        <Withdraw />
    )
}

export default page