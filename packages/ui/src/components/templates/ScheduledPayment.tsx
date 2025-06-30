"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Calendar } from "../atoms/Calendar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../atoms/Card";
import { Input } from "../atoms/Input";
import { Label } from "../atoms/Label";
import { Button } from "../atoms/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../molecules/Tabs";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn, calculateRemainingTime } from "@/src/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../molecules/Popover";
import { ScrollArea, ScrollBar } from "../molecules/Scroll-area";
import { useSession } from "next-auth/react";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "../molecules/Form";
import { userFormSchedulePayment } from "@repo/forms/schedulePayment";
import { schedulePaymentPayload } from "@repo/forms/schedulePaymentSchema";
import {
    guessCountryByPartialPhoneNumber,
    CountrySelector,
    usePhoneInput,
} from "react-international-phone";
import {
    PINCODE_MAX_LENGTH,
    CURRENCY_LOGO,
    CHARGE,
    SELECTED_COUNTRY,
    COUNTRY_MATCHED_CURRENCY,
    BUFFER_SCHEDULE_TIME,
    SEND_MOANEY_TYPE
} from "../../lib/constant";
import { formatAmount, calculateAmountOnDemand, formateExecutionTimestampAndCalculateDelay } from "../../lib/utils";
import { SUPPORTED_CURRENCY_ENUM, TRANSACTION_TYPE } from "../../lib/types";
import { PincodeDialog } from "../molecules/PincodeDialog";
import { IScheduleDetails } from "@/src/lib/types";
import { GetVerified } from "../molecules/GetVerified"
import { FinalCard } from "./FinalCard"
import { Loader } from "../atoms/Loader"
import { ToggleTransactionType } from "../molecules/ToggleTransactionType"
import { useLocale, useTranslations } from 'next-intl';
import { SelectCurrency } from "../organisms/SelectCurrency"
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useToast } from "../molecules/Toaster/use-toast"
import { EditSchedulePaymentModal } from "../organisms/EditSchedulePaymentModal"
import { Badge } from "../atoms/Badge"
import { SendMoneyProps } from "./SendMoneyPage"
import { EarleyScheduleNotice } from "../organisms/EarleyScheduleNotice"
import { AccountLock } from "../molecules/Lock"


export interface PendingTransaction {
    trxn_id: string;
    amount: number;
    payee_number: string
    execution_date: string
    remaining_time_of_execution: number
    payer_number: string
    recieverName: string,
    senderName: string,
    currency: string
}

interface IPaymentSchedulerProps {
    sendMoneyAction: SendMoneyProps["sendMoneyAction"]
    sendVerificationEmailAction: (locale: string) => Promise<{
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
    addPaymentSchedule: (payload: IScheduleDetails) => Promise<{
        message: any;
        status: number;
        job: any
    }>
    cancelPaymentSchedule: (jobId: string) => Promise<{
        message: string;
        status: number;
        jobId: null | string;
    }>
    editPaymentScheduleJob: (payload: IScheduleDetails) => Promise<{
        message: string;
        status: number;
        updatedJob: any;
        isAccountLock: boolean
    }>
    isAccountLock: boolean
    updateLockStatus: () => Promise<void>,
    checkAccountLockStatus(): Promise<{
        message: string;
        status: number;
        isLock?: boolean;
        lockExpiry?: Date | null;
    }>
}

interface IPaymentSchedulerCardProps extends Omit<IPaymentSchedulerProps, "cancelPaymentSchedule" | "editPaymentScheduleJob"> {
    setPendingTransactions: Dispatch<SetStateAction<PendingTransaction[]>>;
    setTotalPendingTransaction: Dispatch<SetStateAction<number>>
}

export interface IScheduleTabProps {
    pendingTransactions: PendingTransaction[];
    completedTransactions: PendingTransaction[];
    totalpendingTransaction: number;
    totalcompletedTransaction: number;
    cancelPaymentSchedule: IPaymentSchedulerProps["cancelPaymentSchedule"]
    setTotalPendingTransaction: Dispatch<SetStateAction<number>>
    setPendingTransactions: Dispatch<SetStateAction<PendingTransaction[]>>
    editPaymentScheduleJob: IPaymentSchedulerProps["editPaymentScheduleJob"]
    sendOTPAction: IPaymentSchedulerProps["sendOTPAction"]
    verifyOTP: IPaymentSchedulerProps["verifyOTP"]
}

export const PaymentScheduler: React.FC<IPaymentSchedulerProps> = ({
    sendMoneyAction, sendVerificationEmailAction, sendOTPAction, verifyOTP,
     generatePincode,isAccountLock,checkAccountLockStatus,
    resetPin, sendEmergencyCode, addPaymentSchedule, cancelPaymentSchedule, 
    editPaymentScheduleJob,updateLockStatus
}) => {
    const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
    const [completedTransactions, setCompletedTransactions] = useState<PendingTransaction[]>([]);
    const [totalpendingTransaction, setTotalPendingTransaction] = useState<number>(0);
    const [totalcompletedTransaction, setTotalCompletedTransaction] = useState<number>(0);
    const session = useSession()
    const { toast } = useToast()

    useEffect(() => {
        (async () => {
            await axios.post("/api/payment-worker")
        })()
    }, [])

    useEffect(() => {
        if (session.status === "authenticated" && session.data.user?.uid)
            (async () => {
                try {
                    const getAllScheduledPayments = await axios.get("/api/getAllDelayedJobs")
                    setPendingTransactions(getAllScheduledPayments.data[1])
                    setTotalPendingTransaction(getAllScheduledPayments.data[0])
                } catch (error: any) {
                    toast({
                        title: error.message,
                        variant: "destructive",
                        className: "text-white bg-red-500",
                        duration: 3000
                    })
                }
            })()
    }, [session.status])

    /* --------------- SSE Implementation ------------------- */
    // useEffect(() => {

    //     if(session.status === "authenticated" && session.data.user?.uid) {
    //         const eventSource = new EventSource(`/api/events/?userId=${session.data.user.uid}`);
    //         eventSource.onopen = () => {
    //             console.log("Connection Established")
    //         };

    //         eventSource.onmessage = (event) => {
    //             try {
    //                 const data = JSON.parse(event.data);
    //                 console.log(data.progress)
    //             } catch (err) {
    //                 console.error("Failed to parse message:", err);
    //             }
    //         };

    //         eventSource.onerror = () => {
    //            console.log("Connection Failed")
    //         };
    //     }
    // }, [session.status])

    // useEffect(() => {
    //     (async () => {
    //         const res = await axios.get("/api/findJob?jobId=schedule_727c7852-0b35-4722-830b-ca2c6093c699_0426d41a-af12-4ba0-84de-d3f03f29b769")
    //         console.log("*******************", res.data)
    //     })()
    // }, [])

    return (
        <div className="min-h-screen flex items-start px-3 w-screen mt-20 gap-x-28">
            <PaymentSchedulerCard
                setPendingTransactions={setPendingTransactions}
                sendMoneyAction={sendMoneyAction}
                sendVerificationEmailAction={sendVerificationEmailAction}
                sendOTPAction={sendOTPAction}
                verifyOTP={verifyOTP}
                generatePincode={generatePincode}
                resetPin={resetPin}
                sendEmergencyCode={sendEmergencyCode}
                addPaymentSchedule={addPaymentSchedule}
                setTotalPendingTransaction={setTotalPendingTransaction}
                isAccountLock={isAccountLock}
                checkAccountLockStatus={checkAccountLockStatus}
                updateLockStatus={updateLockStatus}
            />
            <ScheduleTab
                totalpendingTransaction={totalpendingTransaction}
                totalcompletedTransaction={totalcompletedTransaction}
                completedTransactions={completedTransactions}
                pendingTransactions={pendingTransactions}
                cancelPaymentSchedule={cancelPaymentSchedule}
                setTotalPendingTransaction={setTotalPendingTransaction}
                setPendingTransactions={setPendingTransactions}
                editPaymentScheduleJob={editPaymentScheduleJob}
                sendOTPAction={sendOTPAction}
                verifyOTP={verifyOTP}
            />
        </div>
    );
};

const PaymentSchedulerCard: React.FC<IPaymentSchedulerCardProps> = ({
    setPendingTransactions,
    sendMoneyAction,
    sendVerificationEmailAction,
    sendOTPAction,
    verifyOTP,
    generatePincode,
    resetPin,
    sendEmergencyCode,
    addPaymentSchedule,
    setTotalPendingTransaction,
    isAccountLock,
    checkAccountLockStatus,
    updateLockStatus
}) => {
    const session = useSession();
    const t = useTranslations("ScheduledPayment")
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showScheduleNotice, setShowScheduleNotice] = useState(false)
    const [selectedTime, setSelectedTime] = useState<string>("09:00")
    const [amountError, setAmountError] = useState<string | null>(null);
    const { country, setCountry } = usePhoneInput({
        defaultCountry: "us",
        value: "+1 (234)",
    });
    const { handleSubmit, control, formState, ...form } = userFormSchedulePayment();
    const [countryCode, setCountryCode] = useState(`+${country.dialCode}`);
    const currentCurrency = session?.data?.user?.preference.selected_currency || "";
    const walletCurrency = session?.data?.user?.wallet_currency || "";
    const [currency, setCurrency] = useState<null | string>(null);
    const CurrencyLogo = CURRENCY_LOGO[currency]?.Logo;
    const [payload, setPayload] = useState<IScheduleDetails | null>(null);
    const [modalOpen, setModalOpen] = useState(false)
        const [accountLock, setAccountLock] = useState<boolean>(isAccountLock)
    
    const locale = useLocale()

    console.log(formState)

    const submit = async (payload: schedulePaymentPayload) => {
        let recipientNumberType: string | undefined;
        if (payload.currency) {
            recipientNumberType = COUNTRY_MATCHED_CURRENCY.find(c => c.name === payload.currency)?.numberType
        }
        const recipientCountry = guessCountryByPartialPhoneNumber({
            phone: payload.payee_number,
        })?.country?.name;

        if (!recipientCountry) {
            form.setError("payee_number", {
                message: "Please enter a valid phone number",
            });
            return;
        }

        const formatedPayment_date = formateExecutionTimestampAndCalculateDelay(payload.payment_date, selectedTime, form.setError, setShowScheduleNotice)
        if (!formatedPayment_date) return;

        const scheduleId = uuidv4()
        const transaction_type = currentCurrency === walletCurrency ? "Domestic" : "International";

        if (transaction_type == "Domestic") {
            if (recipientCountry !== session?.data?.user?.country) {
                form.setError("payee_number", {
                    message: "Please enter a valid Payee number",
                });
                return;
            }
            setPayload({
                formData: { pincode: payload.pincode, payee_number: payload.payee_number, amount: parseFloat(payload.amount).toString(), currency: payload.currency, payment_date: formatedPayment_date } as schedulePaymentPayload,
                additionalData: {
                    symbol: CHARGE[walletCurrency].symbol,
                    sender_number: session.data?.user.number,
                    receiver_number: payload.payee_number,
                    trxn_type: transaction_type as TRANSACTION_TYPE.DOMESTIC,
                    domestic_trxn_fee: CHARGE[walletCurrency].domestic_charge,
                    international_trxn_fee: null,
                    domestic_trxn_currency: walletCurrency,
                    international_trxn_currency: currentCurrency,
                },
                executionTime: formatedPayment_date,
                scheduleId
            });
        }

        if (transaction_type == "International") {
            const recipientCurrency = COUNTRY_MATCHED_CURRENCY.find(
                (c) => c.country === recipientCountry
            )?.name;
            if (recipientCurrency !== payload.currency!) {
                form.setError("payee_number", {
                    message: `Please enter a valid ${recipientNumberType} phone number match with the current curency`,
                });
                return;
            }
            setPayload({
                formData: { pincode: payload.pincode, payee_number: payload.payee_number, amount: parseFloat(payload.amount).toString(), currency: payload.currency, payment_date: formatedPayment_date } as schedulePaymentPayload,
                additionalData: {
                    sender_number: session.data?.user?.number,
                    receiver_number: payload.payee_number,
                    trxn_type: transaction_type as TRANSACTION_TYPE.INTERNATIONAL,
                    international_trxn_fee: CHARGE[walletCurrency].international_charge,
                    domestic_trxn_fee: null,
                    symbol: CHARGE[walletCurrency].symbol,
                    domestic_trxn_currency: walletCurrency,
                    international_trxn_currency: payload.currency!,
                },
                executionTime: formatedPayment_date,
                scheduleId
            });
        }

        setModalOpen(true);
    };

    return (
        <div className="bg-white overflow-hidden">
            <Card className="w-full max-w-md relative">
                <CardHeader className="mt-2 mb-5">
                    <CardTitle>{t("cardTitle")}</CardTitle>
                    <CardDescription className="text-slate-500">{t("cardDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {
                        session.status === "loading" || !session.data
                            ?
                            <Loader />
                            :
                            session.data?.user?.isVerified
                                ?
                                <>
                                    <ToggleTransactionType currentCurrency={currentCurrency} walletCurrency={walletCurrency} />

                                    {/* @ts-ignore */}
                                    <Form {...form}>
                                        <form onSubmit={handleSubmit(submit)}>
                                            <FormField
                                                control={control}
                                                name="payee_number"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem>
                                                            <FormLabel>{t("payee_number")}</FormLabel>
                                                            <FormControl>
                                                                <div className="flex gap-1 items-center">
                                                                    <CountrySelector
                                                                        flagStyle={{ width: "35px", height: "35px" }}
                                                                        countries={SELECTED_COUNTRY}
                                                                        selectedCountry={country.iso2}
                                                                        onSelect={(e) => {
                                                                            setCountry(e.iso2);
                                                                            field.onChange(() => `+${e.dialCode}`);
                                                                            setCountryCode(e.dialCode || "");
                                                                        }}
                                                                    />
                                                                    <Input
                                                                        placeholder={t("payee_number_input_placeholder")}
                                                                        {...field}
                                                                        defaultValue={countryCode}
                                                                        value={field.value}
                                                                        onChange={(e) => {
                                                                            setCountryCode(field.value);
                                                                            field.onChange(e.target.value);
                                                                            if (session.data?.user?.number === e.target.value) {
                                                                                form.setError("payee_number", {
                                                                                    message: "Both receiver & sender can not be same. Invalid recipient number",
                                                                                });
                                                                            }
                                                                            if (e.target.value.length === 0) {
                                                                                form.clearErrors("payee_number");
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage className="text-red-500" />
                                                        </FormItem>
                                                    );
                                                }}
                                            />

                                            {
                                                currentCurrency !== walletCurrency &&
                                                <FormField
                                                    control={control}
                                                    name="currency"
                                                    render={({ field }) => (
                                                        <FormItem className="mb-4 flex flex-col">
                                                            <FormLabel>{t("currency")}</FormLabel>
                                                            <FormControl>
                                                                <SelectCurrency setCurrency={setCurrency} form={form} field={field}
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
                                                name="amount"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem className="mb-3">
                                                            <FormLabel>{t("amount")}</FormLabel>
                                                            <FormControl>
                                                                <div className="flex items-center">
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        autoComplete="off"
                                                                        {...field}
                                                                        className="border-r-0"
                                                                        onChange={(e) => {
                                                                            const value = formatAmount(e.target.value, 2);
                                                                            field.onChange(value.toString());
                                                                            const isNegativeOrZero = parseFloat(value) <= 0;
                                                                            if (
                                                                                isNaN(parseFloat(value)) ||
                                                                                !isNegativeOrZero
                                                                            ) {
                                                                                setAmountError(null);
                                                                            }
                                                                            if (isNegativeOrZero) {
                                                                                setAmountError(
                                                                                    "Amount must be positive & greater then zero"
                                                                                );
                                                                            }
                                                                            if (currentCurrency === walletCurrency && session?.data?.user?.total_balance) {
                                                                                if (
                                                                                    parseFloat(value) >
                                                                                    (session?.data?.user?.total_balance > 0
                                                                                        ? session?.data?.user?.total_balance / 100
                                                                                        : 0)
                                                                                ) {
                                                                                    setAmountError(
                                                                                        "Amount cannot be greater than current balance"
                                                                                    );
                                                                                }
                                                                            }
                                                                        }}
                                                                    />
                                                                    {currency && (
                                                                        <div className="border border-slate-200 py-1  rounded-r-md border-l-0 pr-2">
                                                                            <CurrencyLogo />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage className="text-red-500" />

                                                            {amountError ? (
                                                                <p className="text-sm font-medium text-red-500">
                                                                    {amountError}
                                                                </p>
                                                            ) : (
                                                                <div className="flex justify-end items-center">
                                                                    {currentCurrency !== walletCurrency &&
                                                                        !isNaN(Number(field.value)) &&
                                                                        field.value.length > 0 && (
                                                                            <p className="text-right py-[2px] px-2 bg-purple-700/90 text-white rounded-lg text-[13px] font-bold">
                                                                                {calculateAmountOnDemand(
                                                                                    setAmountError,
                                                                                    session.data,
                                                                                    currency,
                                                                                    session.data.user?.wallet_currency,
                                                                                    field.value
                                                                                )}
                                                                                <span className="font-extrabold text-slate-700 text-white">
                                                                                    {
                                                                                        CHARGE[
                                                                                            walletCurrency as keyof typeof SUPPORTED_CURRENCY_ENUM
                                                                                        ].symbol
                                                                                    }
                                                                                </span>
                                                                            </p>
                                                                        )}
                                                                </div>
                                                            )}
                                                        </FormItem>
                                                    );
                                                }}
                                            />

                                            <FormField
                                                control={control}
                                                name="payment_date"
                                                render={({ field }) => {
                                                    return (
                                                        <div className="flex item-center gap-5">
                                                            <FormItem>
                                                                <FormLabel>{t("payment_date")}</FormLabel>
                                                                <FormControl>
                                                                    <div className="flex">
                                                                        <Popover>
                                                                            <PopoverTrigger asChild disabled={isLoading}>
                                                                                <Button
                                                                                    variant="outline"
                                                                                    className={cn(
                                                                                        "w-full justify-start text-left font-normal",
                                                                                        !date && "text-slate-500"
                                                                                    )}
                                                                                >
                                                                                    <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                                                                                    {field.value
                                                                                        ? format(field.value, "PPP")
                                                                                        : t("select_date")
                                                                                    }
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                                <Calendar
                                                                                    {...field}
                                                                                    mode="single"
                                                                                    selected={field.value}
                                                                                    onSelect={(val) => {
                                                                                        console.log("selected value ===>", val)
                                                                                        field.onChange(val);
                                                                                    }}
                                                                                    initialFocus
                                                                                    className="bg-white rounded-2xl"
                                                                                />
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                        <div className="self-end"><Input type="time" value={selectedTime} className="w-full"
                                                                            onChange={(e) => {
                                                                                setSelectedTime(e.target.value)
                                                                            }} /></div>
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage className="text-red-500" />
                                                            </FormItem>
                                                        </div>
                                                    );
                                                }}
                                            />

                                            <FormField
                                                control={control}
                                                name="pincode"
                                                render={({ field }) => (
                                                    <FormItem className="mb-3">
                                                        <FormLabel>{t("pincode")}</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => {
                                                                    if (e.target.value.length <= PINCODE_MAX_LENGTH) {
                                                                        field.onChange(e.target.value);
                                                                    }
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <div className="flex items-center text-[13px] text-slate-600 font-medium gap-1">
                                                            <span>{t("pindcode_text2")}</span>
                                                            <PincodeDialog resetPin={resetPin} generatePincode={generatePincode} sendEmergencyCode={sendEmergencyCode}><span className="text-purple-600 cursor-pointer">{t("pindcode_text1")}</span></PincodeDialog>
                                                        </div>
                                                        <FormMessage className="text-red-600" />
                                                    </FormItem>
                                                )}
                                            />
                                            <EarleyScheduleNotice setShowScheduleNotice={setShowScheduleNotice} showScheduleNotice={showScheduleNotice} />
                                            <FinalCard
                                                sendMoneyType={SEND_MOANEY_TYPE.SCHEDULED}
                                                sendMoneyAction={sendMoneyAction}
                                                locale={locale}
                                                formReset={form.reset}
                                                session={session.data}
                                                setModalOpen={setModalOpen}
                                                modalOpen={modalOpen}
                                                transactionDetail={payload}
                                                currency={currency}
                                                sendOTPAction={sendOTPAction}
                                                verifyOTP={verifyOTP}
                                                addPaymentSchedule={addPaymentSchedule}
                                                setTotalPendingTransaction={setTotalPendingTransaction}
                                                setPendingTransactions={setPendingTransactions}
                                            >
                                                <Button
                                                    className="w-full mt-6 bg-purple-600 text-white"
                                                    type="submit"
                                                    disabled={!formState.isValid || !(Object.keys(formState.errors).length === 0) || !(amountError === null) || formState.isSubmitting}
                                                >
                                                    {formState.isSubmitting
                                                        ? "Scheduling..."
                                                        : "Schedule Payment"}
                                                </Button>
                                            </FinalCard>
                                            <div className="flex flex-col items-start">

                                            </div>
                                        </form>
                                    </Form>
                                </>
                                :
                                <GetVerified sendVerificationEmailAction={sendVerificationEmailAction} title="Complete verification to enable p2p money transfer" />
                    }
                </CardContent>
                {accountLock && <AccountLock updateLockStatus={updateLockStatus} checkAccountLockStatus={checkAccountLockStatus} setAccountLock={setAccountLock} />}
            </Card>
        </div>
    );
};

const ScheduleTab: React.FC<IScheduleTabProps> = ({
    pendingTransactions,
    completedTransactions,
    totalcompletedTransaction,
    totalpendingTransaction,
    cancelPaymentSchedule,
    setPendingTransactions,
    setTotalPendingTransaction,
    editPaymentScheduleJob,
    sendOTPAction,
    verifyOTP
}) => {
    const [selectedTab, setSelectedTab] = useState("pending");
    const t = useTranslations("ScheduleTab")
    return (
        <div className="bg-white px-4 rounded-lg shadow-md w-[560px] p-8">
            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-2 border h-[60px] px-4">
                    <TabsTrigger
                        value="pending"
                        onClick={() => setSelectedTab("pending")}
                        className={cn(
                            "text-xl font-medium",
                            selectedTab === "pending"
                                ? "bg-purple-600 text-white"
                                : "bg-white text-black/85"
                        )}
                    >
                        {t("pending")}
                        <p className="ml-4 text-white">{totalpendingTransaction}</p>
                    </TabsTrigger>
                    <TabsTrigger
                        value="completed"
                        onClick={() => setSelectedTab("completed")}
                        className={cn(
                            "text-xl font-medium",
                            selectedTab === "completed"
                                ? "bg-purple-600 text-white"
                                : "bg-white text-black/85"
                        )}
                    >
                        {t("completed")}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="pending" className="mt-4">
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle>{t("pending_transaction")}</CardTitle>
                            <CardDescription className="text-slate-500">
                                {t("pending_transaction_text1")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pendingTransactions.length === 0 ? (
                                <div className="space-y-4 mt-5 h-[300px] w-full">
                                    <p className="text-center text-muted-foreground py-4">
                                        {t("pending_transaction_text2")}
                                    </p>
                                </div>
                            ) : (
                                <ScrollArea className="space-y-4 mt-5 h-[300px] w-full">
                                    {pendingTransactions.map((transaction) => (
                                        <EditSchedulePaymentModal
                                            key={transaction.trxn_id}
                                            pendingScheduleTransaction={transaction}
                                            cancelPaymentSchedule={cancelPaymentSchedule}
                                            setPendingTransactions={setPendingTransactions}
                                            setTotalPendingTransaction={setTotalPendingTransaction}
                                            editPaymentScheduleJob={editPaymentScheduleJob}
                                            sendOTPAction={sendOTPAction}
                                            verifyOTP={verifyOTP}
                                        >
                                            <div
                                                key={transaction.trxn_id ?? ""}
                                                className="flex items-center justify-between border-b p-8 rounded-lg shadow-md"
                                            >
                                                <div className="flex flex-col gap-5">
                                                    <div className="flex justify-between">
                                                        <div>
                                                            <p className="font-medium text-lg justify-self-start">{transaction.recieverName}</p>
                                                            <p className="text-sm text-muted-foreground">{transaction.payer_number}</p>
                                                            <p className="text-xs text-muted-foreground">{new Date(transaction.execution_date).toLocaleString()}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <Badge className="p-1 rounded-xl bg-orange-600 text-white">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                Pending
                                                            </Badge>
                                                            <p className="font-medium flex items-center gap-1">
                                                                {transaction.amount}
                                                                <p>{transaction.currency}</p>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div className="flex flex-col justify item-start">
                                                            <Label className="text-sm text-muted-foreground self-start">Scheduled Date</Label>
                                                            <p>{new Date(transaction.execution_date).toLocaleString()}</p>
                                                        </div>
                                                        <div className="flex flex-col justify item-start">
                                                            <Label className="text-sm text-muted-foreground self-start">Time Remain</Label>
                                                            <p>{calculateRemainingTime(transaction.execution_date)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </EditSchedulePaymentModal>
                                    ))}
                                    <ScrollBar orientation="vertical" />
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="completed" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("completed_transaction")}</CardTitle>
                            <CardDescription className="text-slate-500">
                                {t("completed_transaction_text1")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pendingTransactions.length === 0 ? (
                                <div className="space-y-4 mt-5 h-[300px] w-full">
                                    <p className="text-center text-muted-foreground py-4">
                                        {t("completed_transaction_text2")}
                                    </p>
                                </div>
                            ) : (
                                <ScrollArea className="space-y-4 mt-5 h-[300px] w-full">
                                    {pendingTransactions.map((transaction) => (
                                        <div
                                            key={transaction.trxn_id ?? ""}
                                            className="flex items-center justify-between border-b p-8 rounded-lg shadow-md"
                                        >
                                            <div>
                                                <p className="font-medium">{transaction.amount}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {/* {format(transaction.execution_data, "PPP")} */}
                                                    {new Date(transaction.execution_date).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">
                                                    ${transaction.amount}
                                                </p>
                                                <div className="flex items-center text-xs text-amber-600">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {t("completed")}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <ScrollBar orientation="vertical" />
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};