"use client"

import { Deposit } from "../../icons/index"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { onramptransaction, p2ptransfer } from "@repo/db/type"
import { useSession } from "next-auth/react"
import { FaScaleUnbalancedFlip } from "react-icons/fa6";
import { TbArrowsTransferUp } from "react-icons/tb";
import { CHARGE } from "../../lib/constant"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"

import {
    Card,
    CardContent,
    CardHeader,
} from "../atoms/Card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
} from "../organisms/Charts"
import { Button } from "../atoms/Button"
import { cn } from "../../lib/utils"
import { Session } from "next-auth"
import { useState } from "react"
import { SUPPORTED_CURRENCY_ENUM } from "@/src/lib/types"

const onRampConfig = {
    Withdraw_Amount: {
        label: "WithDrawls",
    },
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-6))",
    },
} satisfies ChartConfig

const p2pConfig = {
    P2P: {
        label: "P2P Transfer",
    },
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-6))",
    },
    mobile: {
        label: "Mobile",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

const OnRampTooltip = ({ active, payload, nameKey, session, t }: { t: any, active: boolean, payload: any, nameKey: string, session: Session | null }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white shadow-2xl rounded-lg text-[12px] font-bold text-slate-700">
                <h1 className="text-[13px] p-3 pb-0 mb-1">{nameKey}</h1>
                <hr />
                <div className="p-3 pl-4 pt-0 mt-1">
                    <p className="label">{`${t("amount")} : ${payload[0].value} ${session?.user?.wallet_currency}`}</p>
                    <p className="label">{`${t("locked")} : ${payload[0].payload.lockedAmount}`}</p>
                    <p className="intro">{`${t("status")} : ${t(payload[0].payload.status)}`}</p>
                    <p className="desc">{`${t("date")} : ${new Date(payload[0].payload.date).toLocaleString()}`}</p>
                </div>
            </div>
        )
    }
    return null;
};

const P2PTooltip = ({ active, payload, nameKey, t }: { t: any, active: boolean, payload: any, nameKey: string, session: Session | null }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white shadow-2xl rounded-lg text-[12px] font-bold text-slate-700">
                <h1 className="text-[13px] p-3 pb-0 mb-2">{nameKey}</h1>
                <hr />
                {
                    payload[0].value ? <div className="p-3 pl-4 pt-0 mt-1">
                        <p className="label">{`${t("trxn_id")} : ${payload[0].payload.transactionID}`}</p>
                        <p className="label">{`${t("amount")} : ${payload[0].value} ${payload[0].payload.currency}`}</p>
                        <p className="label">{`${t("category")} : ${t(payload[0].payload.transactionCategory)}`}</p>
                        <p className="intro">{`${t("status")} : ${t(payload[0].payload.status)}`}</p>
                        <p className="intro">{`${t("receiver")} : ${payload[0].payload.receiver_name}`}</p>
                        <p className="desc">{`${t("date")} : ${new Date(payload[0].payload.date).toLocaleString()}`}</p>
                    </div>
                        : null
                }

                {payload[1].value ? <div className="pl-2 p-3 pt-0 mt-2">
                    <p className="label">{`${t("trxn_id")} : ${payload[1].payload.transactionID}`}</p>
                    <p className="label">{`${t("amount")}: ${payload[1].value} ${payload[1].payload.currency}`}</p>
                    <p className="label">{`${t("category")}: ${t(payload[1].payload.transactionCategory)}`}</p>
                    <p className="intro">{`${t("status")}: ${payload[1].payload.status}`}</p>
                    <p className="intro">{`${t("receiver")}: ${payload[1].payload.receiver_name}`}</p>
                    <p className="desc">{`${t("date")}: ${new Date(payload[1].payload.date).toLocaleString()}`}</p>
                </div> : null}
            </div>
        )
    }
    return null;
};

const PortfolioBalance = ({ totalBalance = "0", currency = "$", t }: { totalBalance: string | undefined, currency: string, t: any }) => {
    const router = useRouter()
    const locale = useLocale()
    return (<div className="bg-white shadow-md flex justify-between rounded-2xl p-9 font-medium text-slate-600 mb-7">
        <div>
            <p className="underline decoration-dashed decoration-slate-400 underline-offset-2 decoration-2 mb-1 text-[18px]">{t("wallet_balance")}</p>
            <h1 className="text-4xl"><span className="font-extrabold">{currency}</span><span className="text-black/85">{totalBalance / 100}</span></h1>
        </div>
        <div>
            <div className="flex flex-col items-center  cursor-pointer" onClick={() => router.push(`/${locale}/dashboard/transfer/withdraw`)}>
                <Deposit />
                <Button className="text-[#7F00FF] font-medium text-[18px]" >{t("deposit")}</Button>
            </div>
        </div>
    </div>)
}

const OnRamp = ({ onRamps, children, onRampConfig }: { onRamps: onramptransaction[], children: React.ReactNode, onRampConfig: ChartConfig }) => {
    return (
        <CardContent>
            <ChartContainer config={onRampConfig} className="h-[350] w-full">
                <AreaChart
                    accessibilityLayer
                    data={onRamps.map(e => {
                        return {
                            amount: e.amount / 100,
                            date: e.startTime,
                            status: e.status,
                            lockedAmount: e.lockedAmount / 100
                        }
                    })}
                    margin={{
                        left: 12,
                        right: 12,
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        className="font-bold text-[10px]"
                        tickFormatter={(value) => {
                            const date = new Date(value)
                            return date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                            })
                        }}
                    />
                    {children}
                    <defs>
                        <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                            <stop
                                offset="5%"
                                stopColor="var(--color-desktop)"
                                stopOpacity={0.8}
                            />
                            <stop
                                offset="95%"
                                stopColor="var(--color-desktop)"
                                stopOpacity={0.1}
                            />
                        </linearGradient>
                    </defs>

                    <Area
                        dataKey="amount"
                        type="natural"
                        dot={true}
                        fill="var(--color-desktop)"
                        fillOpacity={0.4}
                        stroke="var(--color-desktop)"
                    />
                </AreaChart>
            </ChartContainer>
        </CardContent>
    )
}
const P2PTransfer = ({ p2pTransfers, children, p2pConfig }: { p2pTransfers: p2ptransfer[], children: React.ReactNode, p2pConfig: ChartConfig }) => {
    return (
        <CardContent>
            <ChartContainer config={p2pConfig} className="h-[350] w-full">
                <AreaChart
                    accessibilityLayer
                    data={p2pTransfers}
                    margin={{
                        left: 12,
                        right: 12,
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickLine={true}
                        axisLine={true}
                        tickMargin={8}
                        minTickGap={32}
                        className="font-bold text-[10px]"
                        tickFormatter={(value) => {
                            const date = new Date(value)
                            return date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                            })
                        }}
                    />
                    {children}
                    <defs>
                        <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                            <stop
                                offset="5%"
                                stopColor="var(--color-desktop)"
                                stopOpacity={0.8}
                            />
                            <stop
                                offset="95%"
                                stopColor="var(--color-desktop)"
                                stopOpacity={0.1}
                            />
                        </linearGradient>
                        <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                            <stop
                                offset="5%"
                                stopColor="var(--color-mobile)"
                                stopOpacity={0.8}
                            />
                            <stop
                                offset="95%"
                                stopColor="var(--color-mobile)"
                                stopOpacity={0.1}
                            />
                        </linearGradient>
                    </defs>
                    <Area
                        dataKey="internationalAmount"
                        type="natural"
                        dot={true}
                        fill="var(--color-desktop)"
                        fillOpacity={0.4}
                        stroke="var(--color-desktop)"
                    />
                    <Area
                        dataKey="domesticAmount"
                        type="natural"
                        dot={true}
                        fill="var(--color-mobile)"
                        fillOpacity={0.4}
                        stroke="var(--color-mobile)"
                        stackId="a"
                    />
                </AreaChart>
            </ChartContainer>
        </CardContent>
    )
}


export const Portfolio = ({ onRamps, p2pTransfers }: { onRamps: onramptransaction[], p2pTransfers: any[] }) => {
    const [tab, setTab] = useState("WithDrawals")
    const t = useTranslations("Portfolio")
    const session = useSession()

    return (
        <div className="pt-10 pr-12">
            <h1 className="text-4xl text-purple-600 mb-8 font-bold">{t("title")}</h1>
            <PortfolioBalance t={t} totalBalance={session?.data?.user?.total_balance} currency={CHARGE[session?.data?.user?.wallet_currency as keyof typeof SUPPORTED_CURRENCY_ENUM]?.symbol} />
            <Card className="bg-white rounded-2xl">
                <CardHeader className="flex flex-row">
                    <div className="bg-[#F6F5F9] rounded-3xl">
                        <Button className={cn("self-start my-1 mx-1 px-4 rounded-3xl mr-1", tab === "WithDrawals" && "bg-white")} onClick={() => setTab("WithDrawals")}>
                            <FaScaleUnbalancedFlip className="mr-1" />
                            {t("withdrawals")}
                        </Button>
                        <Button className={cn("self-start mt-1  px-4 rounded-3xl mr-1", tab === "P2P Transfer" && "bg-white")} onClick={() => setTab("P2P Transfer")}>
                            <TbArrowsTransferUp className="mr-1" />
                            {t("p2p_transfer")}
                        </Button>
                    </div>
                </CardHeader>
                {
                    tab === "WithDrawals" ?
                        <OnRamp onRampConfig={onRampConfig} onRamps={onRamps}>
                            <ChartTooltip
                                cursor={true}
                                // @ts-ignore
                                content={<OnRampTooltip t={t} session={session?.data} nameKey={t("withdrawals")} />}
                            /></OnRamp>
                        :
                        <P2PTransfer p2pConfig={p2pConfig} p2pTransfers={p2pTransfers}>
                            <ChartTooltip cursor={true} content={
                                // @ts-ignore
                                <P2PTooltip t={t} session={session?.data} nameKey={t("p2p_transfer")} />} />
                        </P2PTransfer>
                }
            </Card>
        </div>
    )
}
