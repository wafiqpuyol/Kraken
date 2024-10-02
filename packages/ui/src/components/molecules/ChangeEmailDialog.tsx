import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader } from "./Dialog"
import { Form, FormControl, FormLabel, FormField, FormDescription, FormItem, FormMessage } from "../molecules/Form"
import { forgotPasswordPayload } from '@repo/forms/forgotPasswordSchema'
import { useFormForgotPassword } from "@repo/forms/forgotPassword"
import { useFormConfirmMail } from "@repo/forms/confirmMail"
import { confirmMailPayload } from "@repo/forms/confirmMailSchema"
import { useToast } from "../molecules/Toaster/use-toast"
import { account as AccountType } from "@repo/db/type"
import { Button } from "../atoms/Button"
import { Input } from "../atoms/Input"
import { useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { signOut } from "next-auth/react"
import { RedirectingLoader } from "../organisms/RedirectingLoader"


interface ChangeEmailDialogProps {
    children: React.ReactNode
    account: AccountType
    changeEmailAction: (payload: forgotPasswordPayload) => Promise<{
        message: string;
        status: number;
    }>
    updateEmail: (payload: confirmMailPayload) => Promise<{
        message: string;
        status: number;
    }>
    cancelConfirmMail: () => Promise<{
        message: string;
        status: number;
    }>
}
export const ChangeEmailDialog: React.FC<ChangeEmailDialogProps> = ({ children, account, changeEmailAction, updateEmail, cancelConfirmMail }) => {
    const { handleSubmit: handleEmailFormSubmit, control: controlEmail, ...formEmail } = useFormForgotPassword()
    const { handleSubmit: handleConfirmMailFormSubmit, control: controlConfirmMail, ...formConfirmMail } = useFormConfirmMail()
    const { toast } = useToast()
    const locale = useLocale();
    const router = useRouter()
    const [toggleDialog, setToggleDialog] = useState(account.email_update_pending)
    const [isRedirectedToLogin, setIsRedirectedToLogin] = useState(false)
    const [newEmail, setNewEmail] = useState<string>(() =>
        account.email_update ? JSON.parse(account.email_update?.toLocaleString()).email_address : ""
    )


    useEffect(() => {
        if (isRedirectedToLogin) {
            setTimeout(() => router.push(`/${locale}/login`), 5000)
            signOut()
        }
    }, [isRedirectedToLogin])

    const emailSubmit = async (payload: forgotPasswordPayload) => {
        try {
            const res = await changeEmailAction(payload)
            switch (res.status) {
                case 200:
                    toast({
                        title: `${res.message}`,
                        variant: "destructive"
                    })
                    setNewEmail(payload.email)
                    setToggleDialog(true)
                    break;
                case 400:
                    toast({
                        title: `${res.message}`,
                        variant: "destructive"
                    })
                    setTimeout(() => router.push(`/${locale}/login`), 4000)
                    break;

                case 401:
                    toast({
                        title: `${res.message}`,
                        variant: "destructive"
                    })
                    setTimeout(() => router.push(`/${locale}/login`), 4000)
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
        formEmail.reset()
    }

    const handleUpdateEmail = async (payload: confirmMailPayload) => {
        try {
            const res = await updateEmail(payload)
            switch (res.status) {
                case 200:
                    toast({
                        title: `${res.message}`,
                        variant: "destructive"
                    })
                    setIsRedirectedToLogin(true)
                    break;
                case 400:
                    toast({
                        title: `${res.message}`,
                        variant: "destructive"
                    })
                    setTimeout(() => router.push(`/${locale}/login`), 4000)
                    break;

                case 401:
                    toast({
                        title: `${res.message}`,
                        variant: "destructive"
                    })
                    setTimeout(() => router.push(`/${locale}/login`), 4000)
                    break;
                case 500:
                    toast({
                        title: `${res.message}`,
                        variant: "destructive"
                    })
            }
        } catch (error: any) {
            toast({
                title: `${error.message}`,
                variant: "destructive"
            })
        }
        formConfirmMail.reset()
    }

    const handleCancelBtn = async () => {
        try {
            const res = await cancelConfirmMail()
            switch (res.status) {
                case 200:
                    toast({
                        title: `${res.message}`,
                        variant: "destructive"
                    })
                    window.location.reload()
                    formConfirmMail.reset()
                    break;
                case 401:
                    toast({
                        title: `${res.message}`,
                        variant: "destructive"
                    })
                    setTimeout(() => router.push(`/${locale}/login`), 4000)
                    break;
                case 500:
                    toast({
                        title: `${res.message}`,
                        variant: "destructive"
                    })
            }
        } catch (error: any) {
            console.log(error);
            toast({
                title: `${error.message}`,
                variant: "destructive"
            })
        }
        formConfirmMail.reset()
    }

    return (
        isRedirectedToLogin
            ?
            <RedirectingLoader />
            :
            <Dialog onOpenChange={() => {
                formEmail.reset()
                formConfirmMail.reset()
            }}>
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px] bg-white" onInteractOutside={(e) => {
                    e.preventDefault();
                }}>
                    <DialogHeader>
                        <DialogTitle className="text-xl mb-3">Change Email</DialogTitle>
                    </DialogHeader>

                    {
                        !toggleDialog
                            ?
                            /* @ts-ignore */
                            < Form {...formEmail}>
                                <form
                                    onSubmit={handleEmailFormSubmit(emailSubmit)}
                                    className="max-w-[400px] space-y-8"
                                    autoComplete="false"
                                >
                                    <FormField
                                        control={controlEmail}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormDescription className="text-sm text-slate-500 mb-4">Enter the new email you'd like to use on your account.We'll ask you to verify it to make the change</FormDescription>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input type="text" {...field} placeholder="Enter new email" />
                                                </FormControl>
                                                <FormMessage className='text-red-500' />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="bg-[#7132F5] w-full text-white text-lg">Continue</Button>
                                </form>
                            </ Form>
                            :
                            /* @ts-ignore */
                            < Form {...formConfirmMail}>
                                <form
                                    onSubmit={handleConfirmMailFormSubmit(handleUpdateEmail)}
                                    className="max-w-[400px] space-y-8"
                                >
                                    <FormField
                                        control={controlConfirmMail}
                                        name="authorization_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <p className="font-medium text-slate-600 mb-4">We sent an authorization code to your current email. Enter it here.</p>
                                                <FormControl>
                                                    <Input type="text" {...field} placeholder="Authorization code" />
                                                </FormControl>
                                                <FormMessage className='text-red-500' />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={controlConfirmMail}
                                        name="confirmation_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <p className="font-medium text-slate-600 mb-4">We also sent a confirmation code to your new email - <span className="font-bold text-slate-800">{newEmail}</span>. Enter it here.</p>
                                                <FormControl>
                                                    <Input type="text" {...field} placeholder="Confirmation code" />
                                                </FormControl>
                                                <FormMessage className='text-red-500' />
                                            </FormItem>
                                        )}
                                    />
                                    <p className="text-slate-800 mb-4 font-medium">If you didn't receive these emails, check your junk/spam folder or you can resend emails.</p>
                                    <div className="flex gap-x-4">
                                        <Button type="button" onClick={() => handleCancelBtn()} name="cancel" className="rounded-2xl bg-[#7132F5] w-full text-white text-lg">Cancel</Button>
                                        <Button type="submit" name="confirm" className="rounded-2xl bg-[#7132F5] w-full text-white text-lg">Confirm new email</Button>
                                    </div>
                                </form>
                            </ Form>
                    }
                </DialogContent>
            </Dialog>
    )
}