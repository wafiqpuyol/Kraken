"use client"
import { Button } from "@repo/ui/Button"
import { Input } from "@repo/ui/Input"
import { Card } from "@repo/ui/Card"
import Image from "next/image"
import Link from "next/link"
import { transactionAction } from "../lib/action"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from 'next/navigation'
import { SUPPORTED_LOCALES } from "../lib/constants"
import { useToast } from "@repo/ui/useToast"

export default function Component() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isDisable, setIsDisable] = useState<boolean>(false)
  const [inputError, setInputError] = useState<boolean | string>(false)
  const params = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    setInputError(false)
  }, [userId])


  const handleClick = async () => {
    setIsLoading(true)
    let res: {
      message: string;
      statusCode: number;
      language?: string;
    };

    if (userId != null) {
      if (parseInt(userId)) {
        res = await transactionAction(parseInt(userId), params.get("token"))
        const locale = SUPPORTED_LOCALES.find((l) => l.language === res.language)?.code || "/en"

        if (res.statusCode === 400) {
          setIsLoading(false)
          toast({ title: res.message, variant: "destructive" })
          return setInputError("Invalid User Id")
        }

        if (res.statusCode === 403) {
          setIsLoading(false)
          toast({ title: res.message, variant: "destructive" })
          setTimeout(() => router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}${locale}/login`), 3500)
        }

        if (res.statusCode === 498) {
          toast({ title: res.message, variant: "destructive" })
          setTimeout(() => router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}${locale}/dashboard/transfer/deposit`), 3500)
        }

        if (res.statusCode === 200) {
          setInputError(false)
          setUserId(null)
          setIsLoading(false)
          setIsDisable(true)
          toast({ title: res.message, variant: "destructive" })
          setIsDisable(true)
          setTimeout(() => router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}${locale}/dashboard/transactions/withdraw-history`), 3500)
        }

        if (res.statusCode === 500) {
          setIsLoading(false)
          toast({ title: res.message, variant: "destructive" })
        }
      }
    } else {
      setInputError("Please Enter your User Id")
      return;
    }
  }


  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-semibold text-blue-800 mb-4">Login to NetBanking</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="mb-4">
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
              Customer ID/ User ID
            </label>
            <Input id="userId" value={userId} className="w-full" onChange={(e) => setUserId(e.target.value)} />
            {inputError && <span className="text-red-500"> {inputError} </span>}
            <Link href="#" className="text-sm text-blue-600 hover:underline">
              Forgot Customer ID
            </Link>
          </div>
          <Button
            disabled={!userId || isLoading || isDisable}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={() => handleClick()} >
            CONTINUE
          </Button>
          <Card className="mt-4 bg-blue-50 p-4">
            <p className="text-sm text-gray-800">
              <strong>Dear Customer,</strong>
              <br />
              Welcome to the new login page of IFIC Bank NetBanking.
              Its lighter look and feel is designed to give you the best possible
              user experience. Please continue to login using your customer ID
              and password.
            </p>
          </Card>
        </div>
        <div>
          <div className="flex justify-end mb-4">
            <Image src="/placeholder.svg?height=50&width=100" alt="Norton Secured" width={100} height={50} />
          </div>
          <p className="text-sm text-gray-800 mb-2">
            Your security is of utmost importance.
            <Link href="#" className="text-blue-600 hover:underline ml-1">
              Know More...
            </Link>
          </p>

          <h2 className="text-xl font-semibold text-blue-800 mt-6 mb-2">We have added a host of new features!</h2>
          <p className="text-sm text-gray-800 mb-2">You can now do so much more:</p>
          <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
            <li>Anywhere access through Desktop or mobile</li>
            <li>Enhanced security measures</li>
          </ul>
        </div>
      </div>
    </div>
  )
}