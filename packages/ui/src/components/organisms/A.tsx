"use client"
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ArrowUp, ArrowDown, Calendar } from 'lucide-react'
import { BANK, CURRENCY_LOGO } from "../../lib/constant"
import { useSession } from "next-auth/react"
import { cn } from "../../lib/utils"
import { getOnRampTransactionByDateRange, getOnRampTransactionByDuration } from "./action"
import { useToast } from "../molecules/Toaster/use-toast"
import { $Enums, } from "@repo/db/type"
import { Loader } from "../atoms/Loader"
import { PaginationDemo } from "../molecules/Paginate"

// var a: Activity[] = [
//     {
//         "time": "2024-10-07T09:43:34.688Z",
//         "amount": 72900,
//         "status": "Success",
//         "provider": "https://www.ificbank.com.bd/",
//         "lockedAmount": 35000
//     },
//     {
//         "time": "2024-10-07T09:32:35.691Z",
//         "amount": 156300,
//         "status": "Success",
//         "provider": "https://www.ificbank.com.bd/",
//         "lockedAmount": 0
//     },
//     {
//         "time": "2024-10-07T09:30:28.483Z",
//         "amount": 96000,
//         "status": "Success",
//         "provider": "https://www.ificbank.com.bd/",
//         "lockedAmount": 0
//     },
//     {
//         "time": "2024-10-06T03:43:22.000Z",
//         "amount": 26900,
//         "status": "Failed",
//         "provider": "https://www.ificbank.com.bd/",
//         "lockedAmount": 0
//     }
// ]



type onRampsType = {
    time: Date;
    amount: number;
    status: $Enums.onramptransaction_status;
    provider: string;
    lockedAmount: number;
}[]

export function TransactionTable({ onRamps }: {
    onRamps: onRampsType
}) {
    const [dateRange, setDateRange] = useState('Last 7 days')
    const [isLoading, setIsLoading] = useState(false);
    const [filterType, setFilterType] = useState('All')
    const [withdrawals, setWithdrawals] = useState<onRampsType>(onRamps)
    const received = (withdrawals.filter((item) => item.status === 'Success')).length
    const failed = (withdrawals.filter((item) => item.status === 'Failure')).length
    const session = useSession()
    let CurrencyLogo: ({ width, height }: { height?: string; width?: string; }) => JSX.Element;
    const fromDateRef = useRef(null)
    const toDateRef = useRef(null)
    const [dateInput, setDateInput] = useState({ from: "", to: "" })
    const { toast } = useToast()
    if (session.status === "authenticated" && session.data) {
        CurrencyLogo = CURRENCY_LOGO[session.data?.user.wallet_currency as string]?.Logo
    }

    console.log(filterType);

    useEffect(() => {
        if (fromDateRef.current) {
            const today = [new Date(Date.now()).getFullYear(), new Date(Date.now()).getMonth() + 1,
            formatDay()
            ].join("-")
            console.log(today);
            document.getElementById("date-input-1")?.setAttribute("max", today);
        }
        if (toDateRef.current) {
            const today = [new Date(Date.now()).getFullYear(), new Date(Date.now()).getMonth() + 1,
            formatDay()
            ].join("-")
            console.log(today);
            document.getElementById("date-input-2")?.setAttribute("max", today);
        }
    }, [fromDateRef.current, toDateRef.current])

    useEffect(() => {
        console.log(dateRange);
        if (session.status === "loading") {
            setIsLoading(true)
            return;
        }
        async function func() {
            try {
                setIsLoading(true)
                const res = await getOnRampTransactionByDuration(parseInt(dateRange.replace(/^[^0-9]+/, ''), 10), session.data?.user.uid)
                switch (res.status) {
                    case 200:
                        setWithdrawals(res.data)
                        break
                    case 401:
                        toast({
                            title: res.message,
                            variant: "destructive"
                        })
                        break
                    case 500:
                        toast({
                            title: res.message,
                            variant: "destructive"
                        })
                        break
                }
                setIsLoading(false)
            } catch (error: any) {
                toast({
                    title: error.message,
                    variant: "destructive"
                })
                setIsLoading(false)
                console.log("getOnRampTransactionByDuration ---->", error.message);
            }
        }
        func()
    }, [dateRange, session.data?.user])

    const formatDay = () => {
        const date = new Date(Date.now()).getDate().toString()
        if (date.toString().length === 1) {
            return 0 + date
        }
        return date
    }



    const handleClick = async () => {
        if (session.status === "loading") {
            setIsLoading(true)
            return;
        }
        if (session.status === "unauthenticated") {
            toast({
                title: "You are not logged in. Please login first",
                variant: "destructive"
            })
            return;
        }
        try {
            const res = await getOnRampTransactionByDateRange({ ...dateInput, userId: session.data?.user.uid })
            switch (res.status) {
                case 200:
                    setWithdrawals(res.data)
                    break
                case 401:
                    toast({
                        title: res.message,
                        variant: "destructive"
                    })
                    break
                case 500:
                    toast({
                        title: res.message,
                        variant: "destructive"
                    })
                    break
            }
            console.log(res);
        } catch (error: any) {
            toast({
                title: error.message,
                variant: "destructive"
            })
            console.log("getOnRampTransaction ---->", error);
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm font-medium">
            {/* <h2 className="text-2xl font-bold mb-6">Activities</h2> */}

            <div className="flex justify-between flex-wrap items-center mb-6">
                <div className='flex flex-wrap items-center gap-4 mb-6'>
                    <div className="relative">
                        <select
                            className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                            <option>Last 90 days</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 px-2 item-centre">
                        <div className="flex items-center w-full sm:w-1/2 gap-2">
                            <label htmlFor="from-date" className="block font-medium text-gray-700 mb-1">From</label>
                            <div className="relative">
                                <input
                                    ref={fromDateRef}
                                    max=""
                                    id='date-input-1'
                                    type="date"
                                    name="date"
                                    className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-10 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ease-in-out w-full cursor-pointer"
                                    placeholder="Select start date"
                                    onChange={(e) => {
                                        setDateInput((prev) => ({ ...prev, from: (e.target.value) }));
                                    }}
                                />
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="flex items-center w-full sm:w-1/2 gap-2">
                            <label htmlFor="to-date" className="block font-medium text-gray-700 mb-1">To</label>
                            <div className="relative">
                                <input
                                    ref={toDateRef}
                                    max=""
                                    id='date-input-2'
                                    type="date"
                                    name="date"
                                    className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-10 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ease-in-out w-full cursor-pointer"
                                    placeholder="Select start date"
                                    onChange={(e) => {
                                        setDateInput((prev) => ({ ...prev, to: e.target.value }));
                                    }}
                                />
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <style jsx>{`
                            input[type="date"]::-webkit-calendar-picker-indicator {
                            background: transparent;
                            bottom: 0;
                            color: transparent;
                            cursor: pointer;
                            height: auto;
                            left: 0;
                            position: absolute;
                            right: 0;
                            top: 0;
                            width: auto;
                            }
                        `}</style>
                    </div>

                    <button
                        className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'All' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}
                        onClick={() => setFilterType("All")}
                    >
                        All {received + failed}
                    </button>

                    <button
                        className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'Received ' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}
                        onClick={() => setFilterType("Received")}
                    >
                        Received {received}
                    </button>

                    <button
                        className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'Failed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}
                        onClick={() => setFilterType('Failed')}
                    >
                        Failed {failed}
                    </button>
                </div>

                <button disabled={dateInput.from === '' || dateInput.to === ''} onClick={() => handleClick()} type="button"
                    className={cn(`self-start inline-flex items-center py-2.5 px-3 ms-2 text-sm font-medium text-white bg-purple-600
                  rounded-lg border border-purple-700   dark:bg-purple-600 ,
                ${(dateInput.from === '' || dateInput.to === '') ? "cursor-not-allowed" : "cursor-pointer hover:bg-purple-800 dark:hover:bg-purple-700"}
                  `)}>
                    <svg className="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                    </svg>Search
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <th className="px-4 py-2 ">Time</th>
                            <th className="px-4 py-2">Type</th>
                            <th className="px-4 py-2">Amount</th>
                            <th className="px-4 py-2">Provider</th>
                            <th className="px-4 py-2">Status</th>
                        </tr>
                    </thead>
                    {
                        !isLoading &&
                        <tbody className="text-sm">
                            {
                                withdrawals.map((obj, index) => {
                                    let activity: typeof withdrawals[0] | null = null;
                                    if (filterType === 'All') {
                                        activity = obj
                                    }
                                    if (filterType === 'Received' && obj.status === 'Success') {
                                        activity = obj;
                                    }
                                    if (filterType === 'Failed' && obj.status === 'Failure') {
                                        activity = obj
                                    }
                                    console.log(activity, "----", activity?.status);
                                    return (
                                        activity ?
                                            <tr key={index} className="border-b">
                                                <td className="px-4 py-3">{new Date(activity.time).toLocaleString()}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center">
                                                        {activity.status === 'Failure' && <ArrowUp className="w-4 h-4 mr-2 text-red-500" />}
                                                        {activity.status === 'Success' && <ArrowDown className="w-4 h-4 mr-2 text-green-500" />}
                                                        {activity.status === 'Success' ? 'Received' : 'Fail'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className='flex items-center gap-2'>
                                                        <div className='flex-start'>
                                                            <span>
                                                                {activity.status === 'Failure' ? " " : "+"}
                                                            </span>
                                                            <span className={cn(activity.status === 'Failure' ? 'ml-2' : '')}>{activity.amount / 100}</span>
                                                        </div>
                                                        {CurrencyLogo && <CurrencyLogo width={"20"} height={"20"} />}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div>{BANK.find(b => b.url === activity.provider)?.name}</div>
                                                </td>
                                                <td className="px-4 py-3 font-bold text-white">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${activity.status === 'Success' ? 'bg-green-600' :
                                                        'bg-red-600 '
                                                        }`}>
                                                        {activity.status}
                                                    </span>
                                                </td>
                                            </tr>
                                            :
                                            index === (withdrawals.length - 1) && <div className='px-4 py-3'>No withdrawals found</div>
                                    )
                                })
                            }
                        </tbody>
                    }
                </table>
            </div>

            <>
                {isLoading && <div className='w-full mt-14 mb-5 text-2xl flex justify-center'><Loader /></div>}
                {withdrawals.length === 0 && <div className='w-full mt-14 mb-5 text-2xl flex justify-center'>No withdrawals found</div>}
                <PaginationDemo />
            </>
        </div >
    )
}