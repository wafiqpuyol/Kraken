"use client"
import { Input } from '../atoms/Input'
import { Button } from '../atoms/Button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../molecules/Form'
import { loginPayload } from '@repo/forms/loginSchema'
import { userFormSignIn } from "@repo/forms/signin"
import { useToast } from "../molecules/Toaster/use-toast"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TwoFAForm } from '../molecules/TwoFAForm'
import { useState } from 'react'


interface LoginProps {
    isTwoFAEnabled: boolean
    activate2fa: (otp: string) => Promise<{
        message: string;
        status: number;
    }>
}

export const SignInForm: React.FC<LoginProps> = ({ isTwoFAEnabled, activate2fa }) => {
    const [isTwoFAFormShow, setIsTwoFAFormShow] = useState(false)
    const router = useRouter()
    const { toast } = useToast()
    const { handleSubmit, control, ...form } = userFormSignIn()
    const submit = async (payload: loginPayload) => {
        try {
            signIn("credentials", { ...payload, redirect: false }).then((response) => {
                if (!response?.ok || response.error) {
                    return toast({
                        title: response.error || "Email or Password is incorrect",
                        variant: "destructive"
                    })
                }
                setIsTwoFAFormShow(true)
                toast({
                    title: `Login Successful`,
                    variant: "default"
                })
                if (isTwoFAEnabled) {
                    router.push("/dashboard/home");
                }
            })
        } catch (err: any) {
            toast({
                title: `${err.message}`,
                variant: "destructive"
            })
        }
    }
    return (

        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <div className="flex flex-col bg-card rounded-lg shadow-lg p-6 max-w-md w-full">
                {/* @ts-ignore */}
                {!isTwoFAFormShow &&
                    <>
                        < Form {...form}>
                            <form
                                onSubmit={handleSubmit(submit)}
                                className="max-w-[400px] space-y-8"
                                autoComplete="false"
                            >
                                <FormField
                                    control={control}
                                    name="phone_number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>* Phone Number (required)</FormLabel>
                                            <FormControl>
                                                <Input type="text" {...field} />
                                            </FormControl>
                                            <FormMessage className='text-red-500' />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>* Password (required)</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="e.g. ********" {...field} />
                                            </FormControl>
                                            <FormMessage className='text-red-500' />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="bg-[#7132F5] w-full text-white text-lg">Continue</Button>
                            </form>
                        </ Form>

                        <div className='ml-1 flex gap-1 mt-2 justify-center'>
                            <span className='text-sm font-medium text-slate-500'>Forgot</span>
                            <Link href="/forgot-password" className='text-sm text-purple-400 font-medium'>password?</Link>
                        </div>
                    </>
                }
                {
                    !isTwoFAEnabled && isTwoFAFormShow && <TwoFAForm activate2fa={activate2fa} />
                }
            </div>

        </div>
    )
}