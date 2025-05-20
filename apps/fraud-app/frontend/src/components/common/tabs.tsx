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

export const TabsComponent = () => {

    return (
        <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-12 h-auto">
                <TabsTrigger value="overview" className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden md:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="realtime" className="flex items-center gap-1">
                    <Bell className="h-4 w-4" />
                    <span className="hidden md:inline">Real-Time</span>
                </TabsTrigger>
                <TabsTrigger value="transactions" className="flex items-center gap-1">
                    <CreditCard className="h-4 w-4" />
                    <span className="hidden md:inline">Transactions</span>
                </TabsTrigger>
                <TabsTrigger value="predictive" className="flex items-center gap-1">
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
        </Tabs>
    )
}