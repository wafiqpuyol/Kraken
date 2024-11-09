"use client"
import { BANK } from "../../lib/constant"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../atoms/Select"
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react"
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
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "../atoms/InputOTP"
import { Dialog, DialogContent } from "./Dialog"
import { Session } from "next-auth"
import { responseHandler } from "../../lib/utils"

interface AddMoneyProps {
    addMoneyAction: (arg: addMoneyPayload, token: string) => Promise<{
        message: string;
        status: number;
    }>
    userBalance: Omit<UserBalance, "id" | "userId">
    sendVerificationEmailAction: (locale: string) => Promise<{
        message: string;
        status: number;
    }>
    activate2fa: (otp: string, twoFAType: "signInTwoFA" | "withDrawTwoFA") => Promise<{
        message: string;
        status: number;
    }>
    disable2fa: (twoFAType: "signInTwoFA" | "withDrawTwoFA") => Promise<void>
}

interface IInputError {
    phone_numberError: string | null
    lockAmountError: string | null
    amountError: string | null
}
interface Enable2FADialogProps {
    title: string
    twoFaType: "SignIn" | "WithDraw"
    enable2FAPrompt?: boolean
    setEnable2FAPrompt?: Dispatch<SetStateAction<boolean>>
    isWithDraw2FAActive?: boolean
    setIsWithDraw2FAActive?: Dispatch<SetStateAction<boolean>>
}

interface WithDrawOTPDialogProps {
    session: Session,
    addMoneyAction: AddMoneyProps["addMoneyAction"],
    payload: addMoneyPayload | null,
    setEnableWithDraw2FAOTP: Dispatch<SetStateAction<boolean>>,
    enableWithDraw2FAOTP: boolean,
    isLoading: boolean,
    setIsLoading: Dispatch<SetStateAction<boolean>>,
    activate2fa: AddMoneyProps["activate2fa"]
}

export const AddMoney: React.FC<AddMoneyProps> = ({ disable2fa, addMoneyAction, userBalance, sendVerificationEmailAction, activate2fa, onRampTransactionLimitDetail }) => {
    const locale = useLocale()
    const t = useTranslations("AddMoney")
    const router = useRouter()
    const session = useSession()
    const { handleSubmit, control, formState, ...form } = userFormAddMoney()
    const [inputError, setInputError] = useState<IInputError>({ phone_numberError: null, lockAmountError: null, amountError: null })
    const [isLoading, setIsLoading] = useState(false)
    const [isBtnDisable, setIsBtnDisable] = useState(false)
    const [isLockInputDisable, setIsLockInputDisable] = useState(true)
    const [enable2FAPrompt, setEnable2FAPrompt] = useState(false)
    const [isWithDraw2FAActive, setIsWithDraw2FAActive] = useState(false)
    const [enableWithDraw2FAOTP, setEnableWithDraw2FAOTP] = useState(false)
    const [payloadData, setPayloadData] = useState<addMoneyPayload | null>(null)

    useEffect(() => {
        if (session.data?.user && session.data?.user.isWithDrawOTPVerified) {
            (async () => {
                disable2fa("withDrawTwoFA")
            })()
            window.location.reload()
        }
    }, [session?.data?.user])

    const handleAmountChange = (e: ChangeEvent<HTMLInputElement>, fieldOnchange: (...event: any[]) => void) => {
        const value = formatAmount(e.target.value, 0)
        const withDrawCurrency = WITHDRAW_LIMIT[userBalance.currency];
        form.clearErrors("amount")
        setInputError((prev) => ({ ...prev, amountError: null }))
        fieldOnchange(value);
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
        setPayloadData(payload)
        if (session.status === "unauthenticated" || session.data === null || !session.data.user) {
            return router.push(`/${locale}/login`);
        }
        if (!isLockInputDisable && typeof form.getValues("lock") === 'undefined') {
            setInputError((prev) => ({ ...prev, lockAmountError: "Please specify an amount" }))
            return
        } else {
            payload.lock = form.getValues("lock")
        }
        if (isLockInputDisable) {
            payload.lock = "0"
        }

        if (payload.phone_number !== session.data.user.number) {
            setInputError((prev) => ({ ...prev, phone_numberError: "Phone number not matched" }))
            return;
        }
        if (!session.data.user.isOtpVerified) {
            setEnable2FAPrompt(true)
            return
        }

        if (!session.data.user.isWithDrawTwoFAActivated) {
            setIsWithDraw2FAActive(true)
            return
        }

        if (!session.data.user.isWithDrawOTPVerified) {
            setEnableWithDraw2FAOTP(true)
            return
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
                                                            if (e.target.value !== session?.data?.user?.number) {
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
                                                                        if (e.currentTarget.checked) {
                                                                            setIsLockInputDisable(true)
                                                                            form.setValue("lock", "undefined")
                                                                            setInputError((prev) => ({ ...prev, lockAmountError: null }));
                                                                            form.clearErrors("amount")
                                                                        }
                                                                        if (!e.currentTarget.checked) {
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
                                        {
                                            enable2FAPrompt
                                            &&
                                            <Enable2FADialog enable2FAPrompt={enable2FAPrompt} setEnable2FAPrompt={setEnable2FAPrompt}
                                                title={t("title1")} twoFaType="SignIn">
                                            </Enable2FADialog>
                                        }
                                        {
                                            isWithDraw2FAActive
                                            &&
                                            <Enable2FADialog isWithDraw2FAActive={isWithDraw2FAActive} setIsWithDraw2FAActive={setIsWithDraw2FAActive}
                                                title={t("title2")} twoFaType="WithDraw">
                                            </Enable2FADialog>
                                        }
                                        {
                                            enableWithDraw2FAOTP
                                            &&
                                            <WithDrawOTPDialog addMoneyAction={addMoneyAction} payload={payloadData} session={session.data}
                                                isLoading={isLoading} setIsLoading={setIsLoading} setEnableWithDraw2FAOTP={setEnableWithDraw2FAOTP}
                                                enableWithDraw2FAOTP={enableWithDraw2FAOTP} activate2fa={activate2fa}
                                            >
                                            </WithDrawOTPDialog>
                                        }

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

const Enable2FADialog: React.FC<Enable2FADialogProps> = ({ isWithDraw2FAActive, title, twoFaType, setEnable2FAPrompt, enable2FAPrompt, setIsWithDraw2FAActive }) => {
    const t = useTranslations("Enable2FADialog")
    return (
        <Dialog open={twoFaType === "WithDraw" ? isWithDraw2FAActive : enable2FAPrompt}
            onOpenChange={() => twoFaType === "WithDraw" ? setIsWithDraw2FAActive!(false) : setEnable2FAPrompt!(false)}>
            <DialogContent className="sm:max-w-[440px] bg-white p-8" onInteractOutside={(e) => {
                e.preventDefault();
            }}>
                <p className="my-4 font-semibold text-lg">{title}</p>
                <span className="px-2 text-sm font-medium text-slate-500 leading-[1.8rem]">{t("desc1")} &gt; {t("select")} <span className="font-bold py-[2px] border-black/40 px-[5px] rounded-lg border-[1px] mr-2">{t("security")}</span>{t("desc2")} &gt; {t("click_on")} {" "}
                    <span className="font-bold py-[2px] border-black/40 px-[5px] rounded-lg border-[1px] mr-2">{twoFaType === "SignIn" ? t("authenticator_app") : t("withDraw_2FA")}</span>
                    {t("desc3")}.</span>
            </DialogContent>
        </Dialog>
    )
}

const WithDrawOTPDialog: React.FC<WithDrawOTPDialogProps> = ({ activate2fa, session, addMoneyAction, payload, setIsLoading, isLoading,
    enableWithDraw2FAOTP, setEnableWithDraw2FAOTP
}) => {
    const [otp, setOtp] = useState("");
    const { toast } = useToast()
    const [isBtnDisable, setIsBtnDisable] = useState(false)
    const router = useRouter()

    const handleOTPSubmit = async () => {
        try {
            let res = await activate2fa(otp, "withDrawTwoFA");
            if (res.status === 200) {
                // check bank serve availability
                await axios.get(`${process.env.NEXT_PUBLIC_BANK_API_URL}/health`);
                setTimeout(async () => {
                    const token = await axios.post(`${process.env.NEXT_PUBLIC_BANK_API_URL}/token`, { uid: session?.user?.uid })
                    res = await addMoneyAction(payload, token.data.token);
                    responseHandler(res)
                    if (res.status === 200) router.push(`${process.env.NEXT_PUBLIC_BANK_FRONTEND_URL}?token=${token.data.token}`)
                    setOtp("")
                }, 1200)
            }
            responseHandler(res)
            res.status === 200 ? setIsBtnDisable(true) : setIsBtnDisable(false)
            setIsLoading(false)
        } catch (error: any) {
            console.log("===>", error);
            if (error instanceof AxiosError) {
                if (error.message === "Network Error" && error.config?.url === `${process.env.NEXT_PUBLIC_BANK_API_URL}/health`) {
                    toast({
                        title: "Currently Bank Server is down. Please try again later",
                        className: "bg-red-500 text-white font-medium",
                        variant: "destructive",
                        duration: 3000
                    })
                    return
                }
            }
            toast({
                title: `${error.message}`,
                variant: "destructive",
                className: "bg-red-500 text-white font-medium",
            })
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={enableWithDraw2FAOTP} onOpenChange={() => {
            setEnableWithDraw2FAOTP(false)
            setIsLoading(false)
        }}>
            <DialogContent className="sm:max-w-[425px] bg-white p-8" onInteractOutside={(e) => {
                e.preventDefault();
            }}>
                <div className="flex flex-col items-center">
                    <form onSubmit={handleOTPSubmit} className="flex flex-col gap-4">
                        <p className="text-xl font-medium text-slate-00 mb-10 mt-3">
                            Enter otp from your authenticator app
                        </p>
                        <InputOTP maxLength={6} value={otp} onChange={setOtp} className="border-purple-500">
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                        <Button disabled={otp.length !== 6 || isLoading || isBtnDisable} type="submit" className="bg-purple-500 text-white mt-2">
                            {isLoading ? "verifying..." : "Continue"}
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}