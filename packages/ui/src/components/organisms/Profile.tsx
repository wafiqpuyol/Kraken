"use client"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '../molecules/Dropdown'
import { Avatar } from "../atoms/Avatar"
import { VscSignOut } from "react-icons/vsc";
import { GoGear } from "react-icons/go";
import Link from "next/link"
import { ProfileIcon } from "../../icons/index"
import { useTranslations } from 'next-intl';
import { useLocale } from "next-intl"

interface ProfileProps {
    children: React.ReactNode
}
export const Profile: React.FC<ProfileProps> = ({ children }) => {
    const locale = useLocale()
    const t = useTranslations("Profile")
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar className='bg-white flex justify-center items-center'><ProfileIcon /></Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='bg-white mr-4 mt-2'>
                <DropdownMenuLabel>{t("my_account")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='flex items-center hover:bg-slate-100 cursor-pointer'>
                    <GoGear />
                    <Link href={`/${locale}/dashboard/account-settings/settings`} className='font-medium text-slate-500 ml-2'>{t("settings")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className='flex items-center hover:bg-slate-100'>
                    <VscSignOut />
                    {children}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}