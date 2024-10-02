"use client"
import { Input } from '../atoms/Input'
import { Button } from '../atoms/Button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../molecules/Form'
import { resetPasswordPayload } from '@repo/forms/resetPasswordSchema'
import { userFormResetPassword } from "@repo/forms/resetPassword"
import { useToast } from "../molecules/Toaster/use-toast"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"


interface resetPasswordProps {
    resetPasswordAction: (payload: resetPasswordPayload, resetPasswordToken: string | undefined) => Promise<{
        message: string | undefined;
        status: number;
    }>
    resetPasswordToken: string | undefined
}
export const ResetPasswordForm: React.FC<resetPasswordProps> = ({ resetPasswordAction, resetPasswordToken }) => {
    const router = useRouter()
    const { toast } = useToast()
    const { handleSubmit, control, ...form } = userFormResetPassword()
    const locale = useLocale()
    const t = useTranslations("ResetPasswordForm")
    console.log(resetPasswordToken);
    const submit = async (payload: resetPasswordPayload) => {
        try {
            const res = await resetPasswordAction(payload, resetPasswordToken)
            switch (res.status) {
                case 201:
                    toast({
                        title: `${res.message}`,
                        variant: "default"
                    })
                    router.push(`/${locale}/dashboard/home`);
                    break;
                case 400:
                    toast({
                        title: `${res.message}`,
                        variant: "destructive"
                    })
                    break;
                case 401:
                    toast({
                        title: `${res.message}`,
                        variant: "destructive"
                    })
                    break;
                case 409:
                    toast({
                        title: `${res.message}`,
                        variant: "destructive"
                    })
                    break;
                case 500:
                    toast({
                        title: `${res.message}`,
                        variant: "destructive"
                    })
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
            <div className="bg-white flex flex-col bg-card rounded-lg shadow-lg p-6 max-w-md w-full">
                <h1 className='text-2xl font-medium'>{t("title")}</h1>
                <p className='text-slate-500 text-sm font-normal mt-3 mb-4'>{t("desc")}</p>
                {/* @ts-ignore */}
                < Form {...form}>
                    <form
                        onSubmit={handleSubmit(submit)}
                        className="max-w-[400px] space-y-8"
                        autoComplete="false"
                    >
                        <FormField
                            control={control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("new_password")}</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} placeholder={t("password_placeholder_text")} />
                                    </FormControl>
                                    <FormMessage className='text-red-500' />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="ConfirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("confirm_new_password")}</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} placeholder={t("password_placeholder_text")} />
                                    </FormControl>
                                    <FormMessage className='text-red-500' />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="bg-[#7132F5] w-full text-white text-lg">{t("save_button")}</Button>
                    </form>
                </ Form>
            </div>

        </div>
    )
}