"use client"
import { usePathname, useRouter } from "next/navigation";
import { HomeIcon, TransactionsIcon, TransferIcon, Send } from "../../icons/index"
import { useLocale, useTranslations } from 'next-intl';

interface SidebarProps {
    href: string
    title: string
    icon: React.ReactNode
}

const SidebarItem: React.FC<SidebarProps> = ({ href, title, icon }) => {
    const router = useRouter();
    const pathname = usePathname()
    const selected = pathname === href
    return <div className={`flex ${selected ? "text-[#7132F5]" : "text-slate-500"} cursor-pointer p-2 pl-8`} onClick={() => {
        router.push(href);
    }}>
        <div className="pr-2">
            {icon}
        </div>
        <div className={`font-bold ${selected ? "text-[#7132F5]" : "text-slate-500"}`}>
            {title}
        </div>
    </div>
}


export const SideBar = () => {
    const locale = useLocale();
    const t = useTranslations("SideBar");
    return (
        <div className="w-52 border-r border-slate-300 min-h-screen pt-28 fixed bg-[#f2f1f5] text-[17px]">
            <div className="">
                <SidebarItem href={`/${locale}/dashboard/portfolio`} icon={<HomeIcon />} title={"Portfolio"} />
                <SidebarItem href={`/${locale}/dashboard/transfer/withdraw`} icon={<TransferIcon />} title={t("transfer")} />
                <SidebarItem href={`/${locale}/dashboard/transactions/p2p-history`} icon={<TransactionsIcon />} title={t("transactions")} />
                <SidebarItem href={`/${locale}/dashboard/p2p/send-money`} icon={<Send />} title={t("send_money")} />
            </div>
        </div>
    )
}
