"use client"

import { SideBar } from "@repo/ui/Sidebar";
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation";

export default function Layout({ children, params }: { children: React.ReactNode, params: { locale: string } }) {
    const session = useSession()

    return (
        <div >
            {
                (session.status === "unauthenticated")
                    ?
                    redirect(`/${params.locale}/login`) :
                    <>
                        <SideBar />
                        <div className="pl-72 pt-10">
                            {children}
                        </div>
                    </>
            }
        </div >
    );
}