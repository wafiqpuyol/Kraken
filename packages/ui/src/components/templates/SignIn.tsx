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
import { usePhoneInput, CountrySelector, } from 'react-international-phone';
import 'react-international-phone/style.css';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Eye, ClosedEye } from "../../icons"
import { SELECTED_COUNTRY } from "@repo/ui/constants"
import { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/types"

interface LoginProps {
    isTwoFAEnabledFunc: () => Promise<{
        message: string;
        status: number;
        isTwoFAEnabled?: boolean;
        isOTPVerified?: boolean
    }>
    activate2fa: (otp: string, twoFAType: "signInTwoFA" | "withDrawTwoFA") => Promise<{
        message: string;
        status: number;
    }>
    verifyPasskey: (step: "generateAuthentication" | "verifyAuthentication", regCred?: any) => Promise<{
        message: string;
        status: number;
        challenge?: PublicKeyCredentialRequestOptionsJSON;
    }>
}

export const SignInForm: React.FC<LoginProps> = ({ isTwoFAEnabledFunc, activate2fa, verifyPasskey }) => {
    const [isTwoFAFormShow, setIsTwoFAFormShow] = useState(false)
    const [isOTPVerified, setIsOTPVerified] = useState(false)
    const locale = useLocale();
    const router = useRouter()
    const { toast } = useToast()
    const [toggleEye, setToggleEye] = useState(false)
    const { handleSubmit, control, ...form } = userFormSignIn()
    const { country, setCountry } = usePhoneInput({
        defaultCountry: 'us',
        value: '+1 (234)',
    })
    const [countryCode, setCountryCode] = useState(`+${country.dialCode}`)
    const t = useTranslations("SignInForm")

    const submit = async (payload: loginPayload) => {
        try {
            signIn("credentials", { ...payload, redirect: false }).then(async (response) => {
                if (!response?.ok || response.error) {
                    return toast({
                        title: response?.error || "Email or Password is incorrect",
                        variant: "destructive"
                    })
                }
                const twoFA = await isTwoFAEnabledFunc()
                toast({
                    title: `Login Successful`,
                    variant: "default"
                })

                if (!twoFA.isTwoFAEnabled) {
                    router.push(`/${locale}/dashboard/portfolio`);
                }
                setIsTwoFAFormShow(twoFA.isTwoFAEnabled!)
                setIsOTPVerified(twoFA.isOTPVerified!)
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
                    <h1 className='font-medium text-3xl text-gray-800'>{t("title")}</h1>
                </div>
                {!isTwoFAFormShow &&
                    <>
                        {/* @ts-ignore */}
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
                                                <FormLabel className='text-gray-600'>{t("phone_number")}</FormLabel>
                                                <FormControl>
                                                    <div className='flex gap-1 items-center'>
                                                        <CountrySelector countries={[...SELECTED_COUNTRY]} selectedCountry={country.iso2} onSelect={(e) => {
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
                                            <FormLabel className='text-gray-600'>{t("password")}</FormLabel>
                                            <FormControl>
                                                <div className='flex items-center border rounded-lg pr-1 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2'>
                                                    <Input
                                                        className='border-none focus-visible:ring-offset-0 focus-visible:ring-0'
                                                        type={toggleEye ? "text" : "password"} placeholder="e.g. ********" {...field} />
                                                    {
                                                        toggleEye
                                                            ? <div className='cursor-pointer' onClick={() => setToggleEye(!toggleEye)}><Eye /></div>
                                                            :
                                                            <div className='cursor-pointer' onClick={() => setToggleEye(!toggleEye)}><ClosedEye /></div>
                                                    }
                                                </div>
                                            </FormControl>
                                            <FormMessage className='text-red-500' />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="bg-purple-600 w-full text-white text-lg hover:bg-purple-700">{t("continue_button")}</Button>
                            </form>
                        </ Form>

                        <div className='ml-1 flex gap-1 mt-2 justify-center'>
                            <span className='text-sm font-medium text-slate-500'>{t("forgot")}</span>
                            <Link href={`/${locale}/forgot-password`} className='text-sm text-purple-400 font-medium'>{t("password")}?</Link>
                        </div>
                    </>
                }
                {
                    isTwoFAFormShow && !isOTPVerified && <TwoFAForm activate2fa={activate2fa} verifyPasskey={verifyPasskey} />
                }
            </div>
        </div >
    )
}