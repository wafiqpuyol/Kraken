import { useState } from "react"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogHeader,
    DialogFooter,
    DialogDescription
} from "../molecules/Dialog"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../atoms/Card";
import { Calendar } from "../atoms/Calendar"
import type { PendingTransaction, IScheduleTabProps } from "../templates/ScheduledPayment"
import { useTranslations } from 'next-intl';
import { cn, getRecipientNumberTypeAndCountry,formateScheduledTrxnData } from "../../lib/utils"
import { Button } from "../atoms/Button"
import { responseHandler } from "../../lib/utils"
import { useToast } from "../molecules/Toaster/use-toast"
import { Label } from "../atoms/Label"
import { Input } from "../atoms/Input"
import { Popover, PopoverTrigger, PopoverContent } from "../molecules/Popover"
import { CalendarIcon, Clock, CookingPot } from "lucide-react"
import { format, formatDistanceStrict } from "date-fns"
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
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "../molecules/Form";
import { userFormEditSchedulePayment, } from "@repo/forms/editSchedulePayment";
import { editSchdulePaymentPayload } from "@repo/forms/editSchedulePaymentSchema";
import { useSession } from "next-auth/react";
import { SUPPORTED_CURRENCY_ENUM, TRANSACTION_TYPE, IScheduleDetails } from "../../lib/types";
import { SelectCurrency } from "../organisms/SelectCurrency"
import { EarleyScheduleNotice } from "../organisms/EarleyScheduleNotice"
import {OTP_Pincode} from "./Otp-Pincode"

interface IEditSchedulePaymentModalProps {
    children: React.ReactNode
    pendingScheduleTransaction: PendingTransaction
    cancelPaymentSchedule: IScheduleTabProps["cancelPaymentSchedule"]
    setPendingTransactions: IScheduleTabProps["setPendingTransactions"]
    setTotalPendingTransaction: IScheduleTabProps["setTotalPendingTransaction"]
    editPaymentScheduleJob: IScheduleTabProps["editPaymentScheduleJob"]
    sendOTPAction: IScheduleTabProps["sendOTPAction"]
    verifyOTP: IScheduleTabProps["verifyOTP"]
}

export const EditSchedulePaymentModal: React.FC<IEditSchedulePaymentModalProps> = ({
    children, pendingScheduleTransaction, cancelPaymentSchedule,sendOTPAction,
    setPendingTransactions, setTotalPendingTransaction, editPaymentScheduleJob,verifyOTP
}) => {
    const session = useSession();
    const extractTimeFromDate = format(pendingScheduleTransaction.execution_date!, "HH:mm")
    const { country, setCountry } = usePhoneInput({
        defaultCountry: "us",
        value: "+1 (234)",
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [amountError, setAmountError] = useState<string | null>(null);
    const [currency, setCurrency] = useState<null | string>(null);
    const [selectedTime, setSelectedTime] = useState<string>(extractTimeFromDate)
    const [_countryCode, setCountryCode] = useState(`+${country.dialCode}`);
    const [showScheduleNotice, setShowScheduleNotice] = useState(false)
    const [isOTP_PincodeOpen, setIsOTP_PincodeOpen] = useState<boolean>(false)
    const [postEditedScheduledPayment, setPostEditedScheduledPayment]=useState<IScheduleDetails | null>(null)
    const t = useTranslations("ScheduleTab")
    const { toast } = useToast()
    const { handleSubmit, control, formState, ...form } = userFormEditSchedulePayment({
        amount: pendingScheduleTransaction.amount.toString(),
        payee_name: pendingScheduleTransaction.recieverName,
        payee_number: pendingScheduleTransaction.payee_number,
        payment_date: new Date(pendingScheduleTransaction.execution_date),
        currency: pendingScheduleTransaction.currency
    })
    const currentCurrency = session?.data?.user?.preference.selected_currency || "";
    const walletCurrency = session?.data?.user?.wallet_currency || "";
    const CurrencyLogo = CURRENCY_LOGO[currency]?.Logo;


    const handleCancel = async () => {
        setIsLoading(true)
        try {
            const res = await cancelPaymentSchedule(pendingScheduleTransaction.trxn_id)
            console.log("Cancelled Payment ===>", res)
            if (res.status === 204) {
                setPendingTransactions((prev) => [...prev.filter(job => job.trxn_id !== res.jobId)])
                setTotalPendingTransaction((prev) => prev - 1)
            }
            responseHandler(res)
        } catch (error: any) {
            toast({
                title: error.message,
                variant: "destructive",
                className: "text-white bg-red-500",
                duration: 3000
            })
        }
        setIsLoading(false)
    }

    const resetStates = ()=> {
        setIsLoading(false)
            setIsEditing(false)
            setAmountError(null)
            setCurrency(null)
            setSelectedTime(extractTimeFromDate)
            setShowScheduleNotice(false)
            setIsOTP_PincodeOpen(false)
            setPostEditedScheduledPayment(null)
            form.reset()
    }

    const handleCancelEditing = ()=> {
        resetStates()
    }

    const submit = async (payload: editSchdulePaymentPayload) => {
        const { recipientCountry, recipientNumberType } = getRecipientNumberTypeAndCountry(payload.currency!, payload.payee_number)
        let formatedPayment_date: Date | null = new Date(pendingScheduleTransaction.execution_date)
        const scheduleId = pendingScheduleTransaction.trxn_id
        const transaction_type = currentCurrency === walletCurrency ? "Domestic" : "International";

        if (
            pendingScheduleTransaction.execution_date.toString() !== payload.payment_date.toString() || 
            selectedTime !== extractTimeFromDate
        ) {
            formatedPayment_date = formateExecutionTimestampAndCalculateDelay(payload.payment_date, selectedTime, form.setError, setShowScheduleNotice)
            if (!formatedPayment_date) return;
        }
        if (session.data?.user?.number === payload.payee_number) {
            form.setError("payee_number", {
                message: "Both receiver & sender can not be same. Invalid recipient number",
            });
            setIsLoading(false)
            return 
        }
        if (isNaN(Number(payload.amount)) || (Number(payload.amount)<=0)) {
            form.setError("amount", {
                message: "Invalid amount",
            });
            setIsLoading(false)
            return
        }
        if (transaction_type == "Domestic") {
            if (recipientCountry !== session?.data?.user?.country) {
                form.setError("payee_number", {
                    message: "Please enter a valid Payee number",
                });
                return;
            }
            setPostEditedScheduledPayment({
                formData: {
                    payee_number: payload.payee_number,
                    amount: payload.amount,
                    currency: payload.currency,
                    payment_date: formatedPayment_date,
                    payee_name: payload.payee_name
                } as editSchdulePaymentPayload,
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
            })
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
            setPostEditedScheduledPayment({
                formData: {
                    payee_number: payload.payee_number,
                    amount: payload.amount,
                    currency: payload.currency,
                    payment_date: formatedPayment_date,
                    payee_name: payload.payee_name
                } as editSchdulePaymentPayload,
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
            })
        }
        // try {
        //     console.log(postEditedScheduledPayment)
        //     const res = await editPaymentScheduleJob(postEditedScheduledPayment!)
        //     console.log("RESOINSE -___ ", res)
        //     if(res.status=== 200) {
        //         toast({
        //             title: res.message,
        //             variant: "default",
        //             className: "text-white bg-green-500",
        //             duration: 3000
        //         })
        //         setPendingTransactions((prev) => {
        //             if (!res.updatedJob) return prev;
        //             const filteredScheduledPaymentJob = prev.filter(job => job.trxn_id !== res.updatedJob.trxn_id)
        //             console.log(filteredScheduledPaymentJob)
        //             return [...filteredScheduledPaymentJob, res.updatedJob]
        //         })
        //     }
        //     responseHandler(res)
        // } catch (error: any) {
        //     toast({
        //         title: error.message,
        //         variant: "destructive",
        //         className: "text-white bg-red-500",
        //         duration: 3000
        //     })
        // }
        try {
            setIsLoading(true)
            sendOTPAction(session.data?.user?.email!).then(()=> {
                setIsOTP_PincodeOpen(true)
                setIsLoading(false)

            })
        } catch (error: any) {
            toast({
                title: error.message,
                variant: "destructive",
                className: "text-white bg-red-500",
                duration: 3000
            })
        }
    }

    return (
        <Dialog onOpenChange={()=> {resetStates()}}>
            <DialogTrigger className="w-full">{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[600px]  bg-white" onInteractOutside={(e) => {
                e.preventDefault();
            }}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                                Transaction Details
                            </span>
                        </div>
                        {isEditing ? "Edit Transaction" : "Transaction Details"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Update the transaction details below" : "View and manage your scheduled payment"}
                    </DialogDescription>
                </DialogHeader>

                {
                    <div className="space-y-4">
                        {!isEditing ? (
                            // View Mode
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Payee</label>
                                        <p className="text-lg font-semibold">{pendingScheduleTransaction.senderName}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Amount</label>
                                        <p className="font-medium flex items-center gap-1">
                                            {pendingScheduleTransaction.amount}
                                            <p>{pendingScheduleTransaction.currency}</p>
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Scheduled Date</label>
                                        <p className="font-medium">{format(pendingScheduleTransaction.execution_date, "PPP")}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Time</label>
                                        <p className="font-medium">
                                            {format(pendingScheduleTransaction.execution_date, "HH:mm a")}
                                        </p>
                                    </div>
                                </div>


                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                                        <p className="font-mono text-sm">
                                            TXN-{pendingScheduleTransaction.trxn_id.split("_")[1]?.split("-")[0]}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Payee Name</label>
                                        <p className="text-lg font-semibold">{pendingScheduleTransaction.recieverName}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Payee Number</label>
                                        <p className="text-sm font-medium">{pendingScheduleTransaction.payee_number}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Status</label>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3 text-amber-500" />
                                            <span className="text-sm text-amber-600 font-medium">Pending</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            // Edit Mode
                            <div className="space-y-4">
                                {/* @ts-ignore */}
                                <Form {...form}>
                                    <form onSubmit={handleSubmit(submit)}>

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={control}
                                                name="payee_name"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem>
                                                            <FormLabel>Payee</FormLabel>
                                                            <FormControl>
                                                                <div>
                                                                    <Input
                                                                        placeholder="enter payee name"
                                                                        {...field}
                                                                        defaultValue={pendingScheduleTransaction.recieverName}
                                                                        value={field.value}
                                                                        onChange={(e) => field.onChange(e.target.value)}
                                                                        onSubmit={e => console.log(e)}
                                                                    />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage className="text-red-500" />
                                                        </FormItem>
                                                    );
                                                }}
                                            />
                                            <FormField
                                                control={control}
                                                name="payee_number"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem>
                                                            <FormLabel>Payee Number</FormLabel>
                                                            <FormControl>
                                                                <div className="flex items-center gap-1">
                                                                    <CountrySelector
                                                                        className="mt-1"
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
                                                                        placeholder="Payee Number"
                                                                        defaultValue={pendingScheduleTransaction.payee_number}
                                                                        value={field.value}
                                                                        onChange={(e) => {
                                                                            setCountryCode(field.value);
                                                                            field.onChange(e.target.value);
                                                                            if (session.data?.user?.number === e.target.value) {
                                                                                form.setError("payee_number", {
                                                                                    message: "Both receiver & sender can not be same. Invalid recipient number",
                                                                                });
                                                                            }
                                                                            if(e.target.value.length === 0) {
                                                                                form.clearErrors("payee_number");
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage className="text-red-500" />

                                                        </FormItem>
                                                    )
                                                }}
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
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        defaultValue={pendingScheduleTransaction.amount}
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
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={control}
                                                    name="payment_date"
                                                    render={({ field }) => {
                                                        return (
                                                            <div >
                                                                <FormItem>
                                                                    <FormLabel>{t("payment_date")}</FormLabel>
                                                                    <FormControl>
                                                                        <div className="flex item-center gap-1">
                                                                            <Popover>
                                                                                <PopoverTrigger asChild disabled={isLoading}>
                                                                                    <Button
                                                                                        variant="outline"
                                                                                        className={cn(
                                                                                            "w-full justify-start text-left font-normal",
                                                                                            pendingScheduleTransaction.execution_date && "text-slate-500"
                                                                                        )}
                                                                                    >
                                                                                        <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                                                                                        {pendingScheduleTransaction.execution_date!
                                                                                            ?
                                                                                            format(pendingScheduleTransaction.execution_date!, "PPP")
                                                                                            :
                                                                                            field.value
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
                                            </div>
                                        </div>
                                        {
                                            isEditing && <EarleyScheduleNotice setShowScheduleNotice={setShowScheduleNotice} showScheduleNotice={showScheduleNotice} />
                                        }
                                        {
                                            isEditing &&
                                            <DialogFooter>
                                                <Button
                                                    onClick={handleCancelEditing}
                                                    disabled={!formState.isValid || !(Object.keys(formState.errors).length === 0) || !(amountError === null) || formState.isSubmitting || isLoading}>
                                                    Cancel
                                                </Button>
                                                <Button type="submit"
                                                    disabled={!formState.isValid || !(Object.keys(formState.errors).length === 0) || !(amountError === null) || formState.isSubmitting || isLoading}>
                                                    {(formState.isSubmitting || isLoading) ? "Saving" : "Save Changes"}
                                                </Button>
                                            </DialogFooter>
                                        }
                                    </form>
                                </Form>
                            </div>
                        )}
                    </div>  
                }

               { isOTP_PincodeOpen && <OTP_Pincode 
               postEditedScheduledPayment={postEditedScheduledPayment}
               editPaymentScheduleJob={editPaymentScheduleJob}
               isOTP_PincodeOpen={isOTP_PincodeOpen} verifyOTP={verifyOTP}
               setIsOTP_PincodeOpen={setIsOTP_PincodeOpen}
               setPendingTransactions={setPendingTransactions} resetStates={resetStates}
               />
               }

                {!isEditing && <DialogFooter>
                    <Button variant="outline" disabled={isLoading} onClick={handleCancel}>
                        {isLoading ? "Declining" : "Decline"}
                    </Button>
                    <Button onClick={() => setIsEditing(true)}>Edit</Button>
                </DialogFooter>}
            </DialogContent>
        </Dialog>
    )
}




// <Dialog>
//     <DialogTrigger className="w-full">{children}</DialogTrigger>
//     <DialogContent className="sm:max-w-[400px] bg-white">
//         <Card>
//             <CardHeader className="border-b">
//                 <CardTitle>{t("pending_transaction")}</CardTitle>
//                 <CardDescription className="text-slate-500">
//                     {t("pending_transaction_text1")}
//                 </CardDescription>
//             </CardHeader>
//             <CardContent>
//                 <div
//                     key={pendingScheduleTransaction.trxn_id ?? ""}
//                     className="flex items-center justify-between border-b p-8 rounded-lg shadow-md"
//                 >
//                     <div>
//                         <p>{pendingScheduleTransaction.trxn_id}</p>
//                         <p className="font-medium">{pendingScheduleTransaction.payer_number}</p>
//                         <p className="text-xs text-muted-foreground">
//                             {pendingScheduleTransaction.execution_date && new Date(pendingScheduleTransaction.execution_date).toLocaleString()}
//                         </p>
//                     </div>
//                     <div className="text-right">
//                         <p className="font-medium">
//                             ${pendingScheduleTransaction.amount}
//                         </p>
//                         <div className="flex items-center text-xs text-amber-600">
//                             <Clock className="h-3 w-3 mr-1" />
//                             {t("pending")}
//                         </div>
//                     </div>
//                 </div>
//             </CardContent>
//             <CardFooter>
//                 <Button className="bg-red-400" onClick={handleClick}>Cancel</Button>
//             </CardFooter>
//         </Card>
//     </DialogContent>
// </Dialog>

// ---------------------------------------------------------------------------------------------------

/*
    <div>
                                                <Label>Date</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal",
                                                                !editForm.execution_date && "text-muted-foreground",
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {editForm.execution_date ? format(editForm.execution_date, "MMM dd") : "Select date"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={new Date(editForm.execution_date!)}
                                                            onSelect={(date) => setEditForm((prev) => ({ ...prev, execution_date: `${date}` }))}
                                                            initialFocus
                                                            className="bg-white"
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                            <div>
                                                <Label htmlFor="edit-time">Time</Label>
                                                <Input
                                                    id="edit-time"
                                                    type="time"
                                                    value={format(editForm.execution_date!, "HH:mm")}
                                                    onChange={(e) => setEditForm((prev) => {
                                                        const timestamp = new Date(editForm.execution_date!)
                                                        const hour = e.target.value.split(":")[0]
                                                        const minutes = e.target.value.split(":")[1]
                                                        console.log(hour, minutes)
                                                        timestamp.setHours(parseInt(hour!))
                                                        timestamp.setMinutes(parseInt(minutes!))
                                                        console.log(timestamp)
                                                        return { ...prev, execution_date: timestamp }
                                                    })}
                                                />
                                            </div>
*/