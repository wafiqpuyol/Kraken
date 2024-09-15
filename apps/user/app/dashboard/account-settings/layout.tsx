import React from 'react'
import { AccountSettings } from "@repo/ui/AccountSettings"

interface LayoutProps {
    children: React.ReactNode
}
const layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <AccountSettings>{children}</AccountSettings>
    )
}

export default layout