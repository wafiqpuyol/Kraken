"use client"

import { useState } from 'react'
import { WITHDRAW_LIMIT } from "../../lib/constant"
import { useSession } from "next-auth/react"
import { Loader } from "../atoms/Loader"


interface WithdrawLimitsProps {
    onRampTransactionLimitDetail: any
}

export const WithDrawLimits: React.FC<WithdrawLimitsProps> = ({ onRampTransactionLimitDetail }) => {
    const session = useSession({ required: true })
    const [view, setView] = useState<'daily' | 'monthly'>('daily')
    const [currentWithdrawal, setCurrentWithdrawal] = useState({
        daily: onRampTransactionLimitDetail.perDayTotal / 100,
        monthly: onRampTransactionLimitDetail.perMonthTotal / 100,
    })
    const currency = session.data?.user?.wallet_currency

    const formatCurrency = (amount: number | string) => {
        return `${WITHDRAW_LIMIT[currency]?.symbol}${Number(amount)}`
    }

    const calculateProgress = (withdrawal: number, limit: string) => {
        return Math.min((withdrawal / Number(limit)) * 100, 100)
    }

    const limit = view === 'daily' ? WITHDRAW_LIMIT[currency]?.totalTransactionLimit.day : WITHDRAW_LIMIT[currency]?.totalTransactionLimit.month
    const withdrawal = view === 'daily' ? currentWithdrawal.daily : currentWithdrawal.monthly

    return (
        <div className="bg-white rounded-lg p-6 max-w-full shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Withdraw limits</h2>
                <div className="flex bg-gray-100 rounded-full p-1">
                    <button
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${view === 'daily' ? 'bg-white shadow-sm' : 'text-gray-500'
                            }`}
                        onClick={() => setView('daily')}
                    >
                        Daily
                    </button>
                    <button
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${view === 'monthly' ? 'bg-white shadow-sm' : 'text-gray-500'
                            }`}
                        onClick={() => setView('monthly')}
                    >
                        Monthly
                    </button>
                </div>
            </div>
            <div className="space-y-4">
                {
                    session.status === "loading" || !session.data
                        ?
                        <Loader />
                        :
                        <>
                            <div className="mb-8">
                                <div className="bg-gray-100 rounded-lg p-4">
                                    <span className="text-sm text-gray-600">Per transaction limit:</span>
                                    <span className="block text-lg font-medium mt-1">
                                        {formatCurrency(WITHDRAW_LIMIT[currency]?.perTransactionLimit.min)} - {formatCurrency(WITHDRAW_LIMIT[currency]?.perTransactionLimit.max)} {WITHDRAW_LIMIT[currency]?.name}
                                    </span>
                                </div>
                            </div>
                            <div className="py-2">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600 font-medium">{view === 'daily' ? 'Daily' : 'Monthly'} withdraw limit</span>
                                    <span className="font-medium">
                                        {formatCurrency(withdrawal)} of {formatCurrency(limit)} {WITHDRAW_LIMIT[currency]?.name}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-purple-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                                        style={{ width: `${calculateProgress(withdrawal, limit)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600 font-medium">{view === 'daily' ? 'Daily' : 'Monthly'} withdrawal limit</span>
                                    <span className="font-medium">{formatCurrency(limit)} {WITHDRAW_LIMIT[currency]?.name}</span>
                                </div>
                            </div>
                        </>
                }
            </div>
        </div>
    )
}