"use client"
import { Input } from '../atoms/Input'
import { Button } from '../atoms/Button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../molecules/Form'
import { signUpPayload } from '@repo/forms/signupSchema'
import { userFormSignup } from "@repo/forms/signup"
import { useToast } from "../molecules/Toaster/use-toast"
import { useRouter } from "next/navigation"
import { CountrySelector } from 'react-international-phone';
import { useState } from 'react'
import { usePhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

interface SignUpFormProps {
    signUpAction: (arg: signUpPayload, countryName: string) => Promise<{
        message: string;
        status: number;
    }>
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ signUpAction }) => {
    const { toast } = useToast()
    const router = useRouter()
    const { handleSubmit, control, ...form } = userFormSignup()
    const locale = useLocale();
    const { country, setCountry } = usePhoneInput({
        defaultCountry: 'us',
        value: '+1 (234)',
    })
    const [countryCode, setCountryCode] = useState(`+${country.dialCode}`)
    const t = useTranslations("SignUpForm")

    const submit = async (payload: signUpPayload) => {
        try {
            const res = await signUpAction(payload, country.name)
            switch (res.status) {
                case 201:
                    toast({
                        title: res.message,
                        variant: "default"
                    })
                    router.push(`/${locale}/login`);
                    break;

                case 409:
                    toast({
                        title: res.message,
                        variant: "destructive"
                    })
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
        } catch (err: any) {
            toast({
                title: `${err.message}`,
                variant: "destructive"
            })
        }

    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <div className="w-[600px] bg-white rounded-lg shadow-lg p-6">
                <div className='self-start mb-7'>
                    <h1 className='font-medium text-3xl text-gray-800'>{t("title")}</h1>
                </div>
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
                                                <CountrySelector flagStyle={{ width: "35px", height: "35px" }} selectedCountry={country.iso2} onSelect={(e) => {
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
                            name="name"
                            render={({ field }) => (
                                <FormItem className='space-y-0'>
                                    <FormLabel className='text-gray-600'>{t("name")}</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="e.g. John Smith" {...field} />
                                    </FormControl>
                                    <FormMessage className='text-red-500' />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("email")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="e.g. john.smith@example.com"
                                            {...field}
                                        />
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
                                    <FormLabel className='text-gray-600'>{t("password")}</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="e.g. ********" {...field} />
                                    </FormControl>
                                    <FormMessage className='text-red-500' />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="bg-[#7132F5] w-full text-white text-lg">{t("create_button")}</Button>
                    </form>
                </ Form>

            </div>

        </div>
    )
}