"use client"

import { CopyIcon, CheckIcon } from "lucide-react"
import { Input } from "../atoms/Input"
import { Button } from "../atoms/Button"
import { Label } from "../atoms/Label"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { useToast } from "../molecules/Toaster/use-toast"


export const PersonalInfo = () => {
    const [isCopied, setIsCopied] = useState<boolean>(false)
    const { toast } = useToast()
    const session = useSession()
    const publicId = session.data?.user.uid
    const handleClick = async () => {
        try {
            await navigator.clipboard.writeText(publicId)
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
            <h2 className="text-2xl font-semibold mb-4">Personal info</h2>
            <div className="space-y-4">
                {/* Public ID */}
                <div className="flex justify-between items-center">
                    <div className="flex space-x-[108px] w-full">
                        <Label htmlFor="publicId" className="mt-2 text-slate-500 w-24">Public ID</Label>
                        <div className="flex justify-between w-full">
                            <div>
                                <Input id="publicId" value={publicId} readOnly className="mr-2" />
                                <p className="text-sm text-gray-500">Use this ID when you need to transfer to another user so your account is always secure.</p>

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
                    <div className="flex space-x-28">
                        <Label htmlFor="legalName" className="mt-2 text-slate-500 w-36">Legal name</Label>
                        <Input id="legalName" value={session.data?.user?.name} readOnly />
                    </div>
                    <Button variant="link" className="text-purple-600">Edit</Button>
                </div>

                {/* Email */}
                <div className="flex justify-between items-center">
                    <div className="flex space-x-28">
                        <Label htmlFor="email" className="mt-2 text-slate-500 w-36">Email</Label>
                        <Input id="email" value={session.data?.user?.email} readOnly />
                    </div>
                    <Button variant="link" className="text-purple-600">Edit</Button>
                </div>

                {/* Country */}
                <div className="flex justify-between items-center">
                    <div className="flex space-x-28">
                        <Label htmlFor="country" className="mt-2 text-slate-500 w-36">Country</Label>
                        <Input id="country" value={session.data?.user.country || "Bangladesh"} readOnly />
                    </div>
                    <Button variant="link" className="text-purple-600">Edit</Button>
                </div>
            </div>
        </div>
    )
}