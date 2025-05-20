import type React from "react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider } from "@repo/ui/CommonSidebar"
import { SidebarNav } from "@/components/common/sidebar-nav"

export default function FraudCaseManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader className="flex h-14 items-center border-b px-4">
            <h2 className="text-lg font-semibold">Fraud Management</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarNav />
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium">JD</span>
                </div>
                <div>
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">Fraud Analyst</p>
                </div>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1">
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
