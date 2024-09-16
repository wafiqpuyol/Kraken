"use client"
import { Input } from '../atoms/Input'
import { Button } from '../atoms/Button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../molecules/Form'
import { useFormChangePassword } from "@repo/forms/changePassword"
import { useToast } from "../molecules/Toaster/use-toast"
import { useRouter } from "next/navigation"
import { changePasswordPayload } from "@repo/forms/changePasswordSchema"

interface ChangePasswordFormProps {
    changePasswordAction: (payload: changePasswordPayload) => Promise<{
        message: string | undefined;
        status: number;
    }>
}
export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ changePasswordAction }) => {
    const router = useRouter()
    const { toast } = useToast()
    const { handleSubmit, control, ...form } = useFormChangePassword()

    const submit = async (payload: changePasswordPayload) => {
        console.log(payload);
        try {
            const res = await changePasswordAction(payload)
            console.log(res);

            switch (res.status) {
                case 201:
                    toast({
                        title: `${res.message}`,
                        variant: "default"
                    })
                    router.push("/dashboard/home");
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
            <div className="flex flex-col bg-card rounded-lg shadow-lg p-6 max-w-md w-full">
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
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl>
                                        <Input type="text" {...field} placeholder="e.g. ********" />
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
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="e.g. ********" {...field} />
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
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="e.g. ********" {...field} />
                                    </FormControl>
                                    <FormMessage className='text-red-500' />
                                </FormItem>
                            )}
                        />
                        {!!form?.formState?.errors?.ConfirmPassword?.message && (
                            <FormMessage>{form.formState.errors.ConfirmPassword.message}</FormMessage>
                        )}
                        <Button type="submit" className="bg-[#7132F5] w-full text-white text-lg">Continue</Button>
                    </form>
                </ Form>

            </div>

        </div>
    )
}