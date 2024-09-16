"use client"

import { Button } from "../../atoms/Button"
import { Card, CardContent } from "../../atoms/Card"
import { Badge } from "../../atoms/Badge"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { TwoFAEnableDialog } from "../../molecules/TwoFAEnableModal"
import { TwoFADisableDialog } from "../../molecules/TwoFADisableDialog"
import { useToast } from "../../molecules/Toaster/use-toast"
import { useState } from "react"


interface SecurityTabProps {
    isTwoFaEnabled: boolean
    getTwoFASecret: () => Promise<{
        message?: string;
        status?: number;
        twoFactorSecret?: string | undefined;
    }>
    activate2fa: (otp: string) => Promise<{
        message: string;
        status: number;
    }>

}
export const SecurityTab: React.FC<SecurityTabProps> = ({ getTwoFASecret, isTwoFaEnabled, activate2fa }) => {
    const session = useSession()
    const router = useRouter()
    const { toast } = useToast()
    const [code, setCode] = useState("");
    console.log(session.data);

    const handleClick = async () => {
        const res = await getTwoFASecret()
        console.log(res);
        switch (res.status) {
            case 200:
                setCode(res.twoFactorSecret as string)
                break
            case 401:
                toast({
                    title: res.message,
                    variant: "destructive"
                })
                break
            case 500:
                toast({
                    title: res.message,
                    variant: "destructive"
                })
                break
        }
    }

    return (
        <div className="space-y-6 bg-white">
            <Card>
                <CardContent className="pt-6">
                    <h2 className="text-2xl font-semibold mb-4">Sign-in</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            {/* gap-x-40 */}
                            <div className="flex items-center justify-between space-x-40">
                                <h3 className="text-sm font-medium  text-gray-500 self-start">Sign-in with</h3>
                                <div>
                                    <p className="mt-1 font-medium">
                                        email
                                        <span className="text-slate-500 ml-2">({session.data?.user?.email})</span>
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        We recommend setting this to "username only" if you access Kraken on a shared device.
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" className="text-purple-600 bg-purple-200">Edit</Button>
                        </div>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center justify-between text-gray-500 space-x-44">
                                <h3 className="text-sm font-medium ">Password</h3>
                                <p className="mt-1 text-sm">Protect your account with a unique, strong password not used elsewhere.</p>
                            </div>
                            <Button variant="outline" className="text-purple-600 bg-purple-200" onClick={() => router.push("/change-password")}>Change</Button>
                        </div>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center justify-between space-x-36">
                                <h3 className="text-sm font-medium text-gray-500">Auto sign-out</h3>
                                <div className="">
                                    <p className="mt-1 font-medium">480 minutes (default)</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Time of account inactivity before automatic sign-out.
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" className="text-purple-600 bg-purple-200">Edit</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <h2 className="text-2xl font-semibold mb-4">Sign-in Two-Factor Authentication (2FA)</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center justify-between space-x-32">
                                <div className="flex flex-col items-start">
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Passkeys</h3>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 rounded-md">Recommended</Badge>
                                </div>
                                <p className="mt-1 text-sm text-slate-500">
                                    Uses FIDO2 compliant device biometrics or a hardware security key. Add up to 5 passkeys that protect you from phishing attacks.{' '}
                                    <a href="#" className="text-purple-600 hover:underline font-medium">Learn more</a>
                                </p>
                            </div>
                            <Button variant="outline" className="text-purple-600 bg-purple-200">Add passkey</Button>
                        </div>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center justify-between space-x-28">
                                <h3 className="text-sm font-medium text-gray-500">Authenticator app</h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Uses a one-time code from an app like Google Authenticator or Authy.{' '}
                                    <a href="#" className="text-purple-600 hover:underline font-medium">Learn more</a>
                                </p>
                            </div>
                            {
                                isTwoFaEnabled ?
                                    <TwoFADisableDialog ><Button variant="outline" className="text-purple-600 bg-purple-200" onClick={handleClick}>Remove</Button></TwoFADisableDialog>
                                    :
                                    <TwoFAEnableDialog code={code} activate2fa={activate2fa}><Button variant="outline" className="text-purple-600 bg-purple-200" onClick={handleClick}>Enable</Button></TwoFAEnableDialog>
                            }
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}