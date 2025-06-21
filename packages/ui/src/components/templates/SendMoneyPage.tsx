'use client'


import { Button } from "../atoms/Button"
import { Input } from "../atoms/Input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../atoms/Card"
import { ArrowRight, Currency } from "lucide-react"
import { sendMoneyPayload } from "@repo/forms/sendMoneySchema"
import { userFormSendMoney } from "@repo/forms/sendMoney"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../molecules/Form'
import { useSession } from "next-auth/react"
import { useLocale, useTranslations } from 'next-intl';
import { TransactionHistory } from "../organisms/TransactionHistory"
import { p2ptransfer } from "@repo/db/type"
import { Dispatch, SetStateAction, useState } from "react"
import { Loader } from "../atoms/Loader"
import { GetVerified } from "../molecules/GetVerified"
import { PincodeDialog } from "../molecules/PincodeDialog"
import { PINCODE_MAX_LENGTH, EXCHANGE_RATE, CURRENCY_LOGO, CHARGE, SELECTED_COUNTRY, COUNTRY_MATCHED_CURRENCY,SEND_MOANEY_TYPE } from "../../lib/constant"
import { guessCountryByPartialPhoneNumber, CountrySelector, usePhoneInput } from 'react-international-phone';
import { ITransactionDetail, SUPPORTED_CURRENCY_ENUM, TRANSACTION_TYPE } from "../../lib/types"
import { ControllerRenderProps } from "@repo/forms/types"
import { formatAmount } from "../../lib/utils"
import { calculateAmountOnDemand } from "../../lib/utils"
import {ToggleTransactionType} from "../molecules/ToggleTransactionType"
import { AccountLock } from "../molecules/Lock"
import { useAppState } from "../molecules/StateProvider"
import {FinalCard} from "./FinalCard"
import {SelectCurrency} from "../organisms/SelectCurrency"

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
    const { userTotalBalance = 23453446 } = useAppState()

    console.log("USER BALACNE ===>", userTotalBalance);
    console.log("CURRENCY ---->", currency)


    const submit = async (payload: sendMoneyPayload) => {
        let recipientNumberType :string | undefined;
        if(payload.currency) {
            recipientNumberType = COUNTRY_MATCHED_CURRENCY.find(c => c.name === payload.currency)?.numberType
        }
        const recipientCountry = guessCountryByPartialPhoneNumber({ phone: payload.phone_number })?.country?.name
        
        
        if (!recipientCountry) {
            form.setError("phone_number", { message: "Please enter a valid phone number" })
            return;
        }

        const transaction_type = currentCurrency === walletCurrency ? "Domestic" : "International"
        if (transaction_type == "Domestic") {
            if (recipientCountry !== session?.data?.user?.country) {
                form.setError("phone_number", { message: "Please enter a valid phone number" })
                return;
            }

            setPayload({
                formData: { ...payload, amount: parseFloat(payload.amount).toString() } as sendMoneyPayload,
                additionalData: {
                    symbol: CHARGE[walletCurrency].symbol,
                    sender_number: session.data?.user.number,
                    receiver_number: payload.phone_number,
                    trxn_type: transaction_type as TRANSACTION_TYPE.DOMESTIC,
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
                form.setError("phone_number", { message: `Please enter a valid ${recipientNumberType} phone number match with the selected curency` })
                return;
            }
            setPayload({
                formData: { ...payload, amount: parseFloat(payload.amount).toString() } as sendMoneyPayload,
                additionalData: {
                    sender_number: session.data?.user?.number!,
                    receiver_number: payload?.phone_number,
                    trxn_type: transaction_type as TRANSACTION_TYPE.INTERNATIONAL,
                    international_trxn_fee: CHARGE[walletCurrency].international_charge!,
                    domestic_trxn_fee: null,
                    symbol: CHARGE[walletCurrency].symbol,
                    domestic_trxn_currency: walletCurrency,
                    international_trxn_currency: payload.currency!
                }
            })
        }

        setModalOpen(true);
    }

    console.log("I am running - SendMoneyPage");
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
                                            {t("current_balance")}: <span className="font-bold">{session.data.user.total_balance > 0 ? session.data.user.total_balance / 100 : 0}</span>
                                            <span className="text-[12px] font-extrabold">{CHARGE[walletCurrency].symbol}
                                            </span>
                                        </p>
                                    </div>
                                   <ToggleTransactionType currentCurrency={currentCurrency} walletCurrency={walletCurrency}/>
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
                                                                                if (parseFloat(value) > (session?.data?.user?.total_balance > 0 ? session.data.user.total_balance / 100 : 0)) {
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
                                                sendMoneyType= {SEND_MOANEY_TYPE.DIRECT}
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