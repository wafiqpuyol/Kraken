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
import { useLocale, useTranslations } from 'next-intl';
import { TransactionHistory } from "../organisms/TransactionHistory"
import { p2ptransfer } from "@repo/db/type"
import { useState } from "react"
import { Loader } from "../atoms/Loader"
import { GetVerified } from "../molecules/GetVerified"

interface SendMoneyProps {
    sendMoneyAction: (arg: sendMoneyPayload) => Promise<{
        message: string | undefined;
        status: number;
        transaction?: p2ptransfer | undefined;
    }>
    p2pTransactionHistories: p2ptransfer[] | []
    sendVerificationEmailAction: (locale: string) => Promise<{
        message: string;
        status: number;
    }>
}

export const SendMoneyPage: React.FC<SendMoneyProps> = ({ sendMoneyAction, p2pTransactionHistories, sendVerificationEmailAction }) => {
    const t = useTranslations("SendMoneyPage")
    const locale = useLocale()
    const { handleSubmit, control, formState, ...form } = userFormSendMoney()
    const router = useRouter()
    const session = useSession()
    const { toast } = useToast()
    const [allTransactionHistory, setAllTransactionHistory] = useState<p2ptransfer[] | []>(p2pTransactionHistories)
    const submit = async (payload: sendMoneyPayload) => {
        try {
            if (!session.data?.user) {
                router.push(`/${locale}/login`)
            }
            const res = await sendMoneyAction(payload)

            switch (res.status) {
                case 200:
                    toast({
                        title: res.message,
                        variant: "default"
                    })
                    setAllTransactionHistory((prev) => {
                        const updatedArr = [...prev]
                        updatedArr.unshift(res.transaction!)
                        return updatedArr
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

        <div className="min-h-screen flex items-start justify-center px-4 w-screen mt-20 gap-x-28">
            <Card className="w-full max-w-md bg-white">
                <CardHeader>
                    <CardTitle>{t("title")}</CardTitle>
                    <CardDescription className='text-slate-500'>{t("desc")}</CardDescription>
                </CardHeader>
                <CardContent>
                    {
                        session.status === "loading" || !session.data
                            ?
                            <Loader />
                            :
                            session.data?.user?.isVerified
                                ?
                                // @ts-ignore
                                <Form {...form}>
                                    <form onSubmit={handleSubmit(submit)}>

                                        <FormField
                                            control={control}
                                            name="phone_number"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t("recipient_number")}</FormLabel>
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
                                                    <FormLabel>{t("amount")}</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="text-red-600" />
                                                </FormItem>
                                            )}
                                        />

                                        <Button type="submit" className="w-full mt-6 bg-purple-600 text-white" disabled={formState.isSubmitting}>
                                            {formState.isSubmitting ? t("sending") : t('send_money')}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </form>
                                </Form>
                                :
                                <GetVerified sendVerificationEmailAction={sendVerificationEmailAction} title="Complete verification to enable p2p money transfer" />
                        /* @ts-ignore */
                    }
                </CardContent>
                <CardFooter className="flex flex-col items-start">
                </CardFooter>
            </Card>

            <TransactionHistory p2pTransactionHistories={allTransactionHistory} />
        </div >
    )
}