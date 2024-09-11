"use client"
import { Input } from '../atoms/Input'
import { Button } from '../atoms/Button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../molecules/Form'
import { loginPayload } from '@repo/forms/loginSchema'
import { userFormSignIn } from "@repo/forms/signin"
import { useToast } from "../molecules/Toaster/use-toast"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export const SignInForm = () => {
    const router = useRouter()
    const { toast } = useToast()
    const { handleSubmit, control, ...form } = userFormSignIn()
    const submit = async (payload: loginPayload) => {
        try {
            signIn("credentials", { ...payload, redirect: false }).then((response) => {
                if (!response?.ok || response.error) {
                    return toast({
                        title: response.error || "Email or Password is incorrect",
                        variant: "destructive"
                    })
                }
            })
            toast({
                title: `Login Successful`,
                variant: "default"
            })
            router.push("/dashboard/home");
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
                                    <FormMessage />
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="bg-[#7132F5] w-full text-white text-lg">Continue</Button>
                    </form>
                </ Form>

            </div>

        </div>
    )
}