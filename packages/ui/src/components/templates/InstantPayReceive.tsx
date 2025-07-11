"use client"

import { useEffect, useState, Dispatch, SetStateAction, ChangeEvent } from "react"
import { Session } from "next-auth"
import axios from "axios"
import { startAuthentication } from "@simplewebauthn/browser"
import { isValidPhoneNumber } from "libphonenumber-js";
import { guessCountryByPartialPhoneNumber, CountrySelector, usePhoneInput } from 'react-international-phone';
import { Zap, User, CreditCard, ArrowDownToLine, ArrowLeft } from "lucide-react"
import { Button } from "../atoms/Button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../molecules/Dialog"
import { Input } from "../atoms/Input"
import { Label } from "../atoms/Label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../atoms/ToolTip"
import { EXCHANGE_RATE, CURRENCY_LOGO, CHARGE, SELECTED_COUNTRY, COUNTRY_MATCHED_CURRENCY } from "../../lib/constant"
import { useSession, SessionContextValue } from "next-auth/react"
import { formatAmount } from "../../lib/utils"
import { SUPPORTED_CURRENCY_ENUM, TRANSACTION_TYPE } from "../../lib/types"
import { useToast } from "../molecules/Toaster/use-toast"
import { responseHandler, senderAmountWithFee } from "../../lib/utils"


type DialogState = "closed" | "main" | "request-payment" | "send-payment-vai-code" | "temp-code" | "send-payment-vai-qr" | "payment-confirmation"
interface InstantPayReceiveButtonProps {
  setDialogState: Dispatch<SetStateAction<DialogState>>
  session: SessionContextValue
}
interface InstantPayReceiveProps {
  verifyPasskey: (step: "generateAuthentication" | "verifyAuthentication", regCred?: any) => Promise<{
    message: string;
    status: number;
    challenge?: PublicKeyCredentialRequestOptionsJSON;
  }>
}

export const InstantPayReceive: React.FC<InstantPayReceiveProps> = ({ verifyPasskey }) => {
  const { toast } = useToast()
  const session = useSession()
  const { country, setCountry } = usePhoneInput({
    defaultCountry: 'us',
    value: '+1 (234)',
  })
  const [dialogState, setDialogState] = useState<DialogState>("closed")
  const [activeTab, setActiveTab] = useState("Security")
  const [errorPhoneMsg, setErrorPhoneMsg] = useState<null | string>(null)
  const [amountError, setAmountError] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""])
  const [tempCode, setTempCode] = useState<null | string>(null)
  const [amount, setAmount] = useState<string>("")
  const [trxnId, setTrxnId] = useState<null | string>(null)
  const [payeeDetails, setPayeeDetails] = useState<{ name: string, number: string, currency: string, amount: string } | null>(null)
  const [currentCurrency, setCurrentCurrency] = useState<keyof typeof SUPPORTED_CURRENCY_ENUM | null>(null)
  const [walletCurrency, setWalletCurrency] = useState<keyof typeof SUPPORTED_CURRENCY_ENUM | null>(null)
  const [trxnType, setTrxnType] = useState<typeof TRANSACTION_TYPE[keyof typeof TRANSACTION_TYPE]>(TRANSACTION_TYPE.DOMESTIC)
  const [payerNumber, setPayerNumber] = useState(`+${country.dialCode}`)
  const CurrencyLogo = CURRENCY_LOGO[currentCurrency ?? ""]?.Logo

  useEffect(() => {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
        const recipientCountry = guessCountryByPartialPhoneNumber({ phone: event.data.payee_number })?.country?.name
        const payee_currency = COUNTRY_MATCHED_CURRENCY.find(c => c.country === recipientCountry)?.name || null
        setCurrentCurrency(payee_currency as keyof typeof SUPPORTED_CURRENCY_ENUM)
        setWalletCurrency(session?.data?.user?.wallet_currency as keyof typeof SUPPORTED_CURRENCY_ENUM || null)
        setTrxnId(event.data.transaction_id)
        setDialogState("send-payment-vai-code")
        setTrxnType(session.data?.user?.wallet_currency !== payee_currency ? TRANSACTION_TYPE.INTERNATIONAL : TRANSACTION_TYPE.DOMESTIC)
      }
    });
  }, []);

  const cleanUpState = () => {
    setDialogState("closed")
    setActiveTab("Security")
    setErrorPhoneMsg(null)
    setOtpCode(["", "", "", "", "", ""])
    setPayerNumber(`+${country.dialCode}`)
    setTempCode(null)
    setTrxnType(TRANSACTION_TYPE.DOMESTIC)
    setCurrentCurrency(null)
    setWalletCurrency(null)
    setAmount("")
    setPayeeDetails(null)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otpCode]
      newOtp[index] = value
      setOtpCode(newOtp)

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleSendRequest = async () => {
    let payerNumberType: string | undefined;
    const payerCountry = guessCountryByPartialPhoneNumber({ phone: payerNumber })?.country?.name
    const transaction_type = currentCurrency === walletCurrency ? "Domestic" : "International"

    if (payerNumber === session.data?.user?.number) return setErrorPhoneMsg("Please enter a valid phone number");
    if (currentCurrency) payerNumberType = COUNTRY_MATCHED_CURRENCY.find(c => c.name === currentCurrency)?.numberType;
    if (!payerCountry) {
      setErrorPhoneMsg("Please enter a valid phone number")
      return;
    }
    if (transaction_type == "Domestic") {
      if (payerCountry !== session?.data?.user?.country) {
        setErrorPhoneMsg("Please enter a valid phone number")
        return;
      }
    }
    if (transaction_type == "International") {
      const payerCurrency = COUNTRY_MATCHED_CURRENCY.find(c => (c.country === payerCountry))?.name
      if (payerCurrency !== currentCurrency) {
        setErrorPhoneMsg(`Please enter a valid ${payerNumberType} phone number`)
        return;
      }
    }
    try {
      const res = await axios.post("/api/push-notification", { payer_number: payerNumber })
      if (res.status === 200 && res.data && res.data.code) {
        setDialogState("temp-code")
        setTempCode(res.data.code)
      }
    } catch (error: any) {
      toast({
        title: error.message,
        variant: "destructive",
        className: "bg-red-500 text-white rounded-xl",
        duration: 3000
      })
    }

  }

  const handleAmount = (e: ChangeEvent<HTMLInputElement>) => {
    const value = formatAmount(e.target.value, 2)
    setAmount(value)
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
  }

  const handleSendCode = async () => {
    try {
      const formattedCode = `${otpCode.slice(0, 3).join("")}-${otpCode.slice(3, 6).join("")}-${otpCode.slice(6, 9).join("")}-${otpCode.slice(9, 12).join("")}`
      const res = await axios.post("/api/payment-via-code", { code: formattedCode, trxnId })
      if (res.status === 200 && res.data && res.data.receiverDetails) {
        responseHandler(res.data)
        setDialogState("payment-confirmation")
        setPayeeDetails({
          currency: res.data.receiverDetails.currency,
          name: res.data.receiverDetails.name,
          number: res.data.receiverDetails.number,
          amount: amount
        })
      }
    } catch (error: any) {
      toast({
        title: error.message,
        variant: "destructive",
        className: "bg-red-500 text-white rounded-xl",
        duration: 3000
      })
    }
  }

  const handleSendPayment = async () => {
    try {
      const isPasskeyVerified = await handlePasskey()
      if (!isPasskeyVerified) return;
      const payload = { trxnId, amount, currency: payeeDetails?.currency }
      const res = await axios.post("/api/send-payment-confirmation", payload)
      // TODO Implement the rest logic
    } catch (error: any) {
      toast({
        title: error.message,
        variant: "destructive",
        className: "bg-red-500 text-white rounded-xl",
        duration: 3000
      })
    }
  }

  const handleCancelConfirmation = async () => {
    try {
      const res = await axios.post("/api/cancel-payment-confirmation", { trxnId })
      responseHandler(res.data)
      cleanUpState()
    } catch (error: any) {
      toast({
        title: error.message,
        variant: "destructive",
        className: "bg-red-500 text-white rounded-xl",
        duration: 3000
      })
    }
  }

  const handlePasskey = async (): Promise<boolean> => {
    if (session.data && !session.data.user?.isMasterKeyActivated) {
      toast({
        title: "Master key is not activated. Please activate your master key first",
        variant: "destructive",
        className: "bg-red-500 text-white rounded-xl",
        duration: 3000
      })
      return false
    }
    try {
      let res: {
        message: string;
        status: number;
        challenge?: PublicKeyCredentialRequestOptionsJSON;
      }
      res = await verifyPasskey("generateAuthentication")
      console.log(res)
      if (res.status === 200) {
        const authResponse = await startAuthentication(res.challenge)
        res = await verifyPasskey("verifyAuthentication", { challenge: res.challenge, authResponseJSON: authResponse })
        if (res.status === 200) {
          session.update((data: Session) => {
            return {
              ...data,
              user: {
                ...data.user,
                isMasterKeyVerified: true
              }
            }
          })
        }
      }
      responseHandler(res)
      return true
    } catch (error: any) {
      toast({
        title: error.message,
        variant: "destructive",
        className: "bg-red-500 text-white rounded-xl",
        duration: 3000
      })
      return false
    }
  }

  return (
    <>
      <Dialog open={dialogState === "main"} onOpenChange={(open) => {
        !open && setDialogState("closed")
      }

      }>
        {/* <DialogTrigger asChild> */}
        {
          (session.data?.user?.isMasterKeyActivated && session.data?.user?.isMasterKeyVerified)
            ?
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InstantPayReceiveButton setDialogState={setDialogState} session={session} />
                </TooltipTrigger>
                <TooltipContent className="bg-white rounded-lg font-medium text-slate-600 w-[200px] p-3">
                  <p>Enable your master to feel lightning fast paying</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            :
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InstantPayReceiveButton setDialogState={setDialogState} session={session} />
                </TooltipTrigger>
                <TooltipContent className="bg-white rounded-lg font-medium text-slate-600 w-[200px] p-3">
                  <p>Enable your master to feel lightning fast paying</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
        }
        {/* </DialogTrigger> */}
        <DialogContent className="sm:max-w-lg p-0 bg-white overflow-hidden" onInteractOutside={(e) => {
          e.preventDefault();
        }}>
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
            <DialogHeader className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-800">Choose Your Action</DialogTitle>
              <p className="text-gray-600 mt-2">Select how you'd like to proceed with your transaction</p>
            </DialogHeader>
          </div>

          <div className="px-6 pb-6 space-y-4">
            {/* Send Payment Card */}
            <div
              className="group relative overflow-hidden rounded-xl border-2 border-purple-100 bg-white hover:border-purple-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setDialogState("send-payment-vai-code")}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-6 flex items-center space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-800">Send Payment</h3>
                    <span className="text-lg">💳</span>
                  </div>
                  <p className="text-gray-600 text-sm">Transfer money to someone quickly and securely</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full border-2 border-purple-200 group-hover:border-purple-400 group-hover:bg-purple-50 transition-all duration-300 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Request Payment Card */}
            <div
              className="group relative overflow-hidden rounded-xl border-2 border-green-100 bg-white hover:border-green-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setDialogState("request-payment")}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-6 flex items-center space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <ArrowDownToLine className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-800">Request Payment</h3>
                    <span className="text-lg">📥</span>
                  </div>
                  <p className="text-gray-600 text-sm">Ask someone to send you money with a payment request</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full border-2 border-green-200 group-hover:border-green-400 group-hover:bg-green-50 transition-all duration-300 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="text-center">
              <p className="text-xs text-gray-500">All transactions are secured with end-to-end encryption</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Payment Dialog */}
      <Dialog open={dialogState === "request-payment"} onOpenChange={(open) => {
        !open && setDialogState("closed")
        setErrorPhoneMsg(null)
        setPayerNumber(`+${country.dialCode}`)
      }}>
        <DialogContent className="sm:max-w-md bg-white" onInteractOutside={(e) => {
          e.preventDefault();
        }}>
          <DialogHeader>
            <div className="flex items-center space-x-3 mb-4">
              <Button variant="ghost" size="icon" onClick={() => setDialogState("main")} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <ArrowDownToLine className="h-4 w-4 text-white" />
                </div>
                <DialogTitle className="text-xl font-bold text-gray-800">Request Payment</DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600">Enter the payer's phone number to send a payment request</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="payer-number" className="text-sm font-medium text-gray-700">
                  Payer's Phone Number
                </Label>
                <div className='flex gap-1 items-center'>
                  <CountrySelector flagStyle={{ width: "35px", height: "35px" }} countries={SELECTED_COUNTRY} selectedCountry={country.iso2}
                    onSelect={(e) => {
                      setCountry(e.iso2);
                      setPayerNumber(`+${e.dialCode}` || "")
                    }}
                  />
                  <Input placeholder={"phone_number"} defaultValue={payerNumber} value={payerNumber} onChange={(e) => {
                    setErrorPhoneMsg(null)
                    setPayerNumber(e.target.value)
                  }} />
                  {errorPhoneMsg && <small className="text-red-500">{errorPhoneMsg}</small>}
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setDialogState("main")} className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => handleSendRequest()}
                disabled={!isValidPhoneNumber(payerNumber)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Send Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


      {/* Temporary Code dialogue */}
      <Dialog open={dialogState === "temp-code"}
        onOpenChange={(open) => {
          !open && setDialogState("closed")
          cleanUpState()
        }}
      >
        <DialogContent className="sm:max-w-md bg-white" onInteractOutside={(e) => {
          e.preventDefault();
        }}>
          <DialogHeader>
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                </div>
                <DialogTitle className="text-xl font-bold text-gray-800">Show the code to the Payer</DialogTitle>
              </div>
            </div>
          </DialogHeader>
          <div>
            <code className="">{tempCode}</code>
          </div>
        </DialogContent>
      </Dialog>


      {/* Send Payment Dialog */}
      <Dialog open={dialogState === "send-payment-vai-code"} onOpenChange={(open) => {
        !open && setDialogState("closed")
        cleanUpState()
      }}>
        <DialogContent className="sm:max-w-xl bg-white" onInteractOutside={(e) => {
          e.preventDefault();
        }}>
          <DialogHeader>
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center space-x-2">
                <DialogTitle className="text-xl font-bold text-gray-800">Verify Payment</DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <div>
            <div>
              <p className="text-gray-600">Enter the amount you want to send</p>
            </div>
            <div className="flex items-center">
              {currentCurrency && <div className="border border-slate-200 py-1  rounded-r-md p-2 rounded-br-none rounded-tr-none rounded-bl-lg rounded-tl-lg border-r-2"><CurrencyLogo /></div>}
              <Input type="number" step="0.01" autoComplete="off" value={amount} placeholder="0.00"
                className="border-r-l border-l-0 rounded-bl-none rounded-tl-none"
                onChange={(e) => handleAmount(e)}
              />
            </div>
            {amountError ?
              <p className="text-sm font-medium text-red-500">{amountError}</p>
              :
              currentCurrency && walletCurrency && (amount.length > 0)
              &&
              <div className="flex justify-end items-center">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Transaction Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Payment Amount</span>
                      <span className="text-sm font-medium text-gray-800">{CHARGE[walletCurrency as keyof typeof SUPPORTED_CURRENCY_ENUM]?.symbol}{amount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Exchange Rate</span>
                      <span className="text-sm font-medium text-gray-800">
                        {/* If current currency is equivalent to wallet currency, Exchange Rate will be null that's why OR check has added */}
                        {CHARGE[walletCurrency as keyof typeof SUPPORTED_CURRENCY_ENUM]?.symbol} {parseFloat(EXCHANGE_RATE[walletCurrency as keyof typeof SUPPORTED_CURRENCY_ENUM][currentCurrency as keyof typeof SUPPORTED_CURRENCY_ENUM] as string ?? 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Transaction Charge</span>
                      <span className="text-sm font-medium text-gray-800">
                        {CHARGE[walletCurrency as keyof typeof SUPPORTED_CURRENCY_ENUM]?.symbol}
                        {
                          trxnType !== TRANSACTION_TYPE.DOMESTIC
                            ?
                            parseInt(CHARGE[walletCurrency as keyof typeof SUPPORTED_CURRENCY_ENUM].international_charge)
                            :
                            parseInt(CHARGE[walletCurrency as keyof typeof SUPPORTED_CURRENCY_ENUM].domestic_charge)
                        }
                      </span>
                    </div>
                    <div className="border-t border-blue-200 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-semibold text-gray-800">Total Amount</span>
                        <span className="text-base font-bold text-purple-600">
                          {/* {CHARGE[walletCurrency as keyof typeof SUPPORTED_CURRENCY_ENUM]?.symbol}{calculateAmountOnDemand(setAmountError, session?.data, currentCurrency, session?.data?.user?.wallet_currency, amount)} */}
                          {CHARGE[walletCurrency as keyof typeof SUPPORTED_CURRENCY_ENUM]?.symbol}
                          {senderAmountWithFee({ amount, walletCurrency, transactionType: trxnType, selectedCurrency: currentCurrency }) / 100}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600">Enter the 12-digit verification code sent to your mobile device</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 block mb-3">Verification Code</Label>
                <div className="flex items-center justify-center space-x-2">
                  {/* First group: 3 digits */}
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otpCode[index]}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-8 h-10 text-center text-sm font-semibold border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    ))}
                  </div>

                  <span className="text-gray-400 font-bold text-lg">-</span>

                  {/* Second group: 3 digits */}
                  <div className="flex space-x-1">
                    {[3, 4, 5].map((index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otpCode[index]}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-8 h-10 text-center text-sm font-semibold border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    ))}
                  </div>

                  <span className="text-gray-400 font-bold text-lg">-</span>

                  {/* Third group: 3 digits */}
                  <div className="flex space-x-1">
                    {[6, 7, 8].map((index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otpCode[index]}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-8 h-10 text-center text-sm font-semibold border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    ))}
                  </div>

                  <span className="text-gray-400 font-bold text-lg">-</span>

                  {/* Fourth group: 3 digits */}
                  <div className="flex space-x-1">
                    {[9, 10, 11].map((index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otpCode[index]}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-8 h-10 text-center text-sm font-semibold border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    ))}
                  </div>
                </div>

                {/* Visual representation of the format */}
                <div className="text-center mt-2">
                  <p className="text-xs text-gray-400">Format: XXX-XXX-XXX-XXX</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => handleSendCode()}
                disabled={otpCode.some((digit) => !digit)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                Verify
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


      {/* Payment Confirmation Dialog */}
      {
        payeeDetails &&
        <Dialog open={dialogState === "payment-confirmation"} onOpenChange={(open) => {
          !open && setDialogState("closed")
          cleanUpState()
        }}>
          <DialogContent className="sm:max-w-md bg-white" onInteractOutside={(e) => {
            e.preventDefault();
          }}>
            <DialogHeader>
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                  <DialogTitle className="text-xl font-bold text-gray-800">Confirm Payment</DialogTitle>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Details</h3>
                <p className="text-gray-600 text-sm">Please review the payment information below</p>
              </div>

              {/* Payment Details Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Recipient</span>
                    <span className="text-sm font-semibold text-gray-800">{payeeDetails.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Phone</span>
                    <span className="text-sm text-gray-700">{payeeDetails.number}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium text-gray-800">Payment Amount</span>
                      <span className="text-lg font-bold text-green-600">{senderAmountWithFee({ amount: payeeDetails.amount, walletCurrency, transactionType: trxnType, selectedCurrency: payeeDetails.currency }) / 100}</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium text-gray-800">Currency</span>
                      <span className="text-lg font-bold text-green-600">{payeeDetails.currency}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-600 text-xs">⚠️</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-amber-800">Security Notice</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Please verify the recipient details carefully. This transaction cannot be reversed once confirmed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Confirmation Question */}
              <div className="text-center">
                <p className="text-gray-700 font-medium mb-2">Are you sure you want to send this payment?</p>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => handleCancelConfirmation()}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSendPayment()}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  ✓ Confirm & Send
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      }
    </>
  )
}

const InstantPayReceiveButton: React.FC<InstantPayReceiveButtonProps> = ({ setDialogState, session }) => (
  <Button
    variant="ghost"
    size="icon"
    // disabled={!session.data?.user?.isMasterKeyActivated || !session.data?.user?.isMasterKeyActivated}
    className="text-white  relative group overflow-visible rounded-full"
    onClick={() => setDialogState("main")}
  >
    <div className="relative">
      {/* Main Lightning Icon with enhanced glow */}
      <Zap className="h-[20px] w-[20px] relative z-10 drop-shadow-lg" />

      {/* Shiny overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200 to-transparent opacity-0 animate-pulse group-hover:opacity-60 transform -skew-x-12 rounded-full scale-x-[2] scale-y-[1.8]"></div>

      {/* Multiple floating stars */}
      <div
        className="absolute -top-3 -right-2 w-1 h-1 bg-yellow-300 rounded-full animate-bounce opacity-80"
        style={{ animationDelay: "0s", animationDuration: "2s" }}
      ></div>
      <div
        className="absolute -top-4 left-0 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-bounce opacity-70"
        style={{ animationDelay: "0.5s", animationDuration: "2.5s" }}
      ></div>
      <div
        className="absolute -top-2 right-1 w-0.5 h-0.5 bg-white rounded-full animate-bounce opacity-90"
        style={{ animationDelay: "1s", animationDuration: "1.8s" }}
      ></div>
      <div
        className="absolute -top-5 -left-1 w-1 h-1 bg-yellow-100 rounded-full animate-bounce opacity-60"
        style={{ animationDelay: "1.5s", animationDuration: "2.2s" }}
      ></div>

      {/* Floating sparkles that move upward */}
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-75"></div>
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
        <div className="w-1 h-4 bg-gradient-to-t from-transparent via-yellow-300 to-yellow-100 rounded-full animate-bounce opacity-80"></div>
      </div>

      {/* Radial glow effect */}
      <div className="absolute inset-0 rounded-full bg-yellow-300 opacity-20 animate-pulse blur-md scale-150"></div>
      <div className="absolute inset-0 rounded-full bg-white opacity-10 animate-ping blur-sm scale-125"></div>
    </div>

    {/* Enhanced hover glow */}
    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-200 opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-lg scale-150"></div>
  </Button>
)