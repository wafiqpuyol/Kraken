import { Button } from '../atoms/Button';
import { LuAlertTriangle } from "react-icons/lu";
import { useToast } from "../molecules/Toaster/use-toast"
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation'
import { useSession } from "next-auth/react"
import { responseHandler } from "../../lib/utils"
import { useState } from 'react';

interface GetVerifiedProps {
    sendVerificationEmailAction: (locale: string) => Promise<{
        message: string;
        status: number;
    }>
    title: string
}

export const GetVerified: React.FC<GetVerifiedProps> = ({ sendVerificationEmailAction, title }) => {
    const locale = useLocale()
    const { toast } = useToast()
    const session = useSession()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isBtnDisable, setIsBtnDisable] = useState(false)


    const handleVerificationBtn = async () => {
        try {
            if (session.status === "unauthenticated" || session.data === null || !session.data.user) {
                return router.push(`/${locale}/login`);
            }
            setIsLoading(true)
            const res = await sendVerificationEmailAction(locale)
            switch (res.status) {
                case 401:
                    toast({
                        title: res.message,
                        variant: "default",
                        className: "bg-green-500 text-white rounded-xl",
                        duration: 3000
                    })
                    router.push(`/${locale}/login`);
                    break;

                case 404:
                    toast({
                        title: res.message,
                        variant: "default",
                        className: "bg-green-500 text-white rounded-xl",
                        duration: 3000
                    })
                    router.push(`/${locale}/login`);
                    break;
            }
            responseHandler(res)
            setIsLoading(false)
            res.status === 200 ? setIsBtnDisable(true) : setIsBtnDisable(false)
        } catch (error: any) {
            setIsLoading(false)
            toast({
                title: error.message || "Something went wrong",
                variant: "destructive"
            })
        }
    }

    return (
        <div>
            <div className="flex items-center gap-3 bg-yellow-100/50 mb-8 p-4 rounded-xl">
                <div className="self-start mt-1">
                    <LuAlertTriangle className="text-yellow-700 text-xl" />
                </div>
                <div>
                    <p className="font-bold text-gray-700">{title}</p>
                    <span className="text-slate-500/85 font-medium text-[0.8rem]">Submit a few personal details, and you'll be all set to fund your account.</span>
                </div>
            </div>
            <Button className="w-full bg-purple-600 text-white rounded-3xl" disabled={isLoading || isBtnDisable} onClick={handleVerificationBtn}>Get Verified</Button>
        </div>
    )
}