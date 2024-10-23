import React from 'react'
import { Transaction } from "@repo/ui/Transaction"
import { Filter } from '@repo/ui/Filter'
import { useRedirectToLogin } from "../../../../hooks/useRedirect"

interface LayoutProps {
    children: React.ReactNode
    params: { locale: string }
}

const layout = async ({ children, params: { locale } }: LayoutProps) => {
    await useRedirectToLogin(locale, "/login")

    return (
        <Transaction>
            <div className='bg-white mt-8 p-6 rounded-lg shadow-lg'>
                <Filter />
                {children}
            </div>
        </Transaction>
    )
}

export default layout