"use client"
import { Input } from '../atoms/Input'
import { Button } from '../atoms/Button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../molecules/Form'
import { forgotPasswordPayload } from '@repo/forms/forgotPasswordSchema'
import { useFormForgotPassword } from "@repo/forms/forgotPassword"
import { useToast } from "../molecules/Toaster/use-toast"
import { useRouter } from "next/navigation"


interface forgotPasswordProps {
    forgotPasswordAction: (payload: forgotPasswordPayload) => Promise<{
        message: string;
        status: number;
    }>
}
export const ForgotPasswordForm: React.FC<forgotPasswordProps> = ({ forgotPasswordAction }) => {
    const { toast } = useToast()
    const { handleSubmit, control, ...form } = useFormForgotPassword()
    const submit = async (payload: forgotPasswordPayload) => {
        try {
            const res = await forgotPasswordAction(payload)
            switch (res.status) {
                case 200:
                    toast({
                        title: `${res.message}`,
                        variant: "destructive"
                    })
                    break;
                case 400:
                    toast({
                        title: `${res.message}`,
                        variant: "destructive"
                    })
                    break;
                case 404:
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
                <h1 className='text-2xl font-medium'>Forgot password</h1>
                <p className='text-slate-500 text-sm font-normal mt-3 mb-4'>Enter your email address. If it’s correct, we’ll send you an email with password reset instructions.</p>
                {/* @ts-ignore */}
                < Form {...form}>
                    <form
                        onSubmit={handleSubmit(submit)}
                        className="max-w-[400px] space-y-8"
                        autoComplete="false"
                    >
                        <FormField
                            control={control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="text" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="bg-[#7132F5] w-full text-white text-lg">Send Email</Button>
                    </form>
                </ Form>
            </div>

        </div>
    )
}