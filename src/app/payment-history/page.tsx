"use client"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, XCircle, Clock, CreditCard, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

const paymentHistory = [
    {
        id: "PAY-001",
        date: "2024-01-15",
        time: "2:30 PM",
        amount: 29.99,
        method: "Visa ••42",
        status: "completed",
        description: "Monthly Subscription",
    },
    {
        id: "PAY-002",
        date: "2024-01-01",
        time: "10:15 AM",
        amount: 99.99,
        method: "MC ••88",
        status: "completed",
        description: "Annual Plan",
    },
    {
        id: "PAY-003",
        date: "2023-12-15",
        time: "2:30 PM",
        amount: 29.99,
        method: "Visa ••42",
        status: "failed",
        description: "Monthly Subscription",
    },
    {
        id: "PAY-004",
        date: "2023-12-01",
        time: "4:45 PM",
        amount: 49.99,
        method: "PayPal",
        status: "pending",
        description: "Premium Features",
    },
    {
        id: "PAY-005",
        date: "2023-11-15",
        time: "2:30 PM",
        amount: 29.99,
        method: "Visa ••42",
        status: "completed",
        description: "Monthly Subscription",
    },
    {
        id: "PAY-006",
        date: "2023-11-01",
        time: "1:20 PM",
        amount: 19.99,
        method: "Apple Pay",
        status: "completed",
        description: "Add-on Purchase",
    },
    {
        id: "PAY-007",
        date: "2023-10-15",
        time: "3:15 PM",
        amount: 29.99,
        method: "Visa ••42",
        status: "failed",
        description: "Monthly Subscription",
    },
]

const getStatusIcon = (status: string) => {
    switch (status) {
        case "completed":
            return <CheckCircle className="h-3 w-3 text-green-500" />
        case "failed":
            return <XCircle className="h-3 w-3 text-red-500" />
        case "pending":
            return <Clock className="h-3 w-3 text-yellow-500" />
        default:
            return <Clock className="h-3 w-3 text-gray-500" />
    }
}

const getStatusBadge = (status: string) => {
    const variants = {
        completed: "bg-green-100 text-green-700 border-green-200",
        failed: "bg-red-100 text-red-700 border-red-200",
        pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    }

    return (
        <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${variants[status as keyof typeof variants]}`}>
            {status}
        </Badge>
    )
}

export default function Component() {
    const router = useRouter()

    return (
        <div className="w-full p-4">
            <div className="flex items-center gap-2">
                <button className="mr-2 p-2 rounded-full bg-[#2b2b2b]" onClick={() => router.back()}>
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold text-white">Payment Histroy</h1>
            </div>

            <div className="border rounded-lg mt-8">
                <ScrollArea className="w-full overflow-x-auto">
                    <div className="min-w-full sm:min-w-[640px]">

                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className=" text-xs font-medium">Date</TableHead>
                                    <TableHead className=" text-xs font-medium ">Amount</TableHead>
                                    <TableHead className=" text-xs font-medium">Method</TableHead>
                                    <TableHead className=" text-xs font-medium">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paymentHistory.map((payment) => (
                                    <TableRow key={payment.id} className="hover:bg-muted/50">
                                        <TableCell className="py-3 min-w-[140px]">
                                            <div className="text-xs">
                                                <div className="font-medium">{payment.date}</div>
                                                <div className="text-muted-foreground text-[10px]">{payment.time}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3  min-w-[100px]">
                                            <div className="text-sm font-semibold">${payment.amount}</div>
                                        </TableCell>
                                        <TableCell className="py-3 min-w-[120px]">
                                            <div className="text-xs truncate">{payment.method}</div>
                                        </TableCell>
                                        <TableCell className="py-3 min-w-[120px]">
                                            <div className="flex items-center gap-1">{getStatusIcon(payment.status)}{getStatusBadge(payment.status)}</div>
                                        </TableCell>
                                    </TableRow>

                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </ScrollArea>
            </div>

            <div className="mt-4 text-xs text-muted-foreground text-center">Swipe horizontally to view all columns</div>
        </div>
    )
}
