import React from 'react'
import { SignInForm } from "@repo/ui/SignInForm"
import { activate2fa, isTwoFAEnabled } from "../../../../../lib/twoFA"
import { useRedirect } from '../../../../../hooks/useRedirect'
import { verifyPasskey } from "../../../../../lib/masterkey"
import {verifyCaptchaToken} from "../../../../../lib/captcha"

const page = async ({ params: { locale } }: { params: { locale: string } }) => {
    await useRedirect(locale, "/dashboard/portfolio");

    return (
        <div className='grid grid-cols-10 min-h-[640px]'>
            <div className='overflow-hidden h-[100vh] hidden xl:block col-start-1 col-span-5'>
                <img src="../login.svg" alt="Signup" width={100} height={100} className="w-full h-full object-cover object-center" />
            </div>
            <div className='col-span-full xl:col-span-5'>
                <SignInForm activate2fa={activate2fa} isTwoFAEnabledFunc={isTwoFAEnabled} verifyPasskey={verifyPasskey} verifyCaptchaToken={verifyCaptchaToken}/>
            </div>
        </div>
    )
}

export default page;