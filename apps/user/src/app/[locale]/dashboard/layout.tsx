"use client"

import { SideBar } from "@repo/ui/Sidebar";
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation";

export default function Layout({ children, params }: { children: React.ReactNode, params: { locale: string } }) {
    const session = useSession()

    return (
        <div className="flex" >
            {
                (session.status === "unauthenticated")
                    ?
                    redirect(`/${params.locale}/login`) :
                    <>
                        <SideBar />
                        {children}
                    </>
            }
        </div >
    );
}