"use client"

import { useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/Tabs"
import {
    Activity,
    AlertTriangle,
    BarChart3,
    Bell,
    ClipboardList,
    CreditCard,
    FileText,
    Globe,
    Layers,
    PieChart,
    TrendingUp,
    Users,
    Zap,
} from "lucide-react"
import { useActiveTab, useActiveTabActions, useWSActions } from "@/store/useTabs"
import { realtimeTab } from "@/libs/constants"
import { useGlobalStateHandler} from "@/hooks/useGlobalStateHandler"
import { RealTimeTransactions } from "../dashboard/realTimeTransactions"
import {SignallingManager} from "@/libs/ws"

export const TabsComponent = () => {
    const { setActiveTab } = useActiveTabActions()
    const currentTab = useActiveTab()
    const {  setCloseConnection, setCurrentChannel } = useWSActions()
    const { processIncomingChannelMessage,handleStateWSConnection } = useGlobalStateHandler()

    useEffect(() => {
        console.log("current tab", currentTab);
        if (realtimeTab.includes(currentTab)) {
            SignallingManager.getInstance().init([processIncomingChannelMessage,handleStateWSConnection], currentTab)
            // setWSConnection((instance) => instance.init(processIncomingChannelMessage, currentTab))
            setCurrentChannel(currentTab)
        }
        return () => {
            console.log("closing connection");
            setCloseConnection()
        }
    }, [currentTab])

    return (
        <Tabs defaultValue={currentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-12 h-auto">
                <TabsTrigger value="overview" className="flex items-center gap-1" onClick={() => setActiveTab("overview")}>
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden md:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="realtime_monitor" className="flex items-center gap-1" onClick={() => setActiveTab("realtime_monitor")}>
                    <Bell className="h-4 w-4" />
                    <span className="hidden md:inline">Real-Time</span>
                </TabsTrigger>
                <TabsTrigger value="realtime_transaction" className="flex items-center gap-1" onClick={() => setActiveTab("realtime_transaction")}>
                    <CreditCard className="h-4 w-4" />
                    <span className="hidden md:inline">Transactions</span>
                </TabsTrigger>


                {/* -------------- */}
                <TabsTrigger value="predictive" className="flex items-center gap-1" onClick={() => setActiveTab("predictive")}>
                    <Zap className="h-4 w-4" />
                    <span className="hidden md:inline">Predictive</span>
                </TabsTrigger>
                <TabsTrigger value="workflow" className="flex items-center gap-1">
                    <ClipboardList className="h-4 w-4" />
                    <span className="hidden md:inline">Workflow</span>
                </TabsTrigger>
                <TabsTrigger value="geographic" className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <span className="hidden md:inline">Geographic</span>
                </TabsTrigger>
                <TabsTrigger value="team" className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span className="hidden md:inline">Team</span>
                </TabsTrigger>
                <TabsTrigger value="risk" className="flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="hidden md:inline">Risk</span>
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="hidden md:inline">Trends</span>
                </TabsTrigger>
                <TabsTrigger value="distribution" className="flex items-center gap-1">
                    <PieChart className="h-4 w-4" />
                    <span className="hidden md:inline">Distribution</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    <span className="hidden md:inline">Activity</span>
                </TabsTrigger>
                <TabsTrigger value="executive" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span className="hidden md:inline">Executive</span>
                </TabsTrigger>
                <TabsTrigger value="all" className="flex items-center gap-1">
                    <Layers className="h-4 w-4" />
                    <span className="hidden md:inline">All Metrics</span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="realtime_transaction" className="mt-6">
                <div className="grid grid-cols-1 gap-6">
                    <RealTimeTransactions />
                </div>
            </TabsContent>

        </Tabs>
    )
}