"use client"

import { CopyIcon, CheckIcon } from "lucide-react"
import { Button } from "../atoms/Button"
import { Label } from "../atoms/Label"
import { useState } from "react"
import { useToast } from "../molecules/Toaster/use-toast"
import { user } from "@repo/db/type"
import { useTranslations } from 'next-intl';

interface PersonalInfoProps {
    userDetails: user
}

export const PersonalInfo: React.FC<PersonalInfoProps> = ({ userDetails }) => {
    const [isCopied, setIsCopied] = useState<boolean>(false)
    const { toast } = useToast()
    const t = useTranslations("PersonalInfo")
    const publicId = userDetails.id
    const handleClick = async () => {
        try {
            await navigator.clipboard.writeText(publicId.toString())
            setIsCopied(true)
            toast({
                title: "Copied!",
                description: "Public ID copied to clipboard",
                duration: 2000,
                className: "bg-white text-black"
            })
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy text: ", err)
            toast({
                title: "Error",
                description: "Failed to copy Public ID",
                variant: "destructive",
                duration: 2000,
                className: "bg-red-500 text-white"
            })
        }
    }


    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">{t("title")}</h2>
            <div className="space-y-4">
                {/* Public ID */}
                <div className="flex justify-between items-center">
                    <div className="flex space-x-[108px] w-full">
                        <Label htmlFor="publicId" className="mt-2 text-slate-500 w-24">{t("public_id")}</Label>
                        <div className="flex justify-between w-full">
                            <div>
                                <div className="mr-2">
                                    <p className="font-base">{publicId}</p>
                                </div>
                                <p className="text-sm text-gray-500">{t("public_id_info")}</p>

                            </div>
                            <Button size="icon" variant="outline" onClick={handleClick}>
                                {isCopied ? (
                                    <CheckIcon className="h-4 w-4 text-green-500" />
                                ) : (
                                    <CopyIcon className="h-4 w-4 text-purple-600" />
                                )}
                            </Button>

                        </div>

                    </div>
                </div>

                {/* Legal name */}
                <div className="flex justify-between items-center w-full">
                    <div className="flex space-x-11">
                        <Label htmlFor="legalName" className="mt-2 text-slate-500 w-36">{t("legal_name")}</Label>
                        <div>
                            <p className="font-base">{userDetails.name}</p>
                        </div>
                    </div>
                    <Button variant="link" className="text-purple-600">{t("edit")}</Button>
                </div>

                {/* Email */}
                <div className="flex justify-between items-center">
                    <div className="flex space-x-11">
                        <Label htmlFor="email" className="mt-2 text-slate-500 w-36">{t("email")}</Label>
                        <div>
                            <p className="font-base">{userDetails.email}</p>
                        </div>
                    </div>
                    <Button variant="link" className="text-purple-600">{t("edit")}</Button>
                </div>

                {/* Country */}
                <div className="flex justify-between items-center">
                    <div className="flex space-x-11">
                        <Label htmlFor="country" className="mt-2 text-slate-500 w-36">{t("country")}</Label>
                        <div>
                            <p className="font-base">{userDetails.country}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}