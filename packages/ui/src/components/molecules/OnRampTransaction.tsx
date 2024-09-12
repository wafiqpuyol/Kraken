"use client"

import { Button } from '../atoms/Button'
import { useRouter } from 'next/navigation'

export const OnRampTransaction = () => {
    const router = useRouter()
    return (
        <div className="flex bg-white rounded-lg h-32">
            <div className="bg-card p-4 rounded-lg shadow-md w-[720px]">
                <h2 className="text-xl font-semibold text-foreground mb-7">Recent Transaction</h2>
                <Button className="text-white bg-black  hover:bg-black/80" onClick={() => router.push("/dashboard/transactions")}>View Transaction</Button>
            </div>
        </div>
    )
}
