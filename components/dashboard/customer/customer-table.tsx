"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { MoreHorizontal, Eye, Edit, Trash2, Mail, Phone, Calendar, MapPin, ShoppingBag } from "lucide-react"
import { formatRelativeTime, getInitials, getStatusColor } from "@/lib/utils"

interface Customer {
    _id: string
    name: string
    email: string
    phone?: string
    created_at: string
    status: "active" | "inactive"
    total_orders?: number
    total_spent?: number
    last_order_date?: string
    address?: {
        city?: string
        country?: string
    }
    profile_image?: string
}

interface CustomersTableProps {
    customers: Customer[]
    isLoading: boolean
    onView?: (customer: Customer) => void
    onEdit?: (customer: Customer) => void
    onDelete?: (customer: Customer) => void
}

export function CustomersTable({ customers, isLoading, onView, onEdit, onDelete }: CustomersTableProps) {
    const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedCustomers(customers.map((customer) => customer._id))
        } else {
            setSelectedCustomers([])
        }
    }

    const handleSelectCustomer = (customerId: string, checked: boolean) => {
        if (checked) {
            setSelectedCustomers((prev) => [...prev, customerId])
        } else {
            setSelectedCustomers((prev) => prev.filter((id) => id !== customerId))
        }
    }

    const getStatusBadge = (status: string) => {
        const colorClass = getStatusColor(status)
        return (
            <Badge variant="secondary" className={`${colorClass} border-0 font-medium`}>
                {status}
            </Badge>
        )
    }

    if (isLoading) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                                <Skeleton className="h-4 w-4" />
                            </TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Orders</TableHead>
                            <TableHead>Total Spent</TableHead>
                            <TableHead>Last Order</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <Skeleton className="h-4 w-4" />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-3">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-6 w-16" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-8" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-20" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-24" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-20" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-8 w-8" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }

    if (customers.length === 0) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Orders</TableHead>
                            <TableHead>Total Spent</TableHead>
                            <TableHead>Last Order</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                                <div className="flex flex-col items-center space-y-2">
                                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                                    <p className="text-muted-foreground">No customers found</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">
                            <input
                                type="checkbox"
                                checked={selectedCustomers.length === customers.length}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                        </TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Last Order</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="w-12"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.map((customer) => (
                        <TableRow key={customer._id} className="hover:bg-muted/50">
                            <TableCell>
                                <input
                                    type="checkbox"
                                    checked={selectedCustomers.includes(customer._id)}
                                    onChange={(e) => handleSelectCustomer(customer._id, e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                            </TableCell>

                            <TableCell>
                                <div className="flex items-center space-x-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={customer.profile_image || "/placeholder.svg"} alt={customer.name} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                            {getInitials(customer.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <p className="font-medium leading-none">{customer.name}</p>
                                        {customer.address?.city && (
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {customer.address.city}
                                                {customer.address.country && `, ${customer.address.country}`}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="space-y-1">
                                    <div className="flex items-center text-sm">
                                        <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                                        <span className="truncate max-w-[200px]" title={customer.email}>
                                            {customer.email}
                                        </span>
                                    </div>
                                    {customer.phone && (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Phone className="h-3 w-3 mr-2" />
                                            <span>{customer.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </TableCell>

                            <TableCell>{getStatusBadge(customer.status)}</TableCell>

                            <TableCell>
                                <div className="flex items-center">
                                    <ShoppingBag className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span className="font-medium">{customer.total_orders || 0}</span>
                                </div>
                            </TableCell>

                            <TableCell>
                                <span className="font-medium">${(customer.total_spent || 0).toFixed(2)}</span>
                            </TableCell>

                            <TableCell>
                                {customer.last_order_date ? (
                                    <div className="flex items-center text-sm">
                                        <Calendar className="h-3 w-3 mr-2 text-muted-foreground" />
                                        <span>{formatRelativeTime(customer.last_order_date)}</span>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground text-sm">No orders</span>
                                )}
                            </TableCell>

                            <TableCell>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="h-3 w-3 mr-2" />
                                    <span>{formatRelativeTime(customer.created_at)}</span>
                                </div>
                            </TableCell>

                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />

                                        {onView && (
                                            <DropdownMenuItem onClick={() => onView(customer)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                        )}

                                        {onEdit && (
                                            <DropdownMenuItem onClick={() => onEdit(customer)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Customer
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuItem onClick={() => window.open(`mailto:${customer.email}`, "_blank")}>
                                            <Mail className="mr-2 h-4 w-4" />
                                            Send Email
                                        </DropdownMenuItem>

                                        {customer.phone && (
                                            <DropdownMenuItem onClick={() => window.open(`tel:${customer.phone}`, "_blank")}>
                                                <Phone className="mr-2 h-4 w-4" />
                                                Call Customer
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuSeparator />

                                        {onDelete && (
                                            <DropdownMenuItem
                                                onClick={() => onDelete(customer)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Customer
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Bulk Actions */}
            {selectedCustomers.length > 0 && (
                <div className="border-t bg-muted/50 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {selectedCustomers.length} customer{selectedCustomers.length > 1 ? "s" : ""} selected
                        </p>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                                Export Selected
                            </Button>
                            <Button variant="outline" size="sm">
                                Send Email
                            </Button>
                            <Button variant="destructive" size="sm">
                                Delete Selected
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
