"use client"
import { Input } from '../atoms/Input'
import { Button } from '../atoms/Button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../molecules/Form'
import { signUpPayload } from '@repo/forms/signupSchema'
import { userFormSignup } from "@repo/forms/signup"
import { useToast } from "../molecules/Toaster/use-toast"
import { useRouter } from "next/navigation"

interface SignUpFormProps {
    signUpAction: (arg: signUpPayload) => Promise<{
        message: string;
        status: number;
    }>
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ signUpAction }) => {
    const { toast } = useToast()
    const router = useRouter()
    const { handleSubmit, control, ...form } = userFormSignup()
    const submit = async (payload: signUpPayload) => {
        try {
            const res = await signUpAction(payload)
            switch (res.status) {
                case 201:
                    toast({
                        title: res.message,
                        variant: "default"
                    })
                    router.push("/login");
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
                            name="phone_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>* Phone Number (required)</FormLabel>
                                    <FormControl>
                                        <Input type="text" {...field} />
                                    </FormControl>
                                    <FormMessage className='text-red-500' />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className='space-y-0'>
                                    <FormLabel>* Name (required)</FormLabel>
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
                                    <FormLabel>* Email (required)</FormLabel>
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
                                    <FormLabel>* Password (required)</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="e.g. ********" {...field} />
                                    </FormControl>
                                    <FormMessage className='text-red-500' />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="bg-[#7132F5] w-full text-white text-lg">Create Account</Button>
                    </form>
                </ Form>

            </div>

        </div>
    )
}