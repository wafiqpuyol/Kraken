import React from 'react'
import { SignUpForm } from "@repo/ui/SignUpForm"
import { signUpAction } from "../../../lib/auth"
import { getServerSession } from "next-auth"
import { redirect } from 'next/navigation'
import { authOptions } from '@repo/network'

async function page() {
    const session = await getServerSession(authOptions)
    if (session?.user || session?.user?.uid) {
        redirect("/dashboard/home")
    }
    return (
        <div className='grid grid-cols-10 min-h-[640px]'>
            <div className='overflow-hidden h-[100vh] hidden xl:block col-start-1 col-span-5'>
                <img src="./signup.svg" alt="Signup" width={100} height={100} className="w-full h-full object-cover object-center" />
            </div>
            <div className='col-span-full xl:col-span-5'>
                <SignUpForm signUpAction={signUpAction} />
            </div>
        </div>
    )
}

export default page