import React from 'react'
import { Transaction } from "@repo/ui/Transaction"

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Transaction>{children}</Transaction>
    )
}

export default layout