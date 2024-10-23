"use client"

import { Dialog, DialogHeader, DialogFooter, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from './Dialog'
import { Button } from '../atoms/Button'
import { Input } from '../atoms/Input'
import { Label } from "../atoms/Label"
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useToast } from "../molecules/Toaster/use-toast"
import { EMAIL_REGEX, EMERGENCY_CODE_MAX_LENGTH, PINCODE_MAX_LENGTH } from "../../lib/constant"
import { useTranslations } from "next-intl";
import { responseHandler } from "../../lib/utils"

const content = {
    pincode: {
        title: "Create your secure pincode",
        desc: "Choose a strong PIN: Avoid easily guessable combinations like birthdays, phone numbers, or consecutive numbers.",
        btnText: "Create"
    },
    email: {
        title: "Request a new pincode",
        desc: "Enter the email address associated with your account. We'll be sent an emergency code to your email to reset your pincode.",
        btnText: "Next"
    },
    eneergencyCode: {
        title: "Reset your pincode",
        desc: "Enter the emergency code sent to your email.",
        btnText: "proceed"
    }
}

enum Phase {
    PINCODE = "pincode",
    EMAIL = "email",
    EMERGENCY = "eneergencyCode"
}
interface PincodeDialogProps {
    children: React.ReactNode
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
}
export const PincodeDialog: React.FC<PincodeDialogProps> = ({ children, generatePincode, sendEmergencyCode, resetPin }) => {
    const t = useTranslations("PincodeDialog")
    const [input, setInput] = useState("")
    const [email, setEmail] = useState("")
    const [emergencyCode, setEmergencyCode] = useState("")
    const [emailStatus, setEmailStatus] = useState("")
    const [emergencyCodeStatus, setEmergencyCodeStatus] = useState("")
    const [isForgot, setIsForgot] = useState(false)
    const [phase, setPhase] = useState(Phase["PINCODE"])
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [isBtnDisable, setIsBtnDisable] = useState(true)


    const handleClick = async () => {
        if (phase === Phase.PINCODE) {
            await handlePincodeBtnClick()
        }
        if (phase === Phase.EMAIL) {
            await handleEmailBtnClick()
        }
        if (phase === Phase.EMERGENCY) {
            await handleEmergencyBtnClick()
        }
    }

    const handlePincodeBtnClick = async () => {
        try {
            setIsLoading(true)
            const res = await generatePincode(input)
            switch (res.status) {
                case 201:
                    toast({
                        title: res.message,
                        variant: "default"
                    })
                    setInput("")
                    setIsBtnDisable(true)
                    break;
            }
            responseHandler(res)
        } catch (error: any) {
            toast({
                title: error.message,
                variant: "destructive"
            })
        }
        setIsLoading(false)
    }

    const handleEmailBtnClick = async () => {
        try {
            setIsLoading(true)
            const res = await sendEmergencyCode(email)
            switch (res.status) {
                case 200:
                    toast({
                        title: res.message,
                        variant: "default"
                    })
                    setEmail("")
                    setPhase(Phase.EMERGENCY)
                    setIsBtnDisable(true)
                    break;
            }
            responseHandler(res)
        } catch (error: any) {
            toast({
                title: error.message,
                variant: "destructive"
            })
        }
        setIsLoading(false)
    }

    const handleEmergencyBtnClick = async () => {
        validateEmergencyCode(emergencyCode)
        try {
            setIsLoading(true)
            const res = await resetPin(emergencyCode)
            switch (res.status) {
                case 200:
                    toast({
                        title: res.message,
                        variant: "default"
                    })
                    setEmergencyCode("")
                    setInput("")
                    setPhase(Phase.PINCODE)
                    setIsBtnDisable(true)
                    break;
            }
            responseHandler(res)
            setEmergencyCodeStatus(res.message)
        } catch (error: any) {
            toast({
                title: error.message,
                variant: "destructive"
            })
        }
        setIsLoading(false)
    }

    const handleForgot = () => {
        setIsForgot(true)
        setPhase(Phase.EMAIL)
    }

    const validateEmail = (e: ChangeEvent<HTMLInputElement>) => {
        const isValid = EMAIL_REGEX.test(e.target.value)
        if (!isValid) {
            setEmailStatus("Invalid Email")
            setIsBtnDisable(true)
        }
        if (isValid) {
            setEmailStatus("")
            setEmail(e.target.value)
            setIsBtnDisable(false)
        }
    }

    const validateEmergencyCode = (code: string) => {
        const codeLength = code.length
        if (!codeLength || (codeLength <= 0) || codeLength > EMERGENCY_CODE_MAX_LENGTH) {
            setEmergencyCodeStatus("Invalid Emergency Code")
            setIsBtnDisable(true)
        }
        if (codeLength && codeLength === EMERGENCY_CODE_MAX_LENGTH) {
            setEmergencyCodeStatus("")
            setIsBtnDisable(false)
        }
    }

    return (
        <Dialog onOpenChange={() => {
            setInput("")
            setEmail("")
            setEmergencyCode("")
            setIsForgot(false)
            setPhase(Phase.PINCODE)
            setIsBtnDisable(true)
            setEmailStatus("")
            setEmergencyCodeStatus("")

        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white" onInteractOutside={(e) => {
                e.preventDefault();
            }}>
                <DialogHeader>
                    <DialogTitle className='text-2xl'>{t(`${phase}.title`)}</DialogTitle>
                    <DialogDescription className='text-slate-700'>
                        {t(`${phase}.desc`)}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2 flex-col mt-4">
                    <div className='w-full'>
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="link" className="sr-only">
                                Link
                            </Label>
                            {phase === Phase.PINCODE && <Pincode t={t} setIsBtnDisable={setIsBtnDisable} input={input} setInput={setInput} maxLength={PINCODE_MAX_LENGTH} />}
                            {phase === Phase.EMAIL && <Email t={t} emailStatus={emailStatus} validateEmail={validateEmail} />}
                            {phase === Phase.EMERGENCY && <EmergencyCode t={t} setIsBtnDisable={setIsBtnDisable} phase={phase} EMERGENCY_CODE_MAX_LENGTH={EMERGENCY_CODE_MAX_LENGTH} emergencyCodeStatus={emergencyCodeStatus} setEmergencyCode={setEmergencyCode} emergencyCode={emergencyCode} />}
                        </div>
                        {!isForgot && <span className='text-purple-600 font-medium text-sm cursor-pointer ml-1' onClick={() => handleForgot()}>{t("forgot")}?</span>}
                    </div>
                </div>
                <DialogFooter className="sm:justify-start mt-3">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary"
                            className="bg-purple-600 text-white rounded-xl py-2 font-medium hover:bg-purple-500">
                            {t("cancel")}
                        </Button>
                    </DialogClose>
                    <Button
                        disabled={isLoading || isBtnDisable}
                        className="bg-purple-600 text-white rounded-xl py-2 font-medium hover:bg-purple-500"
                        onClick={() => handleClick()}>{content[phase].btnText}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const Pincode = ({ input, setInput, maxLength, setIsBtnDisable, t }: { input: string, setInput: Dispatch<SetStateAction<string>>, maxLength: number, setIsBtnDisable: Dispatch<SetStateAction<boolean>>, t: any }) => (
    <Input
        type='number'
        value={input}
        placeholder={t("pincode_placeholder")}
        onChange={(e) => {
            if (e.target.value.length <= maxLength) {
                setInput(e.target.value)
                setIsBtnDisable(true)
            }
            if (e.target.value.length >= maxLength) {
                setIsBtnDisable(false)
            }
        }}
    />
)

const Email = ({ emailStatus, validateEmail, t }: { t: any, emailStatus: string, validateEmail: (e: any) => void }) => (
    <div className='flex flex-col'>
        <Input
            type='email'
            placeholder={t('email_placeholder')}
            onChange={(e) => validateEmail(e)}
        />
        <p className='text-red-600 text-sm font-medium ml-1'>{emailStatus}</p>
    </div>
)

const EmergencyCode = ({ setIsBtnDisable, phase, emergencyCode, EMERGENCY_CODE_MAX_LENGTH, emergencyCodeStatus, setEmergencyCode, t }: { t: any, setIsBtnDisable: Dispatch<SetStateAction<boolean>>, emergencyCode: string, EMERGENCY_CODE_MAX_LENGTH: number, emergencyCodeStatus: string, setEmergencyCode: Dispatch<SetStateAction<string>>, phase: string }) => {
    useEffect(() => {
        var expiryDate = new Date(Date.now() + 1000 * 32).getTime()
        let time = setInterval(() => {
            var now = new Date().getTime()
            var distance = expiryDate - now
            var expiresWithin = Math.floor((distance % (1000 * 32)) / 1000);
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
            document.getElementById("parent").innerHTML = expiresWithin <= 0 ? "EXPIRED" : document.getElementById("parent").innerHTML;
            // @ts-ignore
            document.getElementById("parent").style.color = expiresWithin <= 0 && "#D62626";
        }, 1000)
        return () => { clearTimeout(time) }
    }, [])
    return (<div className='flex flex-col'>
        <Input
            type='text'
            onClick={() => { }}
            value={emergencyCode}
            placeholder={t("emergencyCode_placeholder")}
            onChange={(e) => {
                if (e.target.value.length <= EMERGENCY_CODE_MAX_LENGTH) {
                    setEmergencyCode(e.target.value)
                    setIsBtnDisable(true)
                }
                if (e.target.value.length >= EMERGENCY_CODE_MAX_LENGTH) {
                    setIsBtnDisable(false)
                }
            }}

        />
        <p className='text-red-600 text-sm font-medium ml-1'>{emergencyCodeStatus}</p>

        <div id="parent" className='self-center mt-9 mr-10 text-sm font-medium text-gray-500'>expires at:- <span id="childSpan" className='text-red-500'></span> </div>
    </div>)
}