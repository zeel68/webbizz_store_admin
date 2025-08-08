"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Download,
    Filter,
    UserPlus,
    Search,
    X,
    Calendar,
    ChevronsLeft,
    ChevronsRight,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { useCustomerStore } from "@/store/customerStore"
import { CustomersTable } from "@/components/dashboard/customer/customer-table"

// Define the Customer interface
interface Customer {
    _id: string
    name: string
    email: string
    phone: string
    created_at: string
    status: "active" | "inactive"
}

interface CustomerFilterState {
    search: string
    status: string
    date_from: string
    date_to: string
    sort: string
    order: string
}

export default function CustomersPage() {
    const { customerInfo, loading, fetchCustomers, error } = useCustomerStore()

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(20)
    const [showFilters, setShowFilters] = useState(false)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

    const [filters, setFilters] = useState<CustomerFilterState>({
        search: "",
        status: "all",
        date_from: "",
        date_to: "",
        sort: "created_at",
        order: "desc",
    })

    const [appliedFilters, setAppliedFilters] = useState<CustomerFilterState>({ ...filters })

    // Debounced search
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (filters.search !== appliedFilters.search) {
                setAppliedFilters((prev) => ({ ...prev, search: filters.search }))
            }
        }, 500)

        return () => clearTimeout(timeout)
    }, [filters.search, appliedFilters.search])

    // Apply other filters
    useEffect(() => {
        const nonSearchFilters = { ...filters, search: appliedFilters.search }
        if (JSON.stringify(nonSearchFilters) !== JSON.stringify(appliedFilters)) {
            setAppliedFilters(nonSearchFilters)
        }
    }, [filters.status, filters.date_from, filters.date_to, filters.sort, filters.order])

    // Fetch customers
    useEffect(() => {
        fetchCustomers({
            page: currentPage,
            limit: itemsPerPage,
            ...appliedFilters,
        })
    }, [appliedFilters, currentPage, itemsPerPage])

    useEffect(() => {
        setCurrentPage(1)
    }, [appliedFilters])

    const updateFilter = (key: keyof CustomerFilterState, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        const reset = {
            search: "",
            status: "all",
            date_from: "",
            date_to: "",
            sort: "created_at",
            order: "desc",
        }
        setFilters(reset)
        setAppliedFilters(reset)
    }

    const hasActiveFilters = () =>
        appliedFilters.search ||
        appliedFilters.status !== "all" ||
        appliedFilters.date_from ||
        appliedFilters.date_to ||
        appliedFilters.sort !== "created_at" ||
        appliedFilters.order !== "desc"

    const totalItems = customerInfo?.pagination?.total ?? 0
    const totalPages = customerInfo?.pagination?.pages ?? 0
    const hasPrev = customerInfo?.pagination?.hasPrev ?? false
    const hasNext = customerInfo?.pagination?.hasNext ?? false

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    const getPaginationNumbers = () => {
        const delta = 2
        const range = []
        const rangeWithDots = []

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i)
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, "...")
        } else {
            rangeWithDots.push(1)
        }

        rangeWithDots.push(...range)

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push("...", totalPages)
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages)
        }

        return rangeWithDots
    }

    if (error) {
        return (
            <div className="flex h-full items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                    <p className="text-muted-foreground">Manage your customer base and relationships</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant={showFilters ? "default" : "outline"} size="sm" onClick={() => setShowFilters(!showFilters)}>
                        <Filter className="mr-2 h-4 w-4" />
                        {showFilters ? "Hide Filters" : "Show Filters"}
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Customer
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>All Customers</span>
                        {hasActiveFilters() && (
                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                                <X className="mr-2 h-4 w-4" />
                                Clear Filters
                            </Button>
                        )}
                    </CardTitle>
                    <CardDescription>
                        View and manage all customers
                        {hasActiveFilters() && ` (${totalItems} filtered results)`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Search and Sort */}
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search by name, email, or phone..."
                                value={filters.search}
                                onChange={(e) => updateFilter("search", e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={filters.sort} onValueChange={(value) => updateFilter("sort", value)}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="created_at">Date Created</SelectItem>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filters.order} onValueChange={(value) => updateFilter("order", value)}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="desc">Descending</SelectItem>
                                <SelectItem value="asc">Ascending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="text-sm font-medium">Status</label>
                                <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium flex items-center">
                                    <Calendar className="mr-1 h-4 w-4" /> Date From
                                </label>
                                <Input
                                    type="date"
                                    value={filters.date_from}
                                    onChange={(e) => updateFilter("date_from", e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium flex items-center">
                                    <Calendar className="mr-1 h-4 w-4" /> Date To
                                </label>
                                <Input type="date" value={filters.date_to} onChange={(e) => updateFilter("date_to", e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* Table */}

                    <CustomersTable customers={customerInfo?.customers || []} isLoading={loading} />

                    {/* Pagination */}
                    {totalItems > 0 && (
                        <div className="flex items-center justify-between mt-6">
                            <div className="flex items-center space-x-2">
                                <p className="text-sm text-muted-foreground">
                                    Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                                    {totalItems} customers
                                </p>
                                <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                                    <SelectTrigger className="w-20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={!hasPrev}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                <div className="flex items-center space-x-1">
                                    {getPaginationNumbers().map((num, idx) =>
                                        num === "..." ? (
                                            <span key={idx} className="px-2 text-sm text-muted-foreground">
                                                ...
                                            </span>
                                        ) : (
                                            <Button
                                                key={num}
                                                size="sm"
                                                variant={currentPage === num ? "default" : "outline"}
                                                onClick={() => handlePageChange(num as number)}
                                            >
                                                {num}
                                            </Button>
                                        ),
                                    )}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={!hasNext}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {totalItems === 0 && !loading && (
                        <div className="text-center py-8 text-muted-foreground">
                            {hasActiveFilters() ? "No customers found matching your criteria" : "No customers available"}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Dialog */}
            {/*<CreateCustomerDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />*/}
        </div>
    )
}
