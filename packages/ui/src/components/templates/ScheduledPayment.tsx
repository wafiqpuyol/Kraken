"use client"

import { useState } from "react"
import { Calendar } from "../atoms/Calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../atoms/Card"
import { Input } from "../atoms/Input"
import { Label } from "../atoms/Label"
import { Button } from "../atoms/Button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../molecules/Tabs"
import { format } from "date-fns"
import { CalendarIcon, Check, Clock } from "lucide-react"
import { cn } from "@/src/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "../molecules/Popover"
import { useSelectMultiple } from "react-day-picker"
import { ScrollArea, ScrollBar } from "../molecules/Scroll-area"

interface Transaction {
    id: string
    date: Date
    amount: number
    payee: string
    status: "pending" | "completed"
}

interface IScheduleTabProps {
    pendingTransactions: Transaction[],
    completedTransactions: Transaction[],
}

export const PaymentScheduler = () => {
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [amount, setAmount] = useState("")
    const [payee, setPayee] = useState("")
    const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([
        {
            id: "1",
            date: new Date(2025, 5, 15),
            amount: 250.0,
            payee: "Electric Company",
            status: "pending",
        },
        {
            id: "1",
            date: new Date(2025, 5, 15),
            amount: 250.0,
            payee: "Electric Company",
            status: "pending",
        },
        {
            id: "1",
            date: new Date(2025, 5, 15),
            amount: 250.0,
            payee: "Electric Company",
            status: "pending",
        },
        {
            id: "1",
            date: new Date(2025, 5, 15),
            amount: 250.0,
            payee: "Electric Company",
            status: "pending",
        },
        {
            id: "2",
            date: new Date(2025, 5, 20),
            amount: 1200.0,
            payee: "Rent Payment",
            status: "pending",
        },
    ])
    const [completedTransactions, setCompletedTransactions] = useState<Transaction[]>([
        {
            id: "3",
            date: new Date(2025, 5, 1),
            amount: 45.99,
            payee: "Internet Provider",
            status: "completed",
        },
        {
            id: "4",
            date: new Date(2025, 4, 28),
            amount: 120.5,
            payee: "Water Bill",
            status: "completed",
        },
    ])

    const handleSchedulePayment = () => {
        if (!date || !amount || !payee) return

        const newTransaction: Transaction = {
            id: Math.random().toString(36).substring(2, 9),
            date: date,
            amount: Number.parseFloat(amount),
            payee: payee,
            status: "pending",
        }

        setPendingTransactions([...pendingTransactions, newTransaction])
        setDate(undefined)
        setAmount("")
        setPayee("")
    }

    return (
        <div className="min-h-screen flex items-start  px-4 w-screen mt-20 gap-x-28">

            <div className="bg-white overflow-hidden">
                <Card className="w-full max-w-md relative   ">
                    <CardHeader className="mt-2 mb-5">
                        <CardTitle>Schedule a Payment</CardTitle>
                        <CardDescription className="text-slate-500">Set up your next payment by filling out the details below</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Payment Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn("w-full justify-start text-left font-normal", !date && "text-slate-500")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                                        {date ? format(date, "PPP") : "Select date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="bg-white rounded-2xl" />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="0.00"
                                    className="pl-8"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payee">Payee</Label>
                            <Input
                                id="payee"
                                placeholder="Enter payee number"
                                value={payee}
                                type="tel"
                                onChange={(e) => setPayee(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start">
                        <Button className="w-full mt-6 bg-purple-600 text-white" onClick={handleSchedulePayment} disabled={!date || !amount || !payee}>
                            Schedule Payment
                        </Button>
                    </CardFooter>
                </Card>

            </div>
            <ScheduleTab completedTransactions={completedTransactions} pendingTransactions={pendingTransactions} />
        </div>
    )
}

const ScheduleTab: React.FC<IScheduleTabProps> = ({ pendingTransactions, completedTransactions }) => {
    const [selectedTab, setSelectedTab] = useState("pending")
    return (
        <div className="bg-white px-4 rounded-lg shadow-md w-[560px] p-8">
            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-2 border h-[60px] px-4">
                    <TabsTrigger value="pending" onClick={() => setSelectedTab("pending")} className={cn("text-xl font-medium", selectedTab === "pending" ? "bg-purple-600 text-white" : "bg-white text-black/85")}>Pending</TabsTrigger>
                    <TabsTrigger value="completed" onClick={() => setSelectedTab("completed")} className={cn("text-xl font-medium", selectedTab === "completed" ? "bg-purple-600 text-white" : "bg-white text-black/85")}>Completed</TabsTrigger>
                </TabsList>
                <TabsContent value="pending" className="mt-4">
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle>Pending Transactions</CardTitle>
                            <CardDescription className="text-slate-500">Payments scheduled for the future</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {
                                pendingTransactions.length === 0 ?
                                    <div className="space-y-4 mt-5 h-[300px] w-full">
                                        <p className="text-center text-muted-foreground py-4">No pending transactions</p>
                                    </div>
                                    :
                                    <ScrollArea className="space-y-4 mt-5 h-[300px] w-full">
                                        {
                                            pendingTransactions.map((transaction) => (
                                                <div key={transaction.id} className="flex items-center justify-between border-b p-8 rounded-lg shadow-md">
                                                    <div>
                                                        <p className="font-medium">{transaction.payee}</p>
                                                        <p className="text-xs text-muted-foreground">{format(transaction.date, "PPP")}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium">${transaction.amount.toFixed(2)}</p>
                                                        <div className="flex items-center text-xs text-amber-600">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            Pending
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                        <ScrollBar orientation="vertical" />
                                    </ScrollArea>
                            }
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="pending" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Completed Transactions</CardTitle>
                            <CardDescription className="text-slate-500">Payments that have been processed</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {
                                pendingTransactions.length === 0 ?
                                    <div className="space-y-4 mt-5 h-[300px] w-full">
                                        <p className="text-center text-muted-foreground py-4">No completed transactions</p>
                                    </div>
                                    :
                                    <ScrollArea className="space-y-4 mt-5 h-[300px] w-full">
                                        {
                                            pendingTransactions.map((transaction) => (
                                                <div key={transaction.id} className="flex items-center justify-between border-b p-8 rounded-lg shadow-md">
                                                    <div>
                                                        <p className="font-medium">{transaction.payee}</p>
                                                        <p className="text-xs text-muted-foreground">{format(transaction.date, "PPP")}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium">${transaction.amount.toFixed(2)}</p>
                                                        <div className="flex items-center text-xs text-amber-600">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            Completed
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                        <ScrollBar orientation="vertical" />
                                    </ScrollArea>
                            }
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

//  

