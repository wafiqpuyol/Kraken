import { TabsComponent } from "../common/tabs"
export const Dashboard = () => {
    return (
        <div className="space-y-6 p-6">
            <h1 className="text-3xl font-bold tracking-tight">Fraud Management Dashboard</h1>
            <TabsComponent />   
        </div>
    )
}