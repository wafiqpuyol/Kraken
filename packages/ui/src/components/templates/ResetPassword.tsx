"use client"
import { Input } from '../atoms/Input'
import { useState } from "react"
import { Button } from '../atoms/Button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../molecules/Form'
import { resetPasswordPayload } from '@repo/forms/resetPasswordSchema'
import { PasswordMatchSchema } from '@repo/forms/changePasswordSchema'
import { userFormResetPassword } from "@repo/forms/resetPassword"
import { useToast } from "../molecules/Toaster/use-toast"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { responseHandler } from "../../lib/utils"
import { Eye, ClosedEye } from "../../icons"

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
    const [toogleInput, setToogleInput] = useState({
        newPassword: "password",
        confirmPassword: "password",
        disable: false
    })

    const checkDisable = () => form.formState.isValid

    const submit = async (payload: resetPasswordPayload) => {
        try {
            const res = await resetPasswordAction(payload, resetPasswordToken)
            responseHandler(res)
            switch (res.status) {
                case 201:
                    form.reset({ "ConfirmPassword": "", "newPassword": "" })
                    router.push(`/${locale}/login`);
                    break;
            }

        } catch (err: any) {
            toast({
                title: `${err.message}`,
                variant: "destructive",
                className: "bg-red-500 text-white rounded-xl",
                duration: 3000
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
                                        <div className='flex items-center border rounded-lg pr-1 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2'>
                                            <Input type={toogleInput.newPassword} disabled={toogleInput.disable} className='border-none focus-visible:ring-offset-0 focus-visible:ring-0' {...field} placeholder={t("password_placeholder_text")} />
                                            {
                                                toogleInput.newPassword == "password"
                                                    ?
                                                    <div className='cursor-pointer'
                                                        onClick={() => setToogleInput(prev => ({ ...prev, newPassword: "text" }))}>
                                                        <Eye />
                                                    </div>
                                                    :
                                                    <div className='cursor-pointer' onClick={() => {
                                                        setToogleInput(prev => ({ ...prev, newPassword: "password" }))
                                                    }}><ClosedEye /></div>
                                            }
                                        </div>
                                    </FormControl>
                                    <FormMessage className='text-red-500'>{
                                        form.getFieldState("newPassword").isTouched && !toogleInput.disable && !form.formState.isValid && PasswordMatchSchema.safeParse(form.watch()).error?.errors.find(e => e.path[0] === "newPassword")?.message}
                                    </FormMessage>
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
                                        <div className='flex items-center border rounded-lg pr-1 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2'>
                                            <Input type={toogleInput.confirmPassword} disabled={toogleInput.disable} className='border-none focus-visible:ring-offset-0 focus-visible:ring-0' {...field} placeholder={t("password_placeholder_text")} />
                                            {
                                                toogleInput.confirmPassword == "password"
                                                    ?
                                                    <div className='cursor-pointer'
                                                        onClick={() => setToogleInput(prev => ({ ...prev, confirmPassword: "text" }))}>
                                                        <Eye />
                                                    </div>
                                                    :
                                                    <div className='cursor-pointer' onClick={() => {
                                                        setToogleInput(prev => ({ ...prev, confirmPassword: "password" }))
                                                    }}><ClosedEye /></div>
                                            }
                                        </div>
                                    </FormControl>
                                    <FormMessage className='text-red-500'>{
                                        form.getFieldState("ConfirmPassword").isTouched && !toogleInput.disable && !form.formState.isValid && PasswordMatchSchema.safeParse(form.watch()).error?.errors.find(e => e.path[0] === "ConfirmPassword")?.message}
                                    </FormMessage>
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={!checkDisable()} className="bg-[#7132F5] w-full text-white text-lg">{t("save_button")}</Button>
                    </form>
                </ Form>
            </div>

        </div>
    )
}