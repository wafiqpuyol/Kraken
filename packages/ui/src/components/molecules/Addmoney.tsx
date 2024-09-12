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
import { Balance as UserBalance } from "@repo/db/type"
import { useToast } from "@repo/ui/useToast"
import axios from 'axios';


interface AddMoneyProps {
    addMoneyAction: (arg: addMoneyPayload, token: string) => Promise<{
        message: string;
        statusCode: number;
    }>
    userBalance: Omit<UserBalance, "id" | "userId">
}

interface IInputError {
    phone_numberError: string | null
}

export const AddMoney: React.FC<AddMoneyProps> = ({ addMoneyAction, userBalance }) => {
    const { toast } = useToast()
    const router = useRouter()
    const session = useSession()
    const { handleSubmit, control, formState, ...form } = userFormAddMoney()
    const [inputError, setInputError] = useState<IInputError>({ phone_numberError: null })

    const submit = async (payload: addMoneyPayload) => {
        try {
            if (session.status === "unauthenticated" || session.data === null || !session.data.user) {
                return router.push("/login");
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
                return router.push("/login");
            }
            router.push(`${process.env.NEXT_PUBLIC_BANK_FRONTEND_URL}?token=${token.data.token}`)

        } catch (error) {
            console.log(error);
        }

    }

    return (

        <div className="flex items-center">
            <div className="bg-white dark:bg-card-foreground text-card-foreground dark:text-card p-6 rounded-lg shadow-lg w-[700px]">
                <h2 className="text-xl font-medium mb-4">Deposit</h2>

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
                                    <FormLabel>Enter Amount</FormLabel>
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
                                    <FormLabel> Enter Your Phone Number</FormLabel>
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
                                    <FormLabel className='pl-2'>Bank</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <FormControl className="mt-7">
                                            <SelectTrigger >
                                                <SelectValue placeholder="Please choose a bank" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-white">
                                            {
                                                BANK.map((item, idx) => <SelectItem key={idx} value={item.url}>{item.name}</SelectItem>)
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
                            Add Money
                        </Button>
                    </form>
                </ Form>

            </div>
        </div>
    )
}
