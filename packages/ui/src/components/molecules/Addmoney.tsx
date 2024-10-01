"use client"
import { BANK } from "../../lib/constant"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../atoms/Select"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import { useSession } from "next-auth/react"
import { cn } from "@/src/lib/utils"
import { Input } from '../atoms/Input'
import { Button } from '../atoms/Button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../molecules/Form'
import { addMoneyPayload } from "@repo/forms/addMoneySchema"
import { userFormAddMoney } from "@repo/forms/addMoney"
import { balance as UserBalance } from "@repo/db/type"
import { useToast } from "../molecules/Toaster/use-toast"
import axios from 'axios';
import { useLocale, useTranslations } from 'next-intl';
import { IoInformationCircleOutline } from "react-icons/io5";
import { GetVerified } from "./GetVerified"
import { Loader } from "../atoms/Loader"

interface AddMoneyProps {
    addMoneyAction: (arg: addMoneyPayload, token: string) => Promise<{
        message: string;
        statusCode: number;
    }>
    userBalance: Omit<UserBalance, "id" | "userId">
    sendVerificationEmailAction: (locale: string) => Promise<{
        message: string;
        status: number;
    }>
}

interface IInputError {
    phone_numberError: string | null
}

export const AddMoney: React.FC<AddMoneyProps> = ({ addMoneyAction, userBalance, sendVerificationEmailAction }) => {
    const locale = useLocale()
    const t = useTranslations("AddMoney")
    const { toast } = useToast()
    const router = useRouter()
    const session = useSession()
    const { handleSubmit, control, formState, ...form } = userFormAddMoney()
    const [inputError, setInputError] = useState<IInputError>({ phone_numberError: null })


    const submit = async (payload: addMoneyPayload) => {
        try {
            if (session.status === "unauthenticated" || session.data === null || !session.data.user) {
                return router.push(`/${locale}/login`);
            }

            if (payload.phone_number !== session.data.user.number) {
                setInputError((prev) => ({ ...prev, phone_numberError: "Phone number not matched" }))
                return;
            }
            const token = await axios.post(`${process.env.NEXT_PUBLIC_BANK_API_URL}/token`, { uid: session.data?.user.uid })
            const res = await addMoneyAction(payload, token.data.token);
            if (res.statusCode === 401 || res.statusCode === 404) {
                toast({
                    title: res.message,
                    variant: "destructive",
                })
                return router.push(`/${locale}/login`);
            }
            router.push(`${process.env.NEXT_PUBLIC_BANK_FRONTEND_URL}?token=${token.data.token}`)

        } catch (error) {
            console.log(error);
        }
    }

    return (

        <div className="flex items-center">
            <div className="flex flex-col self-start bg-white dark:bg-card-foreground text-card-foreground dark:text-card p-6 rounded-lg shadow-lg w-[650px]">
                <h2 className="text-xl font-medium mb-4">{t("title")}</h2>

                {
                    session.status === "loading" || !session.data
                        ?
                        <Loader />
                        :
                        session.data?.user?.isVerified
                            ?
                            <>
                                {/* @ts-ignore */}
                                < Form {...form}>
                                    <form
                                        onSubmit={handleSubmit(submit)}
                                        className="max-w-[400px] space-y-8"
                                        autoComplete="false"
                                    >
                                        <FormField
                                            control={control}
                                            name="amount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t("enter_amount")}</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="text-red-600" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={control}
                                            name="phone_number"
                                            render={({ field }) => (
                                                <FormItem className='space-y-0'>
                                                    <FormLabel> {t("phone_number")}</FormLabel>
                                                    <FormControl>
                                                        <Input type="text" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="text-red-500" />
                                                    <span className="text-red-500 font-semibold text-sm">{inputError.phone_numberError}</span>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={control} name="bankURL"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='pl-2'>{t("bank")}</FormLabel>
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <FormControl className="mt-7">
                                                            <SelectTrigger >
                                                                <SelectValue placeholder={t("select_bank_placeholder")} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-white">
                                                            {
                                                                BANK.map((item, idx) => <SelectItem key={idx} value={item.url}>{t(`${item.name}.name`)}</SelectItem>)
                                                            }
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-red-600" />
                                                </FormItem>
                                            )}
                                        />

                                        <Button type="submit"
                                            className={cn("text-white", formState.isSubmitting ? "bg-gray-500" : "bg-black hover:bg-black/80")} disabled={formState.isSubmitting}
                                        >
                                            {t("addMoney_button")}
                                        </Button>
                                    </form>
                                </ Form>
                                <small className="flex text-xs text-slate-500 gap-1 items-center mt-3">
                                    <IoInformationCircleOutline />
                                    Make sure to copy the public ID from account settings.
                                </small>
                            </>
                            :
                            <GetVerified sendVerificationEmailAction={sendVerificationEmailAction} title={"Complete verification to deposit"} />
                }
            </div>
        </div>
    )
}
