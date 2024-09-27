"use client"
import { Input } from '../atoms/Input'
import { Button } from '../atoms/Button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../molecules/Form'
import { useFormChangePassword } from "@repo/forms/changePassword"
import { useToast } from "../molecules/Toaster/use-toast"
import { changePasswordPayload } from "@repo/forms/changePasswordSchema"
import { useState } from 'react'
import { ChangePasswordSchema } from "@repo/forms/changePasswordSchema"
import { DialogClose } from "../molecules/Dialog"
import { useTranslations } from "next-intl"

interface ChangePasswordFormProps {
    changePasswordAction: (payload: changePasswordPayload) => Promise<{
        message: string | undefined;
        status: number;
    }>
}
export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ changePasswordAction }) => {
    const { toast } = useToast()
    const { handleSubmit, control, ...form } = useFormChangePassword()
    const [isSubmissionSuccessful, setIsSubmissionSuccessful] = useState(false)
    const t = useTranslations("ChangePasswordForm")

    const checkDisable = () => {
        if (!(ChangePasswordSchema.safeParse(form.watch()).success)) return true
        return isSubmissionSuccessful
    }

    const submit = async (payload: changePasswordPayload) => {
        try {
            const res = await changePasswordAction(payload)
            console.log(res);

            switch (res.status) {
                case 201:
                    toast({
                        title: `${res.message}`,
                        variant: "default"
                    })
                    setIsSubmissionSuccessful(true)
                    break;
                case 400:
                    toast({
                        title: `${res.message}`,
                        variant: "destructive"
                    })
                    setIsSubmissionSuccessful(true)
                    break;
                case 401:
                    toast({
                        title: `${res.message}`,
                        variant: "destructive"
                    })
                    setIsSubmissionSuccessful(true)
                    break;
                case 500:
                    setIsSubmissionSuccessful(true)
                    toast({
                        title: `${res.message}`,
                        variant: "destructive"
                    })
            }
        } catch (err: any) {
            setIsSubmissionSuccessful(true)
            toast({
                title: `${err.message}`,
                variant: "destructive"
            })
        }
    }
    return (
        <div className="flex flex-col bg-card rounded-lg p-y-6 max-w-md w-full">
            {/* @ts-ignore */}
            < Form {...form}>
                <form
                    onSubmit={handleSubmit(submit)}
                    className="max-w-[400px] space-y-8"
                    autoComplete="false"
                >
                    <FormField
                        control={control}
                        name="currentPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='text-slate-600'>{t("current_password")}</FormLabel>
                                <FormControl>
                                    <Input type="text" {...field} placeholder={t("password_placeholder_text")} onChange={(e) => {
                                        field.onChange(e.target.value)
                                        setIsSubmissionSuccessful(false)
                                    }} />
                                </FormControl>
                                <FormMessage className='text-red-500' />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='text-slate-600'>{t("new_password")}</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder={t("password_placeholder_text")} {...field} />
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
                                <FormLabel className='text-slate-600'>{t("confirm_new_password")}</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder={t("password_placeholder_text")} {...field} />
                                </FormControl>
                                <FormMessage className='text-red-500' />
                            </FormItem>
                        )}
                    />
                    {!!form?.formState?.errors?.ConfirmPassword?.message && (
                        <FormMessage>{form.formState.errors.ConfirmPassword.message}</FormMessage>
                    )}
                    <div className="flex gap-4 w-full">
                        <DialogClose className='w-full'>
                            <Button disabled={!checkDisable()} className="bg-purple-600 w-full text-white rounded-xl">
                                {t("cancel_button")}
                            </Button>
                        </DialogClose>
                        <Button disabled={checkDisable()} type="submit" className="bg-purple-600 text-white rounded-xl py-2 font-medium w-full">
                            {t("save_button")}
                        </Button>
                    </div>
                </form>
            </ Form>
        </div>
    )
}