"use client"

import { usePathname } from 'next/navigation'
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@repo/ui/Button"
import { signOut } from "next-auth/react"
import { Profile } from "../organisms/Profile"


interface NavbarProps {
    disable2fa: () => Promise<void>
}
export const Navbar: React.FC<NavbarProps> = ({ disable2fa }) => {
    const pathName = usePathname()
    const session = useSession();

    const handleClick = async () => {
        await disable2fa();
        signOut()
    }
    return (
        <nav className="bg-purple-600 px-8 py-6 flex justify-between items-center relative">
            <Link href="/"><img className="w-32" src='./kraken.webp' alt="Kraken Logo" /></Link>
            <div className="flex space-x-4 sticky">
                {
                    session.data?.user
                        ?
                        pathName.endsWith("/")
                            ?
                            <Button className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-zinc-200"><Link href="/dashboard/home">My Account</Link></Button>
                            :
                            <Profile><Button className='bg-white font-medium text-slate-500 px-2 hover:bg-slate-100' onClick={handleClick}>Logout</Button></Profile>
                        :
                        (
                            (pathName === "/")
                                ?
                                <>
                                    <Button className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-zinc-200"><Link href="/login">Login</Link></Button>
                                    <Button className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-600"><Link href="/signup">Sign Up</Link></Button>
                                </>
                                :
                                (
                                    pathName.startsWith("/login")
                                        ?
                                        <Button className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-600"><Link href="/signup">Sign Up</Link></Button>
                                        :
                                        <Button className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-zinc-200"><Link href="/login">Login</Link></Button>
                                )
                        )
                }
            </div>
        </nav>
    )
}