import React from 'react'
import { prisma } from "@repo/db/client"
import { p2ptransfer } from "@repo/db/type"
import { getServerSession, Session } from "next-auth"
import { authOptions } from "@repo/network"
import { useRedirectToLogin } from "../../../../../hooks/useRedirect"
import { CHARGE } from "@repo/ui/constants"
import { ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@repo/ui/cn'
import { SUPPORTED_CURRENCY_ENUM } from '@repo/ui/types'
import { calculateAmountOnDemand } from "@repo/ui/utils"
import { PaginationDemo } from "@repo/ui/Paginate"
import { getTranslations } from 'next-intl/server';

interface PageProps {
    searchParams: { [key: string]: string | undefined }
    params: { locale: string }
}
async function page({ searchParams, params: { locale } }: PageProps) {
    const t = await getTranslations("page")
    await useRedirectToLogin(locale, "/login")
    const currentPage = parseInt((searchParams.page) || '1');
    const filterType = searchParams.filterType || 'All';
    const from = searchParams.from;
    const to = searchParams.to;
    const dateRange = searchParams.dateRange;
    const trxn_category = searchParams.category || 'All';
    const defaultDateRange = 7;
    const session = await getServerSession(authOptions) as Session
    let skip = (currentPage - 1) * 10

    const totalTransfer = await prisma.p2ptransfer.count({
        where: {
            AND: [
                {
                    OR: [
                        { fromUserId: session?.user?.uid },
                        { toUserId: session?.user?.uid },
                    ]
                },
                {
                    timestamp: {
                        gte: from ? new Date(from).toISOString() : new Date(new Date().setDate(new Date().getDate() - (dateRange ? parseInt(dateRange) : defaultDateRange))).toISOString(),
                        lte: to ? new Date(to).toISOString() : new Date(Date.now()).toISOString()
                    }
                },
                trxn_category === "All" ? { OR: [{ transactionCategory: "Domestic" }, { transactionCategory: "International" }] } : trxn_category === "International" ? { transactionCategory: "International" } : { transactionCategory: "Domestic" },
                filterType === "All" ? { OR: [{ status: "Failed" }, { status: "Success" }] } : filterType === "Success" ? { status: "Success" } : { status: "Failed" }
            ]
        }
    })

    if ((Math.ceil(totalTransfer / 10) < currentPage) || (typeof from === "string" && typeof to === "string") && (from === to)) {
        skip = 0
    }

    const getP2PTransfers: p2ptransfer[] = await prisma.p2ptransfer.findMany({
        where: {
            AND: [
                {
                    OR: [
                        { fromUserId: session?.user?.uid },
                        { toUserId: session?.user?.uid },
                    ]
                },
                {
                    timestamp: {
                        gte: from ? new Date(from).toISOString() : new Date(new Date().setDate(new Date().getDate() - (dateRange ? parseInt(dateRange) : defaultDateRange))).toISOString(),
                        lte: to ? new Date(to).toISOString() : new Date(Date.now()).toISOString()
                    }
                },
                trxn_category === "All" ? { OR: [{ transactionCategory: "Domestic" }, { transactionCategory: "International" }] } : trxn_category === "International" ? { transactionCategory: "International" } : { transactionCategory: "Domestic" },
                filterType === "All" ? { OR: [{ status: "Failed" }, { status: "Success" }] } : filterType === "Success" ? { status: "Success" } : { status: "Failed" }
            ]
        },
        take: 10,
        skip,
        orderBy: { timestamp: 'desc' }
    });

    return (
        <div className="px-6 rounded-lg font-medium">
            <div>
                <table className="min-w-full">
                    <thead>
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider border-b-[0.7px] text-purple-600">
                            <th className="px-4 py-2 ">{t("trxn_id")}</th>
                            <th className="px-4 py-2 ">{t("time")}</th>
                            <th className="px-4 py-2">{t("type")}</th>
                            <th className="px-4 py-4">{t("category")}</th>
                            <th className="px-4 py-2">{t("amount")}</th>
                            <th className="px-4 py-4">{t("fee")}</th>
                            <th className="px-4 py-4">{t("contact_number")}</th>
                            <th className="px-4 py-4">{t("account_name")}</th>
                            <th className="px-4 py-2">{t("status")}</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {
                            getP2PTransfers.map((obj, index) => {
                                return (
                                    obj ?
                                        (
                                            obj.transactionType === "Send" && obj.status === "Failed" &&
                                            session?.user?.uid === obj.fromUserId &&
                                            <TableRow obj={obj} index={index} session={session} />

                                        )
                                        ||
                                        (
                                            obj.transactionType === "Send" && obj.status === "Success" &&
                                            <TableRow obj={obj} index={index} session={session} />
                                        )
                                        :
                                        index === (getP2PTransfers.length - 1) && <div className='px-4 py-3'>No withdrawals found</div>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
            {
                totalTransfer === 0
                    ?
                    <div className='px-4 py-3 text-center my-8'>{t("footer1")}</div>
                    :
                    <PaginationDemo totalCount={totalTransfer} page={currentPage} />
            }
        </div>
    )
}


const TableRow = async ({ obj, index, session }: { obj: p2ptransfer, index: number, session: Session | null }) => {
    const t = await getTranslations("page")
    const feeCurrencyLogo = CHARGE[obj?.fee_currency as keyof typeof SUPPORTED_CURRENCY_ENUM]?.symbol
    const amountCurrencyLogo = CHARGE[obj.currency as keyof typeof SUPPORTED_CURRENCY_ENUM]?.symbol
    const exchangedCurrencyLogo = CHARGE[obj.fee_currency as keyof typeof SUPPORTED_CURRENCY_ENUM]?.symbol
    const time = new Date(obj.timestamp).toLocaleString().split(",")
    return (
        <tr key={index} className="border-b overflow-y-scroll">
            <td className="px-4 py-3">{obj.transactionID}</td>
            <td className="px-4 py-3">{time[0]} <br /> {time[1]}</td>
            <td className="px-4 py-3">
                <div className="flex items-center">
                    {session?.user?.uid === obj.fromUserId ? <ArrowUp className="w-4 h-4 mr-2 text-red-500" />
                        :
                        <ArrowDown className="w-4 h-4 mr-2 text-green-500" />}
                    {session?.user?.uid === obj.fromUserId ? t("sent") : t("Received")}
                </div>
            </td>
            <td className="px-4 py-3">{t(`${obj.transactionCategory}`)}
            </td>
            <td className="px-4 py-3">
                <div className={cn("font-bold", obj.fromUserId === session?.user?.uid ? "text-red-500" : "text-green-500")}>
                    <i>
                        {obj.status === 'Failed' && " " || (obj.fromUserId === session?.user?.uid ? "-" : "+")}
                    </i>
                    <i className={cn(obj.status === "Failed" ? 'ml-2' : '')}>{obj.amount / 100}</i>
                    <i className='font-extrabold'>{amountCurrencyLogo}</i>
                </div>
                {
                    obj.transactionCategory === 'International'
                    &&
                    <div className="text-[11px] text-slate-400 font-medium">
                        <i>
                            {obj.status === 'Failed' && " " || (obj.fromUserId === session?.user?.uid ? "-" : "+")}
                        </i>
                        <i className={cn(obj.status === "Failed" ? 'ml-2' : '')}>
                            {calculateAmountOnDemand(undefined, undefined, session?.user?.preference?.selected_currency, session?.user?.wallet_currency, parseFloat(obj.amount) / 100)}
                        </i>
                        <i className='font-extrabold'>{exchangedCurrencyLogo}</i>
                    </div>
                }
            </td>
            <td className="px-4 py-3">
                <div className='flex items-center gap-x-[2px'>
                    <div className='flex-start'>
                        <span>
                            {obj.status === 'Failed' ? " " : "+"}
                        </span>
                        <i className={cn(obj.status === "Failed" ? 'ml-2' : '')}>
                            {obj.transactionCategory === "International" ? obj.international_trxn_fee : obj.domestic_trxn_fee}
                        </i>
                    </div>
                    <i>{feeCurrencyLogo}</i>
                </div>
            </td>
            <td className="px-4 py-3">{(session?.user?.number === obj.sender_number) ?
                obj.receiver_number : obj.sender_number}
            </td>
            <td className="px-4 py-3">{(session?.user?.number === obj.sender_number) ?
                obj.receiver_name : obj.sender_name}
            </td>
            <td className="px-4 py-3 font-bold text-white">
                <span className={`px-2 py-1 rounded-full text-xs ${obj.status === 'Success' ? 'bg-green-600' :
                    'bg-red-600 '
                    }`}>
                    {t(`${obj.status}`)}
                </span>
            </td>
        </tr>
    )
}

export default page