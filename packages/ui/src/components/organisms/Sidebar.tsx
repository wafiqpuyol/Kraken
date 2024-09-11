"use client"
import { usePathname, useRouter } from "next/navigation";
import { HomeIcon, TransactionsIcon, TransferIcon } from "../../icons/index"

interface SidebarProps {
    href: string
    title: string
    icon: React.ReactNode
}

const SidebarItem: React.FC<SidebarProps> = ({ href, title, icon }) => {
    const router = useRouter();
    const pathname = usePathname()
    const selected = pathname === href

    return <div className={`flex ${selected ? "text-[#6a51a6]" : "text-slate-500"} cursor-pointer  p-2 pl-8`} onClick={() => {
        router.push(href);
    }}>
        <div className="pr-2">
            {icon}
        </div>
        <div className={`font-bold ${selected ? "text-[#6a51a6]" : "text-slate-500"}`}>
            {title}
        </div>
    </div>
}


export const SideBar = () => {
    return (
        <div className="w-52 border-r border-slate-300 min-h-screen mr-4 pt-28">
            <div>
                <SidebarItem href={"/dashboard/home"} icon={<HomeIcon />} title="Home" />
                <SidebarItem href={"/dashboard/transfer/deposit"} icon={<TransferIcon />} title="Transfer" />
                <SidebarItem href={"/dashboard/transactions"} icon={<TransactionsIcon />} title="Transactions" />
            </div>
        </div>
    )
}
