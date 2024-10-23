'use client'

import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "../molecules/Dialog"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../atoms/Select"
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
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Loader } from "../atoms/Loader"
import { GetVerified } from "../molecules/GetVerified"
import { PincodeDialog } from "../molecules/PincodeDialog"
import { PINCODE_MAX_LENGTH, EXCHANGE_RATE, CURRENCY_LOGO, CHARGE, SELECTED_COUNTRY, COUNTRY_MATCHED_CURRENCY } from "../../lib/constant"
import { cn } from "../../lib/utils"
import { guessCountryByPartialPhoneNumber, CountrySelector, usePhoneInput } from 'react-international-phone';
import { ITransactionDetail, SUPPORTED_CURRENCY_ENUM } from "../../lib/types"
import { ControllerRenderProps, UseFormReset } from "@repo/forms/types"
import { formatAmount } from "../../lib/utils"
import { calculateAmountOnDemand } from "../../lib/utils"
import { TrxnToolTip } from "../molecules/TrxnToolTip"
import { Session } from "next-auth"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../atoms/InputOTP"
import { AccountLock } from "../molecules/Lock"
import { responseHandler } from "../../lib/utils"

export interface SendMoneyProps {
    sendMoneyAction: (arg: ITransactionDetail) => Promise<{
        message: string | undefined;
        status: number;
        transaction?: p2ptransfer | {};
    }>
    p2pTransactionHistories: p2ptransfer[] | []
    sendVerificationEmailAction: (locale: string) => Promise<{
        message: string;
        status: number;
    }>
    generatePincode: (pincode: string) => Promise<{
        message: string;
        status: number;
    }>
    sendEmergencyCode: (email: string) => Promise<{
        message: string;
        status: number;
    }>
    resetPin: (emergency_code: string) => Promise<{
        message: string;
        status: number;
    }>
    sendOTPAction: (email: string) => Promise<{
        message: string | undefined;
        status: number;
    }>
    verifyOTP: (otp: string) => Promise<{
        message: string;
        status: number;
    }>
    isAccountLock: boolean
    updateLockStatus: () => Promise<void>
    checkAccountLockStatus(): Promise<{
        message: string;
        status: number;
        isLock?: boolean;
        lockExpiry?: Date | null;
    }>,
    getAllP2PTransactionByTrxnID: (trxn_id: string) => Promise<[]>
}

interface FinalProps {
    sendMoneyAction: SendMoneyProps["sendMoneyAction"],
    formReset: UseFormReset<sendMoneyPayload>
    locale: string,
    session: Session,
    modalOpen: boolean,
    setModalOpen: Dispatch<SetStateAction<boolean>>
    children: React.ReactNode,
    transactionDetail: ITransactionDetail | null
    setAllTransactionHistory: Dispatch<SetStateAction<[] | p2ptransfer[]>>
    currency: string | null
    sendOTPAction: (email: string) => Promise<{
        message: string | undefined;
        status: number;
    }>
    verifyOTP: (otp: string) => Promise<{
        message: string;
        status: number;
    }>
    setAccountLock: Dispatch<SetStateAction<boolean>>
}

interface IOTPPrompt {
    transactionDetail: ITransactionDetail,
    sendMoneyAction: SendMoneyProps["sendMoneyAction"],
    formReset: UseFormReset<sendMoneyPayload>
    setAllTransactionHistory: Dispatch<SetStateAction<[] | p2ptransfer[]>>
    verifyOTP: (otp: string) => Promise<{
        message: string;
        status: number;
    }>
    setAccountLock: Dispatch<SetStateAction<boolean>>
}

interface SelectCurrencyProps {
    field: ControllerRenderProps<{
        amount: string;
        phone_number: string;
        pincode: string;
        currency?: string | undefined;
    }, "currency">,
    current_selected_currency: string,
    wallet_currency: string | undefined,
    form: any,
    accountLock: boolean,
    setCurrency: Dispatch<SetStateAction<string | null>>
}

const SelectCurrency = ({ field, current_selected_currency, wallet_currency, form, setCurrency, accountLock }: SelectCurrencyProps) => {

    if (!field.value) {
        form.setValue("currency", current_selected_currency)
    } else {
        setCurrency(field.value);
    }

    return (
        <Select defaultValue={current_selected_currency} onValueChange={field.onChange} disabled={accountLock}>
            <SelectTrigger className="w-full h-[50px]" >
                <SelectValue placeholder="Please choose currency" />
            </SelectTrigger>
            <SelectContent className="bg-white">
                <SelectGroup >
                    {
                        Object.keys(EXCHANGE_RATE[wallet_currency]).map((currency, idx) => {
                            const Logo = CURRENCY_LOGO[currency].Logo
                            const title = CURRENCY_LOGO[currency].title

                            return (
                                <SelectItem key={idx} className="cursor-pointer hover:bg-gray-100 px-9" value={currency}>
                                    <div className={cn("grid grid-cols-2 grid-flow-col place-items-center gap-x-24", currency === "BDT" && "gap-x-7")}>
                                        <div className="row-span-1 flex items-center gap-3 justify-between">
                                            <Logo />
                                            <div className="text-[13px] font-medium text-slate-800 flex flex-col">
                                                <p className="self-start">{currency}</p>
                                                <span className="text-slate-500">{title}</span>
                                            </div>
                                        </div>
                                        <div className="row-span-1 font-bold text-slate-600 justify-self-end text-[12.5px]">
                                            <span>{EXCHANGE_RATE[wallet_currency][currency]} {currency}</span>
                                            <span>/{wallet_currency}</span>
                                        </div>
                                    </div>
                                </SelectItem>
                            )
                        })
                    }
                </SelectGroup>
            </SelectContent>
        </Select >
    )
}


const Enable2FAPrompt = () => {
    const t = useTranslations("AddMoney")
    return (<DialogContent className="sm:max-w-[425px] bg-white p-8" onInteractOutside={(e) => {
        e.preventDefault();
    }}>
        <p className="my-4 font-semibold text-lg">{t("title1")}</p>
        <span className="px-2 text-sm font-medium text-slate-500 leading-[1.8rem]">Got to settings &gt; select <span className="font-bold py-[2px] border-black/40 px-[5px] rounded-lg border-[1px] mr-2">Security</span> Tab &gt; click on {" "}
            <span className="font-bold py-[2px] border-black/40 px-[5px] rounded-lg border-[1px] mr-2">Authenticator app</span>
            Enable Button.</span>
    </DialogContent>)
}


const OTPPrompt = ({ transactionDetail, sendMoneyAction, formReset, setAllTransactionHistory, verifyOTP, setAccountLock }: IOTPPrompt) => {
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false)
    const [isBtnDisable, setIsBtnDisable] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        var expiryDate = new Date(Date.now() + 1000 * 92).getTime()
        let time = setInterval(() => {
            var now = new Date().getTime()
            var distance = expiryDate - now
            var expiresWithin = Math.floor((distance % (1000 * 92)) / 1000);
            if (distance < 0) {
                clearInterval(time)
            }

            if (expiresWithin > 0) {
                // @ts-ignore
                document.getElementById("childSpan").innerHTML = expiresWithin + "s";
                // @ts-ignore
                document.getElementById("childSpan").style.color = expiresWithin <= 10 ? "#D62626" : "#9333EA"
            }
            // @ts-ignore
            document.getElementById("parent").innerHTML = expiresWithin <= 0 ? "OTP time expired" : document.getElementById("parent").innerHTML;
            // @ts-ignore
            document.getElementById("parent").style.color = expiresWithin <= 0 && "#D62626";
        }, 1000)
        return () => { clearTimeout(time) }
    }, [])

    const handleOTPSubmit = async () => {
        try {
            setIsLoading(true)
            let res: {
                message: string | undefined;
                status: number;
                transaction?: p2ptransfer | {};
            }
            res = await verifyOTP(otp)
            if (res.status === 200) {
                res = await sendMoneyAction(transactionDetail)
            }

            switch (res.status) {
                case 200:
                    toast({
                        title: res.message,
                        variant: "default",
                        className: "text-white bg-green-500",
                        duration: 3000
                    })
                    setAllTransactionHistory((prev) => {
                        const updatedArr = [...prev]
                        updatedArr.unshift(res.transaction!)
                        return updatedArr
                    })
                    formReset({ amount: "", currency: "", phone_number: "", pincode: "" })
                    setOtp("")
                    break

                case 403:
                    toast({
                        title: res.message,
                        variant: "destructive",
                        className: "text-white bg-red-500",
                        duration: 3000
                    })
                    setAccountLock(true)
                    formReset({ amount: "", currency: "", phone_number: "", pincode: "" })
                    break;
            }
            responseHandler(res)
            res.status === 200 ? setIsBtnDisable(true) : setIsBtnDisable(false)
            setIsLoading(false)
        } catch (error: any) {
            toast({
                title: error.message,
                variant: "destructive",
                className: "text-white bg-red-500",
                duration: 3000
            })
            setIsLoading(false)
        }
    }
    return (
        <DialogContent className="sm:max-w-[400px] bg-white p-8" onInteractOutside={(e) => {
            e.preventDefault();
        }}>
            <div className="flex flex-col items-center">
                <form onSubmit={handleOTPSubmit} className="flex flex-col gap-4">
                    <p className="text-lg font-medium text-slate-00">
                        We've sent you an 6 digit otp code your email.
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
                <div id="parent" className='self-center mt-9 mr-10 text-sm font-medium text-gray-500'>expires at:- <span id="childSpan" className='text-red-500'></span> </div>
            </div>
        </DialogContent>
    )
}


const FinalCard: React.FC<FinalProps> = ({ sendMoneyAction, children, transactionDetail, modalOpen, session, currency,
    locale, formReset, setModalOpen, setAllTransactionHistory, sendOTPAction, verifyOTP, setAccountLock }) => {
    const t = useTranslations("FinalCard")
    const [isLoading, setIsLoading] = useState(false)
    const [isBtnDisable, setIsBtnDisable] = useState(false)
    const [enable2FAPrompt, setEnable2FAPrompt] = useState(false)
    const [otpPrompt, setOTPPrompt] = useState(false)
    const { toast } = useToast()
    const router = useRouter()


    const handleClick = async () => {
        if (!session?.user) {
            router.push(`/${locale}/login`)
        }
        setIsLoading(true)
        if (!session.user?.isTwoFAActive && !session.user?.isOtpVerified) {
            setEnable2FAPrompt(true)
            return;
        }

        try {
            const res = await sendOTPAction(session.user?.email!)
            switch (res.status) {
                case 200:
                    toast({
                        title: res.message,
                        variant: "default",
                        className: "text-white bg-green-500",
                        duration: 3000
                    })
                    setIsLoading(false)
                    setOTPPrompt(true)
                    break
            }
            responseHandler(res)
            setIsLoading(false)
        } catch (error: any) {
            toast({
                title: error.message,
                variant: "destructive",
                className: "text-white bg-red-500",
                duration: 3000
            })
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={modalOpen} onOpenChange={() => {
            setIsBtnDisable(false)
            setModalOpen(false)
            setEnable2FAPrompt(false)
            setIsLoading(false)
            setOTPPrompt(false)

        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            {
                transactionDetail && !enable2FAPrompt
                    ?

                    (
                        otpPrompt ?
                            <OTPPrompt formReset={formReset} sendMoneyAction={sendMoneyAction} transactionDetail={transactionDetail}
                                setAllTransactionHistory={setAllTransactionHistory} verifyOTP={verifyOTP} setAccountLock={setAccountLock}
                            />
                            :
                            <DialogContent className="sm:max-w-[400px] bg-white" onInteractOutside={(e) => {
                                e.preventDefault();
                            }}>
                                <DialogTitle className="mb-4">{(`title`)}</DialogTitle>
                                <div className="flex justify-between mb-3">
                                    <div className="flex flex-col gap-y-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-500">{t("sender_number")}</span>
                                            <span className="font-medium text-sm">{transactionDetail.additionalData.sender_number}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-500">{t("receiver_number")}</span>
                                            <span className="font-medium text-sm">{transactionDetail.additionalData.receiver_number}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-500">{t("amount")}</span>
                                            <span className="font-medium text-sm">
                                                {transactionDetail.formData.amount}
                                                <span className="ml-1">{transactionDetail.additionalData.trxn_type === "International" ? transactionDetail.additionalData.international_trxn_currency : transactionDetail.additionalData.domestic_trxn_currency}</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-y-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-500">{t("category")}</span>
                                            <span className="font-medium text-sm">{transactionDetail.additionalData.trxn_type}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-500">{t("fee")}</span>
                                            <div className="font-medium text-sm">
                                                <span className="font-extrabold text-lg">{transactionDetail.additionalData.symbol}</span>
                                                <span>{transactionDetail.additionalData.trxn_type === "Domestic" ? transactionDetail.additionalData.domestic_trxn_fee : transactionDetail.additionalData.international_trxn_fee}</span>
                                            </div>
                                        </div>
                                        {
                                            transactionDetail.additionalData.trxn_type === "International" &&
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-500">{t("converted_amount")}</span>
                                                <div className="font-medium text-sm">
                                                    <span>
                                                        {calculateAmountOnDemand(undefined, undefined, currency, session.user?.wallet_currency, transactionDetail.formData.amount)}
                                                        <small className="font-extrabold text-[13px] mr-1">{transactionDetail.additionalData.symbol}</small>
                                                        <small className="font-bold text-slate-600">+{transactionDetail.additionalData.international_trxn_fee}(inc.)</small>
                                                    </span>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <Button className="w-full bg-purple-600 text-white" onClick={() => handleClick()} disabled={isLoading || isBtnDisable}>
                                    {isLoading ? t("proceeding") : t("proceed")}
                                </Button>
                            </DialogContent>
                    )

                    :
                    <Enable2FAPrompt />
            }
        </Dialog>
    )
}

export const SendMoneyPage: React.FC<SendMoneyProps> = ({ sendMoneyAction, p2pTransactionHistories, sendVerificationEmailAction,
    generatePincode, sendEmergencyCode, resetPin, sendOTPAction, verifyOTP, isAccountLock, updateLockStatus, checkAccountLockStatus, getAllP2PTransactionByTrxnID }) => {
    const t = useTranslations("SendMoneyPage")
    const locale = useLocale()
    const { handleSubmit, control, formState, ...form } = userFormSendMoney()
    const session = useSession()
    const currentCurrency = session?.data?.user?.preference.selected_currency || ""
    const walletCurrency = session?.data?.user?.wallet_currency || ""
    const [payload, setPayload] = useState<ITransactionDetail | null>(null)
    const [allTransactionHistory, setAllTransactionHistory] = useState<p2ptransfer[] | []>(p2pTransactionHistories)
    const { country, setCountry } = usePhoneInput({
        defaultCountry: 'us',
        value: '+1 (234)',
    })
    const [countryCode, setCountryCode] = useState(`+${country.dialCode}`)
    const [modalOpen, setModalOpen] = useState(false)
    const [amountError, setAmountError] = useState<string | null>(null)
    const [currency, setCurrency] = useState<null | string>(null)
    const [accountLock, setAccountLock] = useState<boolean>(isAccountLock)
    const CurrencyLogo = CURRENCY_LOGO[currency]?.Logo

    const submit = async (payload: sendMoneyPayload) => {
        const recipientCountry = guessCountryByPartialPhoneNumber({ phone: payload.phone_number })?.country?.name
        if (!recipientCountry) {
            form.setError("phone_number", { message: "Please enter a valid phone number" })
            return;
        }

        const transaction_type = currentCurrency === walletCurrency ? "Domestic" : "International"
        if (transaction_type == "Domestic") {
            if (recipientCountry !== session?.data?.user.country) {
                form.setError("phone_number", { message: "Please enter a valid phone number" })
                return;
            }

            setPayload({
                formData: { ...payload, amount: parseFloat(payload.amount).toString() },
                additionalData: {
                    symbol: CHARGE[walletCurrency].symbol,
                    sender_number: session.data?.user.number,
                    receiver_number: payload.phone_number,
                    trxn_type: transaction_type,
                    domestic_trxn_fee: CHARGE[walletCurrency].domestic_charge,
                    international_trxn_fee: null,
                    domestic_trxn_currency: walletCurrency,
                    international_trxn_currency: currentCurrency
                }
            })
        }

        if (transaction_type == "International") {
            const recipientCurrency = COUNTRY_MATCHED_CURRENCY.find(c => (c.country === recipientCountry))?.name
            if (recipientCurrency !== payload.currency!) {
                form.setError("phone_number", { message: `Please enter a valid ${recipientCountry} phone number match with the current curency` })
                return;
            }
            setPayload({
                formData: { ...payload, amount: parseFloat(payload.amount).toString() },
                additionalData: {
                    sender_number: session.data?.user.number,
                    receiver_number: payload.phone_number,
                    trxn_type: transaction_type,
                    international_trxn_fee: CHARGE[walletCurrency].international_charge,
                    domestic_trxn_fee: null,
                    symbol: CHARGE[walletCurrency].symbol,
                    domestic_trxn_currency: walletCurrency,
                    international_trxn_currency: payload.currency!
                }
            })
        }

        setModalOpen(true);
    }

    return (

        <div className="min-h-screen flex items-start  px-4 w-screen mt-20 gap-x-28">
            <Card className="w-full max-w-md bg-white relative">
                <CardHeader className="mt-2 mb-5">
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
                                <>
                                    <div className="flex justify-end items-center">
                                        <p className="text-right rounded-lg px-[5px] py-[1px] font-bold bg-purple-600 text-white text-[0.74rem]">
                                            {t("current_balance")}: <span className="font-bold">{session.data?.user?.total_balance / 100}</span>
                                            <span className="text-[12px] font-extrabold">{CHARGE[walletCurrency].symbol}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="mb-5">
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-destructive">{t("transaction_type")}</label>
                                        <div className="py-1 px-5 flex gap-1 justify-between border-[1px] border-slate-300 rounded-2xl">
                                            <TrxnToolTip>
                                                <button type="button" className={cn("text-slate-800 py-1 font-medium", (currentCurrency === walletCurrency) && "bg-purple-500 text-white px-2 rounded-xl")}>{t("Domestic")}</button>
                                            </TrxnToolTip>
                                            <div className="w-[2px] bg-slate-400"></div>
                                            <TrxnToolTip>
                                                <button type="button" className={cn("text-slate-800 py-1 font-medium", (currentCurrency !== walletCurrency) && "bg-purple-500 text-white px-2 rounded-xl")}>{t("International")}</button>
                                            </TrxnToolTip>
                                        </div>
                                    </div>
                                    {/* @ts-ignore */}
                                    <Form {...form}>
                                        <form onSubmit={handleSubmit(submit)}>
                                            {
                                                currentCurrency !== walletCurrency &&
                                                <FormField
                                                    control={control}
                                                    name="currency"
                                                    render={({ field }) => (
                                                        <FormItem className="mb-4 flex flex-col">
                                                            <FormLabel>{t("currency")}</FormLabel>
                                                            <FormControl>
                                                                <SelectCurrency accountLock={accountLock} setCurrency={setCurrency} form={form} field={field}
                                                                    current_selected_currency={session?.data?.user?.preference.selected_currency}
                                                                    wallet_currency={session?.data?.user?.wallet_currency}
                                                                />
                                                            </FormControl>
                                                            <FormMessage className="text-red-600" />
                                                        </FormItem>
                                                    )}
                                                />
                                            }
                                            <FormField
                                                control={control}
                                                name="phone_number"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem>
                                                            <FormLabel>{t("recipient_number")}</FormLabel>
                                                            <FormControl>
                                                                <div className='flex gap-1 items-center'>
                                                                    <CountrySelector flagStyle={{ width: "35px", height: "35px" }} countries={SELECTED_COUNTRY} selectedCountry={country.iso2} onSelect={(e) => {
                                                                        setCountry(e.iso2);
                                                                        field.onChange(() => `+${e.dialCode}`)
                                                                        setCountryCode(e.dialCode || "")
                                                                    }} />
                                                                    <Input placeholder={t("phone_number")} {...field} defaultValue={countryCode} value={field.value} onChange={(e) => {
                                                                        setCountryCode(field.value)
                                                                        field.onChange(e.target.value)
                                                                    }} disabled={accountLock} />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage className='text-red-500' />
                                                        </FormItem>
                                                    )
                                                }
                                                }
                                            />

                                            <FormField
                                                control={control}
                                                name="amount"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem className="mb-3">
                                                            <FormLabel>{t("amount")}</FormLabel>
                                                            <FormControl>
                                                                <div className="flex items-center">
                                                                    <Input disabled={accountLock} type="number" step="0.01" autoComplete="off" {...field}
                                                                        className="border-r-0"
                                                                        onChange={(e) => {
                                                                            const value = formatAmount(e.target.value, 2)
                                                                            field.onChange(value.toString())
                                                                            const isNegativeOrZero = parseFloat(value) <= 0
                                                                            if (isNaN(parseFloat(value)) || !isNegativeOrZero) {
                                                                                setAmountError(null)
                                                                            }
                                                                            if (isNegativeOrZero) {
                                                                                setAmountError("Amount must be positive & greater then zero")
                                                                            }
                                                                            if (currentCurrency === walletCurrency) {
                                                                                if (parseFloat(value) > (session.data.user?.total_balance / 100)) {
                                                                                    setAmountError("Amount cannot be greater than current balance")
                                                                                }
                                                                            }
                                                                        }}
                                                                    />
                                                                    {currency && <div className="border border-slate-200 py-1  rounded-r-md border-l-0 pr-2"><CurrencyLogo /></div>}
                                                                </div>
                                                            </FormControl>

                                                            {amountError ?
                                                                <p className="text-sm font-medium text-red-500">{amountError}</p>
                                                                :
                                                                <div className="flex justify-end items-center">
                                                                    {(currentCurrency !== walletCurrency) && !isNaN(Number(field.value)) && field.value.length > 0 &&
                                                                        <p
                                                                            className="text-right py-[2px] px-2 bg-purple-700/90 text-white rounded-lg text-[13px] font-bold">
                                                                            {calculateAmountOnDemand(setAmountError, session.data, currency, session.data.user?.wallet_currency, field.value)}
                                                                            <span className="font-extrabold text-slate-700 text-white">
                                                                                {CHARGE[walletCurrency as keyof typeof SUPPORTED_CURRENCY_ENUM].symbol}
                                                                            </span></p>}
                                                                </div>
                                                            }
                                                        </FormItem>
                                                    )
                                                }}
                                            />

                                            <FormField
                                                control={control}
                                                name="pincode"
                                                render={({ field }) => (
                                                    <FormItem className="mb-3">
                                                        <FormLabel>{t("pincode")}</FormLabel>
                                                        <FormControl>
                                                            <Input disabled={accountLock} type="number" {...field} onChange={(e) => {
                                                                if (e.target.value.length <= PINCODE_MAX_LENGTH) {
                                                                    field.onChange(e.target.value)
                                                                }
                                                            }} />
                                                        </FormControl>
                                                        <div className="flex items-center text-[13px] text-slate-600 font-medium gap-1">
                                                            <span>{t("pincode_footer")}? </span>
                                                            <PincodeDialog resetPin={resetPin} generatePincode={generatePincode} sendEmergencyCode={sendEmergencyCode}><span className="text-purple-600 cursor-pointer">{t("create_pincode")}</span></PincodeDialog>
                                                        </div>
                                                        <FormMessage className="text-red-600" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FinalCard
                                                sendMoneyAction={sendMoneyAction}
                                                setAllTransactionHistory={setAllTransactionHistory}
                                                locale={locale}
                                                formReset={form.reset}
                                                session={session.data}
                                                setModalOpen={setModalOpen}
                                                modalOpen={modalOpen}
                                                transactionDetail={payload}
                                                currency={currency}
                                                sendOTPAction={sendOTPAction}
                                                verifyOTP={verifyOTP}
                                                setAccountLock={setAccountLock}
                                            >
                                                <Button type="submit" className="w-full mt-6 bg-purple-600 text-white"

                                                    disabled={accountLock || !(formState.isValid && (Object.keys(formState.errors).length === 0) && (amountError === null)) || formState.isSubmitting}
                                                >
                                                    {formState.isSubmitting ? t("sending") : t('send_money')}
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </FinalCard>
                                        </form>
                                    </Form>
                                </>
                                :
                                <GetVerified sendVerificationEmailAction={sendVerificationEmailAction} title="Complete verification to enable p2p money transfer" />
                        /* @ts-ignore */
                    }
                </CardContent>
                <CardFooter className="flex flex-col items-start">
                </CardFooter>
                {accountLock && <AccountLock updateLockStatus={updateLockStatus} checkAccountLockStatus={checkAccountLockStatus} setAccountLock={setAccountLock} />}
            </Card>

            <TransactionHistory p2pTransactionHistories={allTransactionHistory} getAllP2PTransactionByTrxnID={getAllP2PTransactionByTrxnID} />
        </div >
    )
}