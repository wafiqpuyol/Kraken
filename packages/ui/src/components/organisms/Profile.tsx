import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '../molecules/Dropdown'
import { Avatar, AvatarImage } from "../atoms/Avatar"
import { VscSignOut } from "react-icons/vsc";
import { GoGear } from "react-icons/go";
import Link from "next/link"
import { ProfileIcon } from "../../icons/index"

export const Profile = ({ children }: { children: React.ReactNode }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar className='bg-white flex justify-center items-center'><ProfileIcon /></Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='bg-white mr-4 mt-2'>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='flex items-center hover:bg-slate-100 cursor-pointer'>
                    <GoGear />
                    <Link href="/dashboard/account-settings/settings" className='font-medium text-slate-500 ml-2'>Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className='flex items-center hover:bg-slate-100'>
                    <VscSignOut />
                    {children}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}