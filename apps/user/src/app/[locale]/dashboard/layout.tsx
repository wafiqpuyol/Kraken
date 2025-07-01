import { SideBar } from "@repo/ui/Sidebar";
import { useRedirectToLogin } from "../../../hooks/useRedirect"


export default async function Layout({ children, params }: { children: React.ReactNode, params: { locale: string } }) {
    await useRedirectToLogin(params.locale, "/login")
    return (
        <>
            <SideBar />
            <div className="pl-72 pt-10">
                {children}
            </div>
        </ >
    );
}