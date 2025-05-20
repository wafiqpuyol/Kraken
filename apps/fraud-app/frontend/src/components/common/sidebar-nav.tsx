"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/libs/utils"
import {
    AlertCircle,
    BarChart3,
    FileText,
    Home,
    Settings,
    Shield,
    Users,
    Brain,
    History,
    FileSearch,
} from "lucide-react"

const items = [
    {
        name: "Dashboard",
        href: "/fraud-case-management/dashboard",
        icon: Home,
    },
    {
        name: "Metrics Analysis",
        href: "/fraud-case-management/metrics-analysis",
        icon: BarChart3,
    },
    {
        name: "Alerts",
        href: "/fraud-case-management/alerts",
        icon: AlertCircle,
    },
    {
        name: "Cases",
        href: "/fraud-case-management/cases",
        icon: AlertCircle,
    },
    {
        name: "Analytics",
        href: "/fraud-case-management/analytics",
        icon: FileText,
    },
    {
        name: "Advanced Detection",
        href: "/fraud-case-management/advanced-detection",
        icon: Brain,
    },
    {
        name: "Compliance",
        href: "/fraud-case-management/compliance",
        icon: Shield,
    },
    {
        name: "Users",
        href: "/fraud-case-management/users",
        icon: Users,
    },
    {
        name: "Audit Logs",
        href: "/fraud-case-management/audit",
        icon: History,
    },
    {
        name: "Audit Settings",
        href: "/fraud-case-management/audit/settings",
        icon: FileSearch,
    },
    {
        name: "Settings",
        href: "/fraud-case-management/settings",
        icon: Settings,
    },
]

export function SidebarNav() {
    const pathname = usePathname()

    return (
        <nav className="grid items-start gap-2">
            {items.map((item, index) => {
                const Icon = item.icon
                return (
                    <Link
                        key={index}
                        href={item.href}
                        className={cn(
                            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                            pathname === item.href ? "bg-accent" : "transparent",
                        )}
                    >
                        <Icon className="mr-2 h-4 w-4" />
                        <span>{item.name}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
