"use client"

import Link from "next/link"
import { LINK } from "@repo/ui/constants"
import { useLocale } from "next-intl"

export default function page() {
    const locale = useLocale()
    return (
        <div className="flex flex-col items-center">
            <div>
                <div className="bg-white flex flex-col items-center w-[400px] py-8 rounded-2xl mt-7">
                    <div><img src="../../not_found.webp" alt="not found" width={220} height={220} /></div>
                    <div className="mt-10">
                        <h1 className="text-3xl font-semibold text-slate-800 mb-3">Page not found</h1>
                        <p className="text-slate-500/85 text-[0.95rem] font-medium">The page you were looking for was not found.</p>
                        <div className="w-full mt-12">
                            <Link href={`/${locale}/dashboard/portfolio`} >
                                <button className="w-full text-white bg-purple-600 px-4 py-2 rounded-lg font-medium">Back to Home page</button>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="flex self-start ml-3 mt-2 gap-3 text-slate-500/80 font-medium">
                    <Link href={LINK[0].href}><small>{LINK[0].title}</small></Link>
                    <Link href={LINK[1].href}><small>{LINK[1].title}</small></Link>
                </div>
            </div>
        </div>
    )
}