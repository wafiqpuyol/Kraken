import React from 'react'
import { prisma } from "@repo/db/client"
import { onramptransaction } from "@repo/db/type"
import { getServerSession, Session } from "next-auth"
import { authOptions } from "@repo/network"
import { useRedirectToLogin } from "../../../../../hooks/useRedirect"
import { BANK } from "@repo/ui/constants"
import { ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@repo/ui/cn'
import { CHARGE } from "@repo/ui/constants"
import { SUPPORTED_CURRENCY_ENUM } from '@repo/ui/types'
import { PaginationDemo } from "@repo/ui/Paginate"
import { getTranslations } from 'next-intl/server';



interface PageProps {
    searchParams: { [key: string]: string | undefined }
    params: { locale: string }
}
async function page({ searchParams, params: { locale } }: PageProps) {
    await useRedirectToLogin(locale, "/login")
    const t = await getTranslations("page")
    console.log("server PARAM ==>", searchParams);
    const currentPage = parseInt((searchParams.page) || '1');
    const session = await getServerSession(authOptions) as Session
    const filterType = searchParams.filterType || 'All';
    const from = searchParams.from;
    const to = searchParams.to;
    const dateRange = searchParams.dateRange;
    const defaultDateRange = 7;
    let skip = (currentPage - 1) * 10;

    const totalOnRamp = await prisma.onramptransaction.count({
        where: {
            AND: [
                { userId: session?.user?.uid },
                {
                    startTime: {
                        gte: from ? new Date(from) : new Date(new Date().setDate(new Date().getDate() - (dateRange ? parseInt(dateRange) : defaultDateRange))).toISOString(),
                        lte: to ? new Date(to) : new Date(Date.now()).toISOString()
                    }
                },
                filterType === "All" ? { OR: [{ status: "Failed" }, { status: "Success" }] } : filterType === "Success" ? { status: "Success" } : { status: "Failed" }
            ]
        },
    })

    if ((Math.ceil(totalOnRamp / 10) < currentPage) || (typeof from === "string" && typeof to === "string") && (from === to)) {
        skip = 0
    }

    const getOnRampTransactions: onramptransaction[] = await prisma.onramptransaction.findMany({
        where: {
            AND: [
                { userId: session?.user?.uid },
                {
                    startTime: {
                        gte: from ? new Date(from) : new Date(new Date().setDate(new Date().getDate() - (dateRange ? parseInt(dateRange) : defaultDateRange))).toISOString(),
                        lte: to ? new Date(to) : new Date(Date.now()).toISOString()
                    }
                },
                filterType === "All" ? { OR: [{ status: "Failed" }, { status: "Success" }] } : filterType === "Success" ? { status: "Success" } : { status: "Failed" }
            ]
        },
        take: 10,
        skip,
        orderBy: { startTime: 'desc' }
    });
    return (

        <div className="px-6 rounded-lg font-medium">
            <div>
                <table className="min-w-full">
                    <thead>
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider border-b-[0.7px] text-purple-600">
                            <th className="px-4 py-2 ">{t("time")}</th>
                            <th className="px-4 py-2">{t("type")}</th>
                            <th className="px-4 py-2">{t("amount")}</th>
                            <th className="px-4 py-2">{t("lock")}</th>
                            <th className="px-4 py-2">{t("provider")}</th>
                            <th className="px-4 py-2">{t("status")}</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {
                            getOnRampTransactions.map((activity, index) => {
                                const amountCurrencyLogo = CHARGE[session?.user?.wallet_currency as keyof typeof SUPPORTED_CURRENCY_ENUM]?.symbol;
                                return (
                                    activity ?
                                        <tr key={index} className="border-b">
                                            <td className="pl-4  py-3">{new Date(activity.startTime).toLocaleString()}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center">
                                                    {activity.status === 'Failed' && <ArrowUp className="w-4 h-4 mr-2 text-red-500" />}
                                                    {activity.status === 'Success' && <ArrowDown className="w-4 h-4 mr-2 text-green-500" />}
                                                    {activity.status === 'Success' ? t('Received') : t('Failed')}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className={cn("flex items-center gap-x-[2px]", activity.status === "Failed" ? 'ml-2 text-red-500' : 'text-green-500')}>
                                                    <div className='flex-start'>
                                                        <i>
                                                            {activity.status === 'Failed' ? " " : "+"}
                                                        </i>
                                                        <i >{activity.amount / 100}</i>
                                                    </div>
                                                    <i className='font-extrabold'>{amountCurrencyLogo}</i>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-x-[2px]">
                                                    <div className='flex-start'>
                                                        <i >{activity.lockedAmount / 100}</i>
                                                    </div>
                                                    <i className='font-extrabold'>{amountCurrencyLogo}</i>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>{BANK.find(b => b.url === activity.provider)?.name}</div>
                                            </td>
                                            <td className="px-4 py-3 font-bold text-white">
                                                <span className={`px-2 py-1 rounded-full text-xs ${activity.status === 'Success' ? 'bg-green-600' :
                                                    'bg-red-600 '
                                                    }`}>
                                                    {t(`${activity.status}`)}
                                                </span>
                                            </td>
                                        </tr>
                                        :
                                        index === (getOnRampTransactions.length - 1) && <div className='px-4 py-3'>No withdrawals found</div>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
            {totalOnRamp === 0
                ?
                <div className='px-4 py-3 text-center my-8'>{t("footer2")}</div>
                :
                <PaginationDemo totalCount={totalOnRamp} page={currentPage} />}
        </div>
    )
}

export default page