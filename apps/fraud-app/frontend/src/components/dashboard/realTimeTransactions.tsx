"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/Card"
import { Badge } from "@repo/ui/Badge"
import { Button } from "@repo/ui/Button"
import { Input } from "@repo/ui/Input"
import {
    ArrowDownUp,
    ArrowUpDown,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Filter,
    Search,
    Shield,
    XCircle,
    AlertTriangle,
    Eye,
    ChevronDown,
    ChevronUp,
} from "lucide-react"
import { useToast } from "@repo/ui/useToast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/Table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/Dropdown"
import { Progress } from "@repo/ui/Progress"
import { useWSInstance, useWSActions, useBufferStore, useForcefullyDisconnect, useActiveTab } from "@/store/useTabs"
import { useTransaction } from "@/store/useTransactionStore"
import { realtimeTab, Transaction, TransactionStatus, TransactionType } from "@/types/index"
import { wsConnectionStatus } from "@/types/index"
import { cn } from "@/libs/utils"
import { useTransactionActions } from "@/store/useTransactionStore"


const waifq = [
    {
        "id": "59b6c70e-7f60-4896-877d-232e67f2ewrew",
        "userId": "11411380",
        "amount": 2100,
        "timestamp": "2025-05-21T19:53:56.119Z",
        "status": "Pending",
        "ipAddress": "127.0.0.1",
        "riskScore": 0,
        "location": "Bangladesh",
        "currency": "BDT",
        "userName": "wafiq",
        "type": "transfer"
    },
    {
        "id": "59b6c70e-7f60-4896-877d-232e67f2519f",
        "userId": "11411380",
        "amount": 2100,
        "timestamp": "2025-05-21T10:53:56.119Z",
        "status": "Pending",
        "ipAddress": "127.0.0.1",
        "riskScore": 0,
        "location": "Bangladesh",
        "currency": "BDT",
        "userName": "arjon",
        "type": "transfer"
    },
    {
        "id": "59b6c70e-7f60-4896-877d-232e67f2519g",
        "userId": "11411380",
        "amount": 2100,
        "timestamp": "2025-05-21T04:53:56.119Z",
        "status": "Pending",
        "ipAddress": "127.0.0.1",
        "riskScore": 0,
        "location": "Bangladesh",
        "currency": "BDT",
        "userName": "esam",
        "type": "transfer"
    },
]

export const RealTimeTransactions = () => {
    const wsInstance = useWSInstance()
    const bufferStore = useBufferStore()
    const { addTransaction } = useTransactionActions()
    const { setForcefullyDisconnect, setStoreInBufferStorage, setClearBufferStorage } = useWSActions()
    const transactionData = useTransaction()
    const isForcefullyDisconnect = useForcefullyDisconnect()
    const [connected, setConnected] = useState<boolean>(false)
    const [wsConnectionStatus, setWSConnectionStatus] = useState<wsConnectionStatus>("Disconnected")
    // const [transactions, setTransactions] = useState<Transaction[]>(transactionData)
    // const [transactions, setTransactions] = useState<Transaction[]>([])
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [sortField, setSortField] = useState<keyof Transaction>("timestamp")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
    const [newTransactionId, setNewTransactionId] = useState<string | null>(null)
    const { toast } = useToast()

    // console.log(transactions);
    console.log("COONECTED", connected);
    console.log(wsInstance);
    console.log(transactionData);
    console.log(wsConnectionStatus);



    useEffect(() => {
        handleWSConnectionStatus()
        return () => {
            setConnected(false)
            disconnectedToast()
        }
    }, [wsInstance, wsInstance?.ws.readyState])

    useEffect(() => {
        setLoading(false)
        if (isForcefullyDisconnect === false && bufferStore.realtime_transaction.length > 0) {
            console.log("1. SETTING STORE IN BUFFER STORAGE", bufferStore.realtime_transaction, isForcefullyDisconnect);
            // setFilteredTransactions((prev) => ([...bufferStore.realtime_transaction, ...prev]))
            bufferStore.realtime_transaction.forEach((trxn) => addTransaction(trxn))
            console.log("2. SETTING STORE IN BUFFER STORAGE", bufferStore.realtime_transaction, isForcefullyDisconnect);
            setClearBufferStorage("realtime_transaction")
        } else {
            console.log(" FORCEFULLY DISCONNECT", isForcefullyDisconnect, bufferStore.realtime_transaction.length);
            // setTransactions(transactionData)
            setFilteredTransactions(transactionData)
        }
    }, [transactionData, isForcefullyDisconnect])

    // Initialize socket and load initial data
    useEffect(() => {
        // setLoading(true)

        // Simulate initial data loading
        // setTimeout(() => {
        //     const initialTransactions = t
        //     setTransactions(initialTransactions)
        //     setFilteredTransactions(initialTransactions)
        //     setLoading(false)
        // }, 1500)

        const highlightNewTransaction = (transaction: Transaction) => {
            setNewTransactionId(transaction.id)

            // Clear the highlight after 3 seconds
            setTimeout(() => {
                setNewTransactionId(null)
            }, 3000)

            // Show toast for flagged transactions
            // if (transaction.status === "Flagged") {
            //     toast({
            //         title: "Flagged Transaction Detected",
            //         // description: `${transaction.type} of ${transaction.amount} ${transaction.currency} by ${transaction.userName}`,
            //         variant: "destructive",
            //     })
            // }
        }

        if (filteredTransactions.length > 0) highlightNewTransaction(filteredTransactions[0]!)
    }, [filteredTransactions.length])

    // Apply filters and sorting when transactions, search, or filters change
    useEffect(() => {
        let filtered = [...transactionData]

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(
                (tx) =>
                    tx.id.toLowerCase().includes(term) ||
                    tx.userName.toLowerCase().includes(term) ||
                    // tx.description.toLowerCase().includes(term) ||
                    tx.amount.toString().includes(term),
            )
        }

        // Apply status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter((tx) => tx.status === statusFilter)
        }

        // Apply sorting
        filtered.sort((a, b) => {
            const aValue = a[sortField]
            const bValue = b[sortField]

            if (sortField === "timestamp") {
                console.log("aValue", aValue, bValue);
                const aTime = (new Date(aValue as Date)).getTime()
                const bTime = (new Date(bValue as Date)).getTime()
                return sortDirection === "asc" ? aTime - bTime : bTime - aTime
            }

            if (typeof aValue === "number" && typeof bValue === "number") {
                return sortDirection === "asc" ? aValue - bValue : bValue - aValue
            }

            if (typeof aValue === "string" && typeof bValue === "string") {
                return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
            }

            return 0
        })

        setFilteredTransactions(filtered)
    }
        , [transactionData, searchTerm, statusFilter, sortField, sortDirection])

    // Handle WSConnectionStatus
    const handleWSConnectionStatus = () => {
        if (wsInstance) {
            const readyState = wsInstance.ws.readyState
            console.log("READY STATE ===>", readyState);
            switch (readyState) {
                case 0:
                    setWSConnectionStatus("Connecting")
                    setConnected(false)
                    break;
                case 1:
                    setWSConnectionStatus("Connected")
                    setConnected(true)
                    connectedToast()
                    break;
                case 2:
                    setWSConnectionStatus("Closing")
                    setConnected(false)
                    break;
                case 3:
                    setWSConnectionStatus("Disconnected")
                    setConnected(false)
                    disconnectedToast()
                    break;
            }
        }
        if (wsInstance === null) {
            setConnected(false)
            setWSConnectionStatus("Closed")
        }
    }

    // Toggle connection
    const toggleConnection = () => {
        if (connected) {
            setConnected(false)
            setWSConnectionStatus("Disconnected")
            setForcefullyDisconnect()
        } else {
            handleWSConnectionStatus()
            setForcefullyDisconnect()
        }
    }

    // Handle connection
    const connectedToast = () => {
        return toast({
            title: "Connected to transaction stream",
            description: "You are now receiving real-time transaction updates",
            variant: "default",
        })
    }
    const disconnectedToast = () => {
        return toast({
            title: "Disconnected from transaction stream",
            description: "Real-time updates paused",
            variant: "default",
        })
    }

    // Handle sort change
    const handleSort = (field: keyof Transaction) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("desc")
        }
    }

    // Format currency
    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount)
    }

    // Format date
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }).format(new Date(date))
    }

    // Get status badge
    const getStatusBadge = (status: TransactionStatus) => {
        switch (status) {
            case "Completed":
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                    </Badge>
                )
            case "Pending":
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                )
            case "Failed":
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        <XCircle className="h-3 w-3 mr-1" />
                        Failed
                    </Badge>
                )
            case "Flagged":
                return (
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Flagged
                    </Badge>
                )
            case "Reviewing":
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <Eye className="h-3 w-3 mr-1" />
                        Reviewing
                    </Badge>
                )
        }
    }

    // Get type badge
    const getTypeBadge = (type: TransactionType) => {
        switch (type) {
            case "deposit":
                return (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        <ArrowDownUp className="h-3 w-3 mr-1" />
                        Deposit
                    </Badge>
                )
            case "withdrawal":
                return (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        <ArrowDownUp className="h-3 w-3 mr-1 rotate-180" />
                        Withdrawal
                    </Badge>
                )
            case "transfer":
                return (
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                        <ArrowUpDown className="h-3 w-3 mr-1" />
                        Transfer
                    </Badge>
                )
            case "payment":
                return (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        <CreditCard className="h-3 w-3 mr-1" />
                        Payment
                    </Badge>
                )
            case "exchange":
                return (
                    <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Exchange
                    </Badge>
                )
        }
    }

    // Get risk level
    const getRiskLevel = (score: number) => {
        if (score < 30) return { level: "Low", color: "bg-green-500" }
        if (score < 70) return { level: "Medium", color: "bg-yellow-500" }
        return { level: "High", color: "bg-red-500" }
    }

    const formateTransactionId = (id: string) => {
        return id.split("-")[0]
    }

    // Get verification badge

    // const getVerificationBadge = (verification: Transaction["verification"]) => {
    //     switch (verification.status) {
    //         case "verified":
    //             return (
    //                 <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
    //                     <CheckCircle2 className="h-3 w-3 mr-1" />
    //                     Verified
    //                 </Badge>
    //             )
    //         case "unverified":
    //             return (
    //                 <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
    //                     <XCircle className="h-3 w-3 mr-1" />
    //                     Unverified
    //                 </Badge>
    //             )
    //         case "pending":
    //             return (
    //                 <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
    //                     <Clock className="h-3 w-3 mr-1" />
    //                     Pending
    //                 </Badge>
    //             )
    //         case "failed":
    //             return (
    //                 <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
    //                     <AlertTriangle className="h-3 w-3 mr-1" />
    //                     Failed
    //                 </Badge>
    //             )
    //     }
    // }

    return (
        // <Card className="col-span-full">
        //     <CardHeader className="flex flex-row items-center justify-between pb-2">
        //         <div className="space-y-1">
        //             <CardTitle className="text-2xl flex items-center gap-2">
        //                 <CreditCard className="h-5 w-5 text-blue-500" />
        //                 Real-Time Transaction Monitor
        //             </CardTitle>
        //             <CardDescription>Live monitoring of all user transactions across the platform</CardDescription>
        //         </div>
        //         <div className="flex items-center gap-2">
        //             <Button
        //                 variant={connected ? "default" : "outline"}
        //                 size="sm"
        //                 // onClick={toggleConnection}
        //                 className="flex items-center gap-1"
        //             >
        //                 {connected ? (
        //                     <>
        //                         <div className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
        //                         Connected
        //                     </>
        //                 ) : (
        //                     <>
        //                         <div className="w-2 h-2 rounded-full bg-gray-300 mr-1"></div>
        //                         Disconnected
        //                     </>
        //                 )}
        //             </Button>
        //             <Badge
        //                 variant="outline"
        //                 className={
        //                     connected ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"
        //                 }
        //             >
        //                 {connected ? (
        //                     <>
        //                         <div className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
        //                         Live
        //                     </>
        //                 ) : (
        //                     "Offline"
        //                 )}
        //             </Badge>
        //         </div>
        //     </CardHeader>
        //     <CardContent>
        //         <div className="space-y-4">
        //             {transactions.map((transaction) => (
        //                 <div key={transaction.id} className="flex flex-col items-center justify-center text-center text-muted-foreground">
        //                     <CreditCard className="h-12 w-12 mb-2 text-gray-300" />
        //                     <p className="text-sm text-gray-500">ID: {transaction.id}</p>
        //                 </div>
        //             ))}
        //         </div>
        //     </CardContent>
        // </Card>


        // --------------------------------------------------------------------------------------------------------------------------------------------------
        // --------------------------------------------------------------------------------------------------------------------------------------------------
        // --------------------------------------------------------------------------------------------------------------------------------------------------


        <Card className="col-span-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-blue-500" />
                        Real-Time Transaction Monitor
                    </CardTitle>
                    <CardDescription>Live monitoring of all user transactions across the platform</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={connected ? "default" : "outline"}
                        size="sm"
                        onClick={toggleConnection}
                        disabled={
                            // "Disconnected" | "Connecting" | "Connected" | "Closing" | "Closed"
                            wsConnectionStatus === "Connecting" ||
                            wsConnectionStatus === "Closed" ||
                            wsConnectionStatus === "Closing"
                        }
                        className={cn("flex items-center gap-1",
                            (wsConnectionStatus === "Connecting" ||
                                wsConnectionStatus === "Closed" ||
                                wsConnectionStatus === "Closing") && "cursor-not-allowed")}
                    >
                        <div
                            className={cn("w-2 h-2 rounded-full mr-1",
                                wsConnectionStatus === "Disconnected" && "bg-gray-300",
                                wsConnectionStatus === "Connecting" && "bg-yellow-500",
                                wsConnectionStatus === "Closing" && "bg-red-500",
                                wsConnectionStatus === "Connected" && "bg-green-500 animate-pulse",
                            )}
                        ></div>
                        {wsConnectionStatus}
                    </Button>
                    <Badge
                        variant="outline"
                        className={
                            connected ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"
                        }
                    >
                        {connected ? (
                            <>
                                <div className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
                                Live
                            </>
                        ) : (
                            "Offline"
                        )}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Filters and search */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                type="search"
                                placeholder="Search transactions..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                                        <Filter className="h-4 w-4" />
                                        Status
                                        <ChevronDown className="h-3 w-3 ml-1" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Statuses</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter("completed")}>Completed</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter("failed")}>Failed</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter("flagged")}>Flagged</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter("reviewing")}>Reviewing</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Transaction table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[180px]">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex items-center gap-1 -ml-3 font-medium"
                                            onClick={() => handleSort("timestamp")}
                                        >
                                            Timestamp
                                            {sortField === "timestamp" &&
                                                (sortDirection === "asc" ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                ))}
                                        </Button>
                                    </TableHead>
                                    <TableHead className="w-[100px]">ID</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex items-center gap-1 -ml-3 font-medium"
                                            onClick={() => handleSort("amount")}
                                        >
                                            Amount
                                            {sortField === "amount" &&
                                                (sortDirection === "asc" ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                ))}
                                        </Button>
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex items-center gap-1 -ml-3 font-medium"
                                            onClick={() => handleSort("riskScore")}
                                        >
                                            Risk
                                            {sortField === "riskScore" &&
                                                (sortDirection === "asc" ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                ))}
                                        </Button>
                                    </TableHead>
                                    <TableHead>Location</TableHead>
                                    {/* <TableHead>Verification</TableHead> */}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    // Loading skeleton
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i} className="animate-pulse">
                                            <TableCell>
                                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-6 bg-gray-200 rounded w-20"></div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-4 bg-gray-200 rounded w-12"></div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-6 bg-gray-200 rounded w-20"></div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
                                                <Shield className="h-12 w-12 mb-2 text-gray-300" />
                                                <p>No transactions found</p>
                                                <p className="text-sm text-gray-500">Try adjusting your filters</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTransactions.map((transaction) => (
                                        <TableRow
                                            key={transaction.id}
                                            className={`${newTransactionId === transaction.id ? "bg-blue-50 animate-fadeIn" : ""} ${selectedTransaction?.id === transaction.id ? "bg-gray-50" : ""}`}
                                            onClick={() => setSelectedTransaction(transaction)}
                                        >
                                            <TableCell className="font-mono text-xs">{formatDate(transaction.timestamp)}</TableCell>
                                            <TableCell className="font-mono text-xs">TXN-{formateTransactionId(transaction.id)}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{transaction.userName}</span>
                                                    <span className="text-xs text-gray-500">{transaction.userId}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatCurrency(transaction.amount, transaction.currency)}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${getRiskLevel(transaction.riskScore).color}`}></div>
                                                    <span className="text-xs">{transaction.riskScore}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium">{transaction.location.split(",")[0]}</span>
                                                    <span className="text-xs text-gray-500">{transaction.ipAddress}</span>
                                                </div>
                                            </TableCell>
                                            {/* <TableCell>
                                                {getVerificationBadge(transaction.verification)}
                                                <span className="text-xs text-gray-500 block mt-1">{transaction.verification.method}</span>
                                            </TableCell> */}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Transaction details */}
                    {selectedTransaction && (
                        <div className="border rounded-lg p-4 mt-4">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-blue-500" />
                                        Transaction Details
                                    </h3>
                                    <p className="text-sm text-gray-500">ID: {selectedTransaction.id}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(selectedTransaction.status)}
                                    {getTypeBadge(selectedTransaction.type as TransactionType)}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium mb-1">Basic Information</h4>
                                        <div className="bg-gray-50 p-3 rounded-md space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">Amount</span>
                                                <span className="text-sm font-medium">
                                                    {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">Date & Time</span>
                                                <span className="text-sm">{formatDate(selectedTransaction.timestamp)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">Description</span>
                                                <span className="text-sm">{"ajdsiausoaue8audhjasdasoduad8ea8us8e9a"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium mb-1">User Information</h4>
                                        <div className="bg-gray-50 p-3 rounded-md space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">Name</span>
                                                <span className="text-sm font-medium">{selectedTransaction.userName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">User ID</span>
                                                <span className="text-sm">{selectedTransaction.userId}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">Location</span>
                                                <span className="text-sm">{selectedTransaction.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium mb-1">Transaction Details</h4>
                                        <div className="bg-gray-50 p-3 rounded-md space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">Source</span>
                                                <span className="text-sm">{"fuck"}</span>
                                                {/* <span className="text-sm">{selectedTransaction.source.details}</span> */}
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">Destination</span>
                                                <span className="text-sm">{"fuck"}</span>
                                                {/* <span className="text-sm">{selectedTransaction.destination.details}</span> */}
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">IP Address</span>
                                                <span className="text-sm">{selectedTransaction.ipAddress}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">Device</span>
                                                <span className="text-sm">{selectedTransaction.device}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium mb-1">Risk Assessment</h4>
                                        <div className="bg-gray-50 p-3 rounded-md space-y-3">
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span>Risk Score</span>
                                                    <span className="font-medium">
                                                        {selectedTransaction.riskScore}/100 ({getRiskLevel(selectedTransaction.riskScore).level})
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={selectedTransaction.riskScore}
                                                    className="h-2"
                                                    indicatorClassName={
                                                        selectedTransaction.riskScore < 30
                                                            ? "bg-green-500"
                                                            : selectedTransaction.riskScore < 70
                                                                ? "bg-yellow-500"
                                                                : "bg-red-500"
                                                    }
                                                />
                                            </div>

                                            {selectedTransaction?.flags?.length > 0 && (
                                                <div className="pt-2">
                                                    <span className="text-xs font-medium mb-1 block">Flags:</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {selectedTransaction?.flags?.map((flag, index) => (
                                                            <Badge
                                                                key={index}
                                                                variant="outline"
                                                                className="bg-red-50 text-red-700 border-red-200 text-xs"
                                                            >
                                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                                {flag
                                                                    .split("_")
                                                                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                                    .join(" ")}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium mb-1">Verification</h4>
                                        <div className="bg-gray-50 p-3 rounded-md space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">Method</span>
                                                {/* <span className="text-sm font-medium">
                                                    {selectedTransaction.verification.method.charAt(0).toUpperCase() +
                                                        selectedTransaction.verification.method.slice(1)}
                                                </span> */}
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">Verification Status</span>
                                                {/* <span className="text-sm">{getVerificationBadge(selectedTransaction.verification)}</span> */}
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">Verification Details</span>
                                                {/* <span className="text-sm">{selectedTransaction.verification.details}</span> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t">
                                <Button variant="outline" size="sm" onClick={() => setSelectedTransaction(null)}>
                                    Close
                                </Button>
                                {selectedTransaction.status === "Flagged" && (
                                    <Button variant="default" size="sm">
                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                        Review Transaction
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}