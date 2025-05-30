import React from 'react'
import { SendMoney } from "@repo/ui/SendMoney"
import { useRedirectToLogin } from "../../../../hooks/useRedirect"

interface LayoutProps {
    children: React.ReactNode
    params: { locale: string }
}

const layout = async ({ children, params: { locale } }: LayoutProps) => {
    await useRedirectToLogin(locale, "/login")

    return (
        <SendMoney>
            {/* <div className='bg-white mt-8 p-6 rounded-lg shadow-lg'> */}
                {children}
            {/* </div> */}
        </SendMoney>
    )
}

export default layout