"use client"
import { BANK } from "../../lib/constant"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../atoms/Select"
import { ChangeEvent, useState } from "react"
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
import axios, { AxiosError } from 'axios';
import { useLocale, useTranslations } from 'next-intl';
import { IoInformationCircleOutline } from "react-icons/io5";
import { GetVerified } from "./GetVerified"
import { Loader } from "../atoms/Loader"
import { LOCK_AMOUNT, WITHDRAW_LIMIT } from "../../lib/constant"
import { BiSolidErrorAlt } from "react-icons/bi";
import { formatAmount } from "../../lib/utils"
import { useModal } from "../molecules/ModalProvider"

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
    lockAmountError: string | null
    amountError: string | null
}

export const AddMoney: React.FC<AddMoneyProps> = ({ addMoneyAction, userBalance, sendVerificationEmailAction }) => {
    const locale = useLocale()
    const t = useTranslations("AddMoney")
    const { toast } = useToast()
    const { setOpen } = useModal()
    const router = useRouter()
    const session = useSession()
    const { handleSubmit, control, formState, ...form } = userFormAddMoney()
    const [inputError, setInputError] = useState<IInputError>({ phone_numberError: null, lockAmountError: null, amountError: null })
    const [isLockInputDisable, setIsLockInputDisable] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [isBtnDisable, setIsBtnDisable] = useState(false)

    // console.log(session);
    // console.log("Lock value ===>", form.getValues("lock"));
    // console.log(inputError);
    // console.log(formState.isValid);
    // console.log("*************", userBalance);

    const handleAmountChange = (e: ChangeEvent<HTMLInputElement>, fieldOnchange: (...event: any[]) => void) => {
        const value = formatAmount(e.target.value, 0)
        const withDrawCurrency = WITHDRAW_LIMIT[userBalance.currency];
        form.clearErrors("amount")
        setInputError((prev) => ({ ...prev, amountError: null }))
        fieldOnchange(value);
        console.log(value);
        if (isNaN(parseInt(value))) {
            setInputError((prev) => ({ ...prev, amountError: `Amount cannot be less than ${withDrawCurrency.perTransactionLimit.min}${withDrawCurrency.symbol}` }))
        }
        if (parseInt(value) < parseInt(withDrawCurrency.perTransactionLimit.min)) {
            setInputError((prev) => ({ ...prev, amountError: `Amount cannot be less than ${withDrawCurrency.perTransactionLimit.min}${withDrawCurrency.symbol}` }))

        }
        if (parseInt(value) > parseInt(withDrawCurrency.perTransactionLimit.max)) {
            setInputError((prev) => ({ ...prev, amountError: `Amount cannot be greater than ${withDrawCurrency.perTransactionLimit.max}${withDrawCurrency.symbol}` }))
            return
        }
    }
    const handleLockAmountChange = (e: ChangeEvent<HTMLInputElement>, fieldOnchange: (...event: any[]) => void) => {
        const value = formatAmount(e.target.value, 0);
        form.clearErrors("lock")
        setInputError((prev) => ({ ...prev, lockAmountError: null }))
        fieldOnchange(value);
        if (isNaN(parseInt(value))) {
            setInputError((prev) => ({ ...prev, lockAmountError: `Minimum amount should be ${LOCK_AMOUNT.min}` }))
        }
        if (
            parseInt(value) >= parseInt(LOCK_AMOUNT.min)
            &&
            parseInt(value) <= parseInt(LOCK_AMOUNT.max)
            &&
            parseInt(value) > (userBalance.amount / 100)
        ) {
            setInputError((prev) => ({ ...prev, lockAmountError: "You don't have sufficient balance to lock" }))
            return;
        }
        if (parseInt(value) < parseInt(LOCK_AMOUNT.min)) {
            setInputError((prev) => ({ ...prev, lockAmountError: `Lock Amount cannot be less than ${LOCK_AMOUNT.min}` }))
            return
        }
        if (parseInt(value) > parseInt(LOCK_AMOUNT.max)) {
            setInputError((prev) => ({ ...prev, lockAmountError: `Lock Amount cannot be greater than ${LOCK_AMOUNT.max}` }))
            return
        }
        if (parseInt(value) === (userBalance.amount / 100)) {
            setInputError((prev) => ({ ...prev, lockAmountError: "Lock amount cannot be equal to your current balance" }))
            return
        }
    }

    const submit = async (payload: addMoneyPayload) => {
        setIsLoading(true)
        if (!isLockInputDisable && typeof form.getValues("lock") === 'undefined') {
            setInputError((prev) => ({ ...prev, lockAmountError: "Please specify an amount" }))
            return
        } else {
            payload.lock = form.getValues("lock")
        }
        if (isLockInputDisable) {
            payload.lock = "0"
        }
        try {
            if (session.status === "unauthenticated" || session.data === null || !session.data.user) {
                return router.push(`/${locale}/login`);
            }

            if (payload.phone_number !== session.data.user.number) {
                setInputError((prev) => ({ ...prev, phone_numberError: "Phone number not matched" }))
                return;
            }

            // const isBankAvailable = await axios.get(`${process.env.NEXT_PUBLIC_BANK_FRONTEND_URL}/`)
            // console.log("isBankAvailable==>", isBankAvailable);
            const token = await axios.post(`${process.env.NEXT_PUBLIC_BANK_API_URL}/token`, { uid: session.data?.user.uid })
            const res = await addMoneyAction(payload, token.data.token);
            console.log(res);
            if (res.statusCode === 401 || res.statusCode === 404) {
                toast({
                    title: res.message,
                    variant: "destructive",
                    className: "bg-red-500 text-white font-medium",
                })
                return router.push(`/${locale}/login`);
            }
            if (res.statusCode === 400) {
                toast({
                    title: res.message,
                    variant: "destructive",
                    className: "bg-red-500 text-white font-medium",
                })
            }
            if (res.statusCode === 500) {
                throw new Error(res.message)
            }
            res.statusCode === 200 ? setIsBtnDisable(true) : setIsBtnDisable(false)
            router.push(`${process.env.NEXT_PUBLIC_BANK_FRONTEND_URL}?token=${token.data.token}`)

        } catch (error: any) {
            console.log("Indie --->", error)
            if (error.message === "Network Error" && error.config?.url === `${process.env.NEXT_PUBLIC_BANK_FRONTEND_URL}`) {
                toast({
                    title: "Failed to redirect to Bank page",
                    description: "Sorry for your inconvenience. Currently Bank website unavailable. Please try again later",
                    className: "bg-red-500 text-white font-medium",
                    variant: "destructive",
                })
                return
            }
            if (error instanceof AxiosError) {
                if (error.message === "Network Error" && error.config?.url === `${process.env.NEXT_PUBLIC_BANK_API_URL}/token`) {
                    toast({
                        title: "Bank Server is down. Please again later",
                        variant: "destructive",
                        className: "bg-red-500 text-white font-medium",
                    })
                    return
                }
            }
            toast({
                title: error.message || "Something went wrong while adding money",
                className: "bg-red-500 text-white font-medium",
                variant: "destructive",
            })
            setIsLoading(false)
        }
    }
    return (
        <div className="flex items-center relative">
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
                                                        <Input type="number" {...field} onChange={(e) => handleAmountChange(e, field.onChange)} />
                                                    </FormControl>
                                                    {!inputError.amountError && <FormMessage className="text-red-500" />}
                                                    {inputError.amountError && <span className="flex gap-1 py-1 items-center text-red-500 font-semibold text-sm">
                                                        <BiSolidErrorAlt />
                                                        <span>{inputError.amountError}</span>
                                                    </span>}
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
                                                        <Input type="text" {...field} onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                            if (e.target.value.length === 0) {
                                                                setInputError((prev) => ({ ...prev, phone_numberError: null }))
                                                            }
                                                            field.onChange(e.target.value)
                                                            if (e.target.value !== session?.data?.user.number) {
                                                                setInputError((prev) => ({ ...prev, phone_numberError: "Phone number not matched" }))
                                                                return;
                                                            }
                                                            setInputError((prev) => ({ ...prev, phone_numberError: null }))
                                                        }} />
                                                    </FormControl>
                                                    {
                                                        inputError.phone_numberError &&
                                                        <div className="flex gap-1 py-1 items-center text-red-500">
                                                            <BiSolidErrorAlt />
                                                            <span>{inputError.phone_numberError}</span>
                                                        </div>
                                                    }
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={control}
                                            name="lock"
                                            render={({ field }) => (
                                                <FormItem className='space-y-0'>
                                                    <FormLabel> {"Lock Amount"}</FormLabel>
                                                    <FormControl>
                                                        <div>
                                                            <Input disabled={isLockInputDisable} type="number" {...field} onChange={(e) => handleLockAmountChange(e, field.onChange)} />
                                                            <div>
                                                                <input className="cursor-pointer" type="checkbox" checked={isLockInputDisable}
                                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                                        console.log("Checked --->", e.currentTarget.checked)
                                                                        if (e.currentTarget.checked) {
                                                                            console.log("Checked has changed");
                                                                            setIsLockInputDisable(true)
                                                                            form.setValue("lock", "undefined")
                                                                            setInputError((prev) => ({ ...prev, lockAmountError: null }));
                                                                            form.clearErrors("amount")
                                                                        }
                                                                        if (!e.currentTarget.checked) {
                                                                            console.log("Unchecked has changed");
                                                                            form.resetField("lock")
                                                                            setIsLockInputDisable(false)
                                                                        }
                                                                    }} />
                                                                <span>Do not Lock</span>
                                                            </div>
                                                        </div>
                                                    </FormControl>
                                                    {
                                                        inputError.lockAmountError &&
                                                        <div className="flex gap-1 py-1 items-center text-red-500 font-semibold text-sm">
                                                            <BiSolidErrorAlt />
                                                            <span>{inputError.lockAmountError}</span>
                                                        </div>
                                                    }
                                                    {<div className="flex items-center text-[15px] text-slate-500 font-medium pt-1">
                                                        <IoInformationCircleOutline />
                                                        <small>Lock funds  for savings, emergencies & long-term goals.</small>
                                                    </div>}
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
                                            disabled={formState.isSubmitting ||
                                                !((isLockInputDisable ? isLockInputDisable : inputError.lockAmountError === null) && (inputError.amountError === null) && (inputError.phone_numberError === null))
                                                ||
                                                !formState.isValid
                                                || isBtnDisable
                                            }

                                            className={cn("text-white", formState.isSubmitting ? "bg-gray-500" : "bg-black hover:bg-black/80")}
                                        >

                                            {isLoading ? "Adding" : "Add Money"}
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