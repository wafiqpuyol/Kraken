'use client'

import { Button } from "../atoms/Button"
import { Input } from "../atoms/Input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../atoms/Card"
import { ArrowRight } from "lucide-react"
import { sendMoneyPayload } from "@repo/forms/sendMoneySchema"
import { userFormSendMoney } from "@repo/forms/sendMoney"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../molecules/Form'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "../molecules/Toaster/use-toast"


interface SendMoneyProps {
    sendMoneyAction: (arg: sendMoneyPayload) => Promise<{
        message: string;
        status: number;
        field?: undefined;
    } | {
        message: string | undefined;
        status: number;
        field: string;
    }>
}

export const SendMoneyPage: React.FC<SendMoneyProps> = ({ sendMoneyAction }) => {
    const { handleSubmit, control, formState, ...form } = userFormSendMoney()
    const router = useRouter()
    const session = useSession()
    const { toast } = useToast()
    console.log(session);
    const submit = async (payload: sendMoneyPayload) => {
        try {
            if (!session.data?.user) {
                router.push("/login")
            }
            const res = await sendMoneyAction(payload)

            switch (res.status) {
                case 200:
                    toast({
                        title: res.message,
                        variant: "default"
                    })
                    form.reset({ amount: "", phone_number: "" })
                    break;

                //TODO: handle 400

                case 401:
                    toast({
                        title: res.message,
                        variant: "destructive"
                    })
                    break;

                case 404:
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

        } catch (error: any) {
            toast({
                title: error.message,
                variant: "default"
            })
            form.reset({ amount: "", phone_number: "" })
        }

    }

    return (
        <div className="min-h-screen flex items-start justify-center p-4 w-full mt-20">
            <Card className="w-full max-w-md bg-white">
                <CardHeader>
                    <CardTitle>Send Money</CardTitle>
                    <CardDescription className='text-slate-500'>Transfer funds to another user securely.</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* @ts-ignore */}
                    <Form {...form}>
                        <form onSubmit={handleSubmit(submit)}>

                            <FormField
                                control={control}
                                name="phone_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Recipient's Number</FormLabel>
                                        <FormControl>
                                            <Input type="tel" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-red-600" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-red-600" />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full mt-6 bg-black text-white" disabled={formState.isSubmitting}>
                                {formState.isSubmitting ? 'Sending...' : 'Send Money'}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-start">
                </CardFooter>
            </Card>
        </div>
    )
}