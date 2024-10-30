import { Lock } from "lucide-react"
import { useTranslations } from "next-intl"
import { Dispatch, SetStateAction, useEffect, useState } from 'react'


interface LockProps {
    lockedAccountExpiresAt?: Date | null
    updateLockStatus?: () => Promise<void>
    setAccountLock: Dispatch<SetStateAction<boolean>>
    checkAccountLockStatus?: () => Promise<{
        message: string;
        status: number;
        isLock?: boolean;
        lockExpiry?: Date | null;
    }>
}

export const AccountLock: React.FC<LockProps> = ({ updateLockStatus, setAccountLock, checkAccountLockStatus, lockedAccountExpiresAt }) => {
    const t = useTranslations("AccountLock")
    const [lockExpiry, setLockExpiry] = useState<Date | null>(lockedAccountExpiresAt ?? null)

    useEffect(() => {
        async function func() {
            const timer = (await checkAccountLockStatus()).lockExpiry ?? null
            setLockExpiry(timer)
        }
        if (checkAccountLockStatus) func()
    }, [])

    useEffect(() => {
        if (lockExpiry) {
            var expiryDate = new Date(lockExpiry).getTime()
            let time = setInterval(function () {
                var now = new Date().getTime()
                var distance = expiryDate - now
                var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((distance % (1000 * 60)) / 1000);

                if (hours >= 0 || minutes >= 0 || seconds >= 0) {
                    // @ts-ignore
                    document.getElementById("demo").innerHTML = hours + "h "
                        + minutes + "m " + seconds + "s ";

                } else {
                    if (updateLockStatus) updateLockStatus()
                    setAccountLock(false)
                    setLockExpiry(null)
                    hours = 0; minutes = 0; seconds = 0
                }
                if (distance < 0) {
                    clearInterval(time)
                }
            }, 1000)
        }
    }, [lockExpiry])

    return (
        <div className="absolute inset-0 bg-black rounded-lg bg-opacity-50 backdrop-blur-sm flex flex-col items-center justify-center">

            <div className="bg-white bg-opacity-20 rounded-full p-6 mb-4">
                <Lock className="w-16 h-16 text-white" />
            </div>
            <div className="text-white text-xl font-semibold text-center">
                <p className='text-2xl mb-2'>{t("title")}</p>
                <p id='demo' className='item-start text-[30px] text-white text-xl font-semibold'></p>
            </div>
        </div>
    )
}