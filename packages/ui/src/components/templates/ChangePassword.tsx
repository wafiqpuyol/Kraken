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
import { Eye, ClosedEye } from "../../icons"
import { responseHandler } from "../../lib/utils"

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
    const [toogleInput, setToogleInput] = useState({
        currentPassword: "password",
        newPassword: "password",
        confirmPassword: "password",
        disable: false
    })
    const t = useTranslations("ChangePasswordForm")

    const checkDisable = () => {
        if (!(ChangePasswordSchema.safeParse(form.watch()).success)) return true
        return isSubmissionSuccessful
    }

    const submit = async (payload: changePasswordPayload) => {
        try {
            const res = await changePasswordAction(payload)
            responseHandler(res)
            setIsSubmissionSuccessful(true)
            switch (res.status) {
                case 201:
                    form.reset({ "ConfirmPassword": "", "currentPassword": "", "newPassword": "" })
                    form.clearErrors()
                    setToogleInput(prev => ({ ...prev, disable: true }))
                    break;
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
                                    <div className='flex items-center border rounded-lg pr-1 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2'>
                                        <Input type={toogleInput.currentPassword} disabled={toogleInput.disable}
                                            className='border-none focus-visible:ring-offset-0 focus-visible:ring-0'  {...field}
                                            placeholder={t("password_placeholder_text")}
                                            onChange={(e) => {
                                                field.onChange(e.target.value)
                                                setIsSubmissionSuccessful(false)
                                            }}
                                        />
                                        {
                                            toogleInput.currentPassword == "password"
                                                ?
                                                <div className='cursor-pointer'
                                                    onClick={() => setToogleInput(prev => ({ ...prev, currentPassword: "text" }))}>
                                                    <Eye />
                                                </div>
                                                :
                                                <div className='cursor-pointer' onClick={() => {
                                                    setToogleInput(prev => ({ ...prev, currentPassword: "password" }))
                                                }}><ClosedEye /></div>
                                        }
                                    </div>
                                </FormControl>
                                <FormMessage className='text-red-500'>
                                    {
                                        form.getFieldState("currentPassword").isTouched && !toogleInput.disable
                                        && ChangePasswordSchema.safeParse(form.watch()).error?.errors.find(e => e.path[0] === "currentPassword")?.message
                                    }
                                </FormMessage>
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
                                    <div className='flex items-center border rounded-lg pr-1 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2'>
                                        <Input type={toogleInput.newPassword} disabled={toogleInput.disable}
                                            className='border-none focus-visible:ring-offset-0 focus-visible:ring-0' placeholder={t("password_placeholder_text")}
                                            {...field}
                                        />
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
                                <FormMessage className='text-red-500'>
                                    {form.getFieldState("newPassword").isTouched && !toogleInput.disable && !form.formState.isValid
                                        && ChangePasswordSchema.safeParse(form.watch()).error?.errors.find(e => e.path[0] === "newPassword")?.message
                                    }
                                </FormMessage>
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
                                    <div className='flex items-center border rounded-lg pr-1 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2'>
                                        <Input type={toogleInput.confirmPassword} disabled={toogleInput.disable} className='border-none focus-visible:ring-offset-0 focus-visible:ring-0' placeholder={t("password_placeholder_text")} {...field} />
                                        {
                                            toogleInput.confirmPassword == "password"
                                                ?
                                                <div className='cursor-pointer'
                                                    onClick={() => setToogleInput(prev => ({ ...prev, confirmPassword: "text" }))}>
                                                    <Eye />
                                                </div>
                                                :
                                                <div className='cursor-pointer'
                                                    onClick={() => setToogleInput(prev => ({ ...prev, confirmPassword: "password" }))}>
                                                    <ClosedEye />
                                                </div>
                                        }
                                    </div>
                                </FormControl>
                                <FormMessage className='text-red-500'>
                                    {form.getFieldState("ConfirmPassword").isTouched && !toogleInput.disable && !form.formState.isValid
                                        && ChangePasswordSchema.safeParse(form.watch()).error?.errors.find(e => e.path[0] === "ConfirmPassword")?.message
                                    }
                                </FormMessage>
                            </FormItem>
                        )}
                    />

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