import { getServerSession } from "next-auth"
import { authOptions } from "@repo/network"
import { WITHDRAW_LIMIT } from "@repo/ui/constants"
import React from 'react'
import { useRedirectToLogin } from "../../../../hooks/useRedirect"
import { SUPPORTED_CURRENCY_ENUM } from "@repo/ui/types"

export default async function TransactionLimitTable({ params: { locale } }: { params: { locale: string } }) {
    await useRedirectToLogin(locale, "/login")
    const session = await getServerSession(authOptions)
    console.log("session --->", session);
    const userCurrency = session?.user?.wallet_currency
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr>
                            <th colSpan={7} className="py-3 px-4 text-lg font-semibold text-center border-b">
                                Transaction Limit
                            </th>
                        </tr>
                        <tr>
                            <th rowSpan={2} className="py-3 px-4 text-left border-b border-r">
                                Transaction Type
                            </th>
                            <th colSpan={2} className="py-3 px-4 text-center border-b border-r">
                                Maximum Count of Transactions
                            </th>
                            <th colSpan={2} className="py-3 px-4 text-center border-b border-r">
                                Per Transaction Limit
                            </th>
                            <th colSpan={2} className="py-3 px-4 text-center border-b">
                                Total Transaction Limit
                            </th>
                        </tr>
                        <tr>
                            <th className="py-2 px-4 text-center border-b border-r">Per Day ({userCurrency})</th>
                            <th className="py-2 px-4 text-center border-b border-r">Per Month ({userCurrency})</th>
                            <th className="py-2 px-4 text-center border-b border-r">Minimum ({userCurrency})</th>
                            <th className="py-2 px-4 text-center border-b border-r">Maximum ({userCurrency})</th>
                            <th className="py-2 px-4 text-center border-b border-r">Per Day ({userCurrency})</th>
                            <th className="py-2 px-4 text-center border-b">Per Month ({userCurrency})</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className={'bg-gray-50'}>
                            <td className="py-2 px-4 border-b border-r">Add money from Bank</td>
                            <td className="py-2 px-4 text-center border-b border-r">{WITHDRAW_LIMIT.dayLimit}</td>
                            <td className="py-2 px-4 text-center border-b border-r">{WITHDRAW_LIMIT.monthLimit}</td>
                            <td className="py-2 px-4 text-center border-b border-r">{WITHDRAW_LIMIT[userCurrency as keyof typeof SUPPORTED_CURRENCY_ENUM].perTransactionLimit.min}</td>
                            <td className="py-2 px-4 text-center border-b border-r">{WITHDRAW_LIMIT[userCurrency as keyof typeof SUPPORTED_CURRENCY_ENUM].perTransactionLimit.max}</td>
                            <td className="py-2 px-4 text-center border-b border-r">{WITHDRAW_LIMIT[userCurrency as keyof typeof SUPPORTED_CURRENCY_ENUM].totalTransactionLimit.day}</td>
                            <td className="py-2 px-4 text-center border-b">{WITHDRAW_LIMIT[userCurrency as keyof typeof SUPPORTED_CURRENCY_ENUM].totalTransactionLimit.month}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}