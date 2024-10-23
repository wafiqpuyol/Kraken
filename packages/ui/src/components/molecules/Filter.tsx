"use client"

import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'
import { cn, formatDay } from "../../lib/utils"
import { ChevronDown, Calendar } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useToast } from './Toaster/use-toast';
import { FaFilter } from "react-icons/fa";
import { GrClear } from "react-icons/gr";
import { useTranslations } from "next-intl"

export const Filter = () => {
    const t = useTranslations("Filter")
    const router = useRouter();
    const pathname1 = usePathname();
    const searchParams = useSearchParams();
    const fromDateRef = useRef(null)
    const [dateRange, setDateRange] = useState(searchParams.get("dateRange") ? `Last ${searchParams.get("dateRange")} days` : "Last 7 days")
    const [trxnCategory, setTrxnCategory] = useState(searchParams.get("category") ? searchParams.get("category") as string : "All")
    const [dateInput, setDateInput] = useState({ from: searchParams.get("from") || "", to: searchParams.get("to") || "" })
    const [filterType, setFilterType] = useState(searchParams.get("filterType") || 'All')
    const { toast } = useToast()
    const toDateRef = useRef(null)
    const newSearchParams = new URLSearchParams(searchParams);
    const pathname2 = window.location.pathname


    useEffect(() => {
        if (fromDateRef.current) {
            const today = [new Date(Date.now()).getFullYear(), new Date(Date.now()).getMonth() + 1,
            formatDay()
            ].join("-")
            document.getElementById("date-input-1")?.setAttribute("max", today);
        }
        if (toDateRef.current) {
            const today = [new Date(Date.now()).getFullYear(), new Date(Date.now()).getMonth() + 1,
            formatDay()
            ].join("-")
            document.getElementById("date-input-2")?.setAttribute("max", today);
        }
    }, [fromDateRef.current, toDateRef.current])
    console.log(pathname1);

    useEffect(() => {
        return () => {
            if (pathname1 !== pathname2) {
                setDateInput({ from: "", to: "" })
                setTrxnCategory("All")
                setFilterType("All")
                setDateRange("Last 7 days")
            }
        }
    }, [pathname1])

    const handleSearchBtnClick = useCallback(
        (): void => {
            newSearchParams.set("from", dateInput.from);
            newSearchParams.set("to", dateInput.to);
            if (new Date(dateInput.from).getTime() > new Date(dateInput.to).getTime()) {
                toast({
                    title: "Error",
                    description: "Start date cannot be greater than end date",
                    variant: "destructive",
                    className: "bg-red-500 text-white font-medium"
                })
                return;
            }
            newSearchParams.delete("dateRange")
            return router.push(`${pathname1}?${newSearchParams.toString()}`)
        }, [searchParams, pathname1, dateInput, dateRange])

    const handleDateRangeSelect = (e: any) => {
        setDateRange(e.target.value)
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("dateRange", parseInt(e.target.value.replace(/^[^0-9]+/, ''), 10).toString());
        return router.push(`${pathname1}?${newSearchParams.toString()}`)
    }

    const handleTrxnCategorySelect = (e: any) => {
        console.log(e.target.value);
        setTrxnCategory(e.target.value)
        newSearchParams.set("category", e.target.value);
        return router.push(`${pathname1}?${newSearchParams.toString()}`)
    }

    const handleFilterBtn = (filter: string) => {
        setFilterType(filter)
        newSearchParams.set("filterType", filter);
        return router.push(`${pathname1}?${newSearchParams.toString()}`)
    }

    const handleClearBtn = () => {
        router.replace(pathname1, undefined)
        setDateInput({ from: "", to: "" })
        setTrxnCategory("All")
        setFilterType("All")
        setDateRange("Last 7 days")
    }

    return (
        <div className="flex flex-col flex-wrap justify-start mb-6 font-medium">
            <h2 className="text-2xl font-bold mb-6">{pathname1.includes("withdraw-history") ? t("withdrawals") : t("p2p_transactions")}</h2>
            <div className='flex flex-wrap items-center gap-4 mb-6'>
                {
                    pathname1.includes("p2p-history") &&
                    <div id="transfer_type" className="relative">
                        <select
                            className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={trxnCategory}
                            onChange={(e) => handleTrxnCategorySelect(e)}
                        >
                            <option>{t("all")}</option>
                            <option>{t("domestic")}</option>
                            <option>{t("international")}</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>
                }
                <div id="dateRange" className="relative">
                    <select
                        disabled={dateInput.from.length !== 0 || dateInput.to.length !== 0}
                        className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={dateRange}
                        onChange={(e) => handleDateRangeSelect(e)}
                    >
                        <option>{t("Last_7-days")}</option>
                        <option>{t("Last_30_days")}</option>
                        <option>{t("last_90_days")}</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 px-2 item-centre">
                    <div className="flex items-center w-full sm:w-1/2 gap-2">
                        <label htmlFor="from-date" className="block font-medium text-gray-700 mb-1">{t("from")}</label>
                        <div className="relative">
                            <input
                                value={dateInput.from}
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
                        <label htmlFor="to-date" className="block font-medium text-gray-700 mb-1">{t("to")}</label>
                        <div className="relative">
                            <input
                                value={dateInput.to}
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
                    className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'All' ?
                        'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}
                    onClick={() => handleFilterBtn("All")}
                >
                    {t("all")}
                </button>

                <button
                    className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'Success' ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}
                    onClick={() => handleFilterBtn("Success")}
                >
                    {t("success")}
                </button>

                <button
                    className={`px-4 py-2 rounded-md text-sm font-medium ${filterType === 'Failed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}
                    onClick={() => handleFilterBtn("Failed")}
                >
                    {t("failed")}
                </button>
                <div>
                    <button disabled={dateInput.from === '' || dateInput.to === ''} type="button"
                        onClick={() => handleSearchBtnClick()}
                        className={cn(`self-start inline-flex items-center py-2.5 px-3 ms-2 text-sm font-medium text-white bg-purple-600
                  rounded-lg border border-purple-700 dark:bg-purple-600 ,
                ${(dateInput.from === '' || dateInput.to === '') ? "cursor-not-allowed dark:opacity-70" : "cursor-pointer hover:bg-purple-800 dark:hover:bg-purple-700"}
                  `)}>
                        <FaFilter className='mr-1' />
                        {t("search")}
                    </button>

                    <button type="button"
                        onClick={() => handleClearBtn()}
                        className='self-start inline-flex items-center py-2.5 px-3 ms-2 text-sm font-medium text-white bg-purple-600
             rounded-lg border border-purple-700 '
                    >
                        <GrClear className='mr-1 text-[16px]' />
                        {t("clear")}
                    </button>
                </div>
            </div>
        </div>
    )
}