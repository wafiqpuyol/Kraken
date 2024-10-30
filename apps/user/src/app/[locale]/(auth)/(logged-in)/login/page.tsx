import React from 'react'
import { SignInForm } from "@repo/ui/SignInForm"
import { activate2fa, isTwoFAEnabled } from "../../../../../lib/twoFA"
import { useRedirect } from '../../../../../hooks/useRedirect'
import { verifyPasskey } from "../../../../../lib/masterkey"
import { redisManager } from "@repo/cache/redisManager"
import { WRONG_PASSWORD_ATTEMPTS } from "@repo/ui/constants"

const page = async ({ params: { locale } }: { params: { locale: string } }) => {
    await useRedirect(locale, "/dashboard/portfolio");

    const totalPasswordFailedAttempts = (await redisManager().getCache("accountLocked"));
    const isAccountLocked = totalPasswordFailedAttempts?.failedAttempt ? Number(totalPasswordFailedAttempts.failedAttempt) === WRONG_PASSWORD_ATTEMPTS : false
    const lockedAccountExpiresAt = totalPasswordFailedAttempts?.lockExpiresAt ?? null

    return (
        <div className='grid grid-cols-10 min-h-[640px]'>
            <div className='overflow-hidden h-[100vh] hidden xl:block col-start-1 col-span-5'>
                <img src="../login.svg" alt="Signup" width={100} height={100} className="w-full h-full object-cover object-center" />
            </div>
            <div className='col-span-full xl:col-span-5'>
                <SignInForm activate2fa={activate2fa} isTwoFAEnabledFunc={isTwoFAEnabled} verifyPasskey={verifyPasskey}
                    isAccountLocked={isAccountLocked} lockedAccountExpiresAt={lockedAccountExpiresAt}
                />
            </div>
        </div>
    )
}

export default page;