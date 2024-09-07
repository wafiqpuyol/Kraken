"use client"

import { usePathname } from 'next/navigation'
import Link from "next/link"

export const Navbar = () => {
    const pathName = usePathname()
    return (
        <nav className="bg-purple-600 p-4 flex justify-between items-center">
            <div className="text-white text-2xl font-bold">Kraken</div>
            <div className="flex space-x-4">
                {
                    (pathName === "/")
                        ?
                        <>
                            <button className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-zinc-200"><Link href="/login">Login</Link></button>
                            <button className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-600"><Link href="/signup">Sign Up</Link></button>
                        </>
                        :
                        (
                            pathName.startsWith("/login")
                                ?
                                <button className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-600"><Link href="/signup">Sign Up</Link></button>
                                :
                                <button className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-zinc-200"><Link href="/login">Login</Link></button>
                        )
                }

            </div>
        </nav>
    )
}