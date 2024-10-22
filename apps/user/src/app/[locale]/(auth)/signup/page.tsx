import React from 'react'
import { SignUpForm } from "@repo/ui/SignUpForm"
import { signUpAction } from "../../../../lib/auth"
import { useRedirect } from '../../../../hooks/useRedirect'

async function page({ params: { locale } }: { params: { locale: string } }) {
    await useRedirect(locale, "/dashboard/portfolio")

    return (
        <div className='grid grid-cols-10 min-h-[640px]'>
            <div className='overflow-hidden h-[100vh] hidden xl:block col-start-1 col-span-5'>
                <img src="../signup.svg" alt="Signup" width={100} height={100} className="w-full h-full object-cover object-center" />
            </div>
            <div className='col-span-full xl:col-span-5'>
                <SignUpForm signUpAction={signUpAction} />
            </div>
        </div>
    )
}

export default page