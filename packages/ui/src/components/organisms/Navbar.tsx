"use client"

import { usePathname } from 'next/navigation'
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@repo/ui/Button"
import { signOut } from "next-auth/react"
import { Profile } from "../organisms/Profile"

export const Navbar = () => {
    const pathName = usePathname()
    const session = useSession();
    return (
        <nav className="bg-purple-600 p-4 flex justify-between items-center">
            <div className="text-white text-2xl font-bold">Kraken</div>
            <div className="flex space-x-4">
                {
                    session.data?.user
                        ?
                        <Profile><Button className='bg-white font-medium text-slate-500 px-2 hover:bg-slate-100' onClick={() => signOut()}>Logout</Button></Profile>
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