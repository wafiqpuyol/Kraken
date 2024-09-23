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
import { usePhoneInput, CountrySelector } from 'react-international-phone';
import 'react-international-phone/style.css';

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
    const { country, setCountry } = usePhoneInput({
        defaultCountry: 'us',
        value: '+1 (234)',
    })
    const [countryCode, setCountryCode] = useState(`+${country.dialCode}`)

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
                if (!isTwoFAEnabled) {
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

        <div className="flex flex-col items-center justify-center h-screen p-4 ">
            <div className="flex flex-col bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                <div className='self-start mb-7'>
                    <h1 className='font-medium text-3xl text-gray-800'>Sign in to Kraken</h1>
                </div>
                {/* @ts-ignore */}
                {!isTwoFAFormShow &&
                    <>
                        < Form {...form}>
                            <form
                                onSubmit={handleSubmit(submit)}
                                className="w-full space-y-8"
                                autoComplete="false"
                            >
                                <FormField
                                    control={control}
                                    name="phone_number"
                                    render={({ field }) => {
                                        return (
                                            <FormItem>
                                                <FormLabel className='text-gray-600'>Phone Number</FormLabel>
                                                <FormControl>
                                                    <div className='flex gap-1 items-center'>
                                                        <CountrySelector selectedCountry={country.iso2} onSelect={(e) => {
                                                            setCountry(e.iso2);
                                                            field.onChange(() => `+${e.dialCode}`)
                                                            setCountryCode(e.dialCode || "")
                                                        }} />
                                                        <Input type="text" {...field} defaultValue={countryCode} value={field.value} onChange={(e) => {
                                                            setCountryCode(field.value)
                                                            field.onChange(e.target.value)
                                                        }} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className='text-red-500' />
                                            </FormItem>
                                        )
                                    }
                                    }
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