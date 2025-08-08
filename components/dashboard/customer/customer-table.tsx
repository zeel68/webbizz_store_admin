"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { MoreHorizontal, Edit, Trash2, Eye, Mail, Phone } from "lucide-react"

import { formatDistanceToNow } from "date-fns"
import { useCustomerStore } from "@/store/customerStore"

interface Customer {
    _id: string
    name: string
    email: string
    phone?: string
    phone_number?: string
    address?: string
    total_orders?: number
    total_spent?: number
    status: "active" | "inactive"
    created_at: string
    updated_at: string
}

interface CustomersTableProps {
    customers: Customer[]
    isLoading: boolean
}

export function CustomersTable({ customers, isLoading }: CustomersTableProps) {
    const { updateCustomer, deleteCustomer } = useCustomerStore()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleStatusChange = async (customerId: string, newStatus: "active" | "inactive") => {
        try {
            await updateCustomer(customerId, { status: newStatus })
        } catch (error) {
            console.error("Failed to update customer status:", error)
        }
    }

    const handleDelete = async (customerId: string) => {
        if (confirm("Are you sure you want to delete this customer?")) {
            setDeletingId(customerId)
            try {
                await deleteCustomer(customerId)
            } catch (error) {
                console.error("Failed to delete customer:", error)
            } finally {
                setDeletingId(null)
            }
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-8 w-8" />
                    </div>
                ))}
            </div>
        )
    }

    if (customers.length === 0) {
        return <div className="text-center py-8 text-muted-foreground">No customers found</div>
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.map((customer) => (
                        <TableRow key={customer._id}>
                            <TableCell>
                                <div className="flex items-center space-x-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={`https://avatar.vercel.sh/₹{customer.email}`} />
                                        <AvatarFallback>
                                            {customer.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{customer.name}</div>
                                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="flex items-center text-sm">
                                        <Mail className="h-3 w-3 mr-1" />
                                        {customer.email}
                                    </div>
                                    {(customer.phone || customer.phone_number) && (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Phone className="h-3 w-3 mr-1" />
                                            {customer.phone || customer.phone_number}
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">{customer.total_orders || 0}</div>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">₹{(customer.total_spent || 0).toFixed(2)}</div>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={customer.status === "active" ? "default" : "secondary"}
                                    className="cursor-pointer"
                                    onClick={() => handleStatusChange(customer._id, customer.status === "active" ? "inactive" : "active")}
                                >
                                    {customer.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(new Date(customer.created_at), { addSuffix: true })}
                                </div>
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Customer
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() => handleDelete(customer._id)}
                                            disabled={deletingId === customer._id}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            {deletingId === customer._id ? "Deleting..." : "Delete"}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
