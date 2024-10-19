"use client"

import React, { useEffect } from 'react'
import { useRouter } from "next/navigation"
import parse from 'html-react-parser';
import { useToast } from "../molecules/Toaster/use-toast"

interface EmailVerificationProps {

    sendVerificationEmailAction: (locale: string) => Promise<{
        message: string;
        status: number;
    }>
    content: {
        locale: string
        status: number
        title: string
        description: string
        btnText: string
        redirectToLogin?: boolean
    }
}
export const EmailVerification: React.FC<EmailVerificationProps> = ({ sendVerificationEmailAction, content }) => {
    const router = useRouter();
    const { toast } = useToast()


    const handleClick = async () => {
        if (content.status === 200) {
            return router.push(`/${content.locale}/dashboard/portfolio`)
        }
        try {
            const res = await sendVerificationEmailAction(content.locale);
            switch (res.status) {
                case 200:
                    toast({
                        title: res.message,
                        variant: "default"
                    })
                    break;

                case 401:
                    toast({
                        title: res.message,
                        variant: "default"
                    })
                    router.push(`/${content.locale}/login`);
                    break;

                case 404:
                    toast({
                        title: res.message,
                        variant: "default"
                    })
                    router.push(`/${content.locale}/login`);
                    break;

                case 500:
                    toast({
                        title: res.message,
                        variant: "destructive"
                    })
                    break;

                default:
                    toast({
                        title: res.message,
                        variant: "destructive"
                    })
                    break;
            }
        } catch (error) {
            toast({
                title: error.message || "Something went wrong",
                variant: "destructive"
            })
        }
    }

    useEffect(() => {
        if (content.redirectToLogin) {
            setTimeout(() => router.push(`/${content.locale}/login`), 5000)
        }
    }, [])

    return (
        <div className="flex flex-col items-center">
            <div>
                <div className="bg-white flex flex-col items-center w-[450px] py-8 rounded-2xl mt-7 px-8">
                    <div><img src="../../email_verification.webp" alt="not found" width={220} height={220} /></div>
                    <div className="mt-10 self-start w-full">
                        <h1 className="text-[1.7rem] font-semibold text-slate-800 mb-5">{content.title}</h1>
                        {parse(content.description)}
                        {content.status !== 404 && content.btnText !== "" && <div className="w-full mt-12" onClick={() => handleClick()}>
                            <button className="w-full text-white bg-purple-600 px-4 py-2 rounded-lg font-medium">{content.btnText}</button>
                        </div>}
                    </div>
                </div>
            </div>
        </div>
    )
}