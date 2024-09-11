"use client"

import { SideBar } from "@repo/ui/Sidebar";
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode; }) {
    const session = useSession()

    return (
        <div className="flex" >
            {
                (session.status === "unauthenticated")
                    ?
                    redirect("/login") :
                    <>
                        <SideBar />
                        {children}
                    </>
            }
        </div >
    );
}