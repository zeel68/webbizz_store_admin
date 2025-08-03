"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, Download, X, Calendar, Package } from "lucide-react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { useProductStore } from "@/store/productStore"
import { ProductsTable } from "@/components/dashboard/product/products-table"




interface FilterState {
    search: string
    category: string
    status: string
    stock_level: string
    price_min: string
    price_max: string
    date_from: string
    date_to: string
    sort: string
    order: string
}

export default function ProductsPage() {
    // const { products, productsLoading, error, fetchProducts } = useStoreAdminStore()
    const { productInfo, fetchProducts, error, loading } = useProductStore();
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(20)
    const [showFilters, setShowFilters] = useState(false)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<iProduct | null>(null)
    // let products = productsInfo
    const [filters, setFilters] = useState<FilterState>({
        search: "",
        category: "all",
        status: "all",
        stock_level: "all",
        price_min: "",
        price_max: "",
        date_from: "",
        date_to: "",
        sort: "created_at",
        order: "desc",
    })

    const [appliedFilters, setAppliedFilters] = useState<FilterState>({
        search: "",
        category: "all",
        status: "all",
        stock_level: "all",
        price_min: "",
        price_max: "",
        date_from: "",
        date_to: "",
        sort: "created_at",
        order: "desc",
    })

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (filters.search !== appliedFilters.search) {
                setAppliedFilters((prev) => ({ ...prev, search: filters.search }))
            }
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [filters.search, appliedFilters.search])

    // Apply filters immediately for non-search fields
    useEffect(() => {
        const nonSearchFilters = {
            category: filters.category,
            status: filters.status,
            stock_level: filters.stock_level,
            price_min: filters.price_min,
            price_max: filters.price_max,
            date_from: filters.date_from,
            date_to: filters.date_to,
            sort: filters.sort,
            order: filters.order,
        }

        const nonSearchApplied = {
            category: appliedFilters.category,
            status: appliedFilters.status,
            stock_level: appliedFilters.stock_level,
            price_min: appliedFilters.price_min,
            price_max: appliedFilters.price_max,
            date_from: appliedFilters.date_from,
            date_to: appliedFilters.date_to,
            sort: appliedFilters.sort,
            order: appliedFilters.order,
        }

        if (JSON.stringify(nonSearchFilters) !== JSON.stringify(nonSearchApplied)) {
            setAppliedFilters((prev) => ({ ...prev, ...nonSearchFilters }))
        }
    }, [
        filters.category,
        filters.status,
        filters.stock_level,
        filters.price_min,
        filters.price_max,
        filters.date_from,
        filters.date_to,
        filters.sort,
        filters.order,
    ])

    // Fetch products when applied filters or pagination changes
    useEffect(() => {
        const queryParams = {
            page: currentPage,
            limit: itemsPerPage,
            sortBy: appliedFilters.sort,
            sortOrder: appliedFilters.order,
            category: appliedFilters.category !== "all" ? appliedFilters.category : undefined,
            minPrice: appliedFilters.price_min || undefined,
            maxPrice: appliedFilters.price_max || undefined,
            // Note: API doesn't seem to support search by name directly,
            // you may need to add this functionality to the backend
            // or implement client-side filtering for now
        }

        // Filter out undefined values
        const cleanParams = Object.fromEntries(Object.entries(queryParams).filter(([_, value]) => value !== undefined))

        fetchProducts(cleanParams)


    }, [appliedFilters, currentPage, itemsPerPage, fetchProducts])

    const updateFilter = (key: keyof FilterState, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        const defaultFilters = {
            search: "",
            category: "all",
            status: "all",
            stock_level: "all",
            price_min: "",
            price_max: "",
            date_from: "",
            date_to: "",
            sort: "created_at",
            order: "desc",
        }
        setFilters(defaultFilters)
        setAppliedFilters(defaultFilters)
    }

    const hasActiveFilters = () => {
        return (
            appliedFilters.search ||
            appliedFilters.category !== "all" ||
            appliedFilters.status !== "all" ||
            appliedFilters.stock_level !== "all" ||
            appliedFilters.price_min ||
            appliedFilters.price_max ||
            appliedFilters.date_from ||
            appliedFilters.date_to ||
            appliedFilters.sort !== "created_at" ||
            appliedFilters.order !== "desc"
        )
    }

    const totalItems = productInfo?.pagination?.total ?? 0
    const totalPages = productInfo?.pagination?.totalPages ?? 0
    const hasNext = productInfo?.pagination?.hasNext ?? false
    const hasPrev = productInfo?.pagination?.hasPrev ?? false

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

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [appliedFilters])

    // Handle edit product
    const handleEditProduct = (product: iProduct) => {
        setSelectedProduct(product)
        setIsEditDialogOpen(true)
    }

    // Handle edit dialog close
    const handleEditDialogClose = (open: boolean) => {
        setIsEditDialogOpen(open)
        if (!open) {
            setSelectedProduct(null)
        }
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
                        <Button onClick={() => window.location.reload()} className="mt-4">
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground">Manage your store's product inventory</p>
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
                    <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gradient-to-r from-primary to-primary/80">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                </div>
            </div>

            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>All Products</span>
                        {hasActiveFilters() && (
                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                                <X className="mr-2 h-4 w-4" />
                                Clear Filters
                            </Button>
                        )}
                    </CardTitle>
                    <CardDescription>
                        View and manage all products in your store
                        {hasActiveFilters() && ` (${totalItems} filtered results)`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Basic Search and Sort */}
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search by product name, SKU, or description..."
                                value={filters.search}
                                onChange={(e) => updateFilter("search", e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filters.sort} onValueChange={(value) => updateFilter("sort", value)}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="created_at">Date Created</SelectItem>
                                <SelectItem value="updated_at">Date Updated</SelectItem>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="price">Price</SelectItem>
                                <SelectItem value="stock.quantity">Stock</SelectItem>
                                <SelectItem value="category">Category</SelectItem>
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

                    {/* Advanced Filters */}
                    {showFilters && (
                        <Card className="mb-6 border-dashed">
                            <CardHeader>
                                <CardTitle className="text-lg">Advanced Filters</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Category and Status Filters */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Category</label>
                                        <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Categories" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Categories</SelectItem>
                                                <SelectItem value="electronics">Electronics</SelectItem>
                                                <SelectItem value="clothing">Clothing</SelectItem>
                                                <SelectItem value="home">Home & Garden</SelectItem>
                                                <SelectItem value="books">Books</SelectItem>
                                                <SelectItem value="sports">Sports</SelectItem>
                                                <SelectItem value="health">Health & Beauty</SelectItem>
                                                <SelectItem value="toys">Toys & Games</SelectItem>
                                                <SelectItem value="automotive">Automotive</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Status</label>
                                        <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Statuses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Statuses</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Stock Level and Price Range */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center">
                                            <Package className="mr-1 h-4 w-4" />
                                            Stock Level
                                        </label>
                                        <Select value={filters.stock_level} onValueChange={(value) => updateFilter("stock_level", value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Stock Levels" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Stock Levels</SelectItem>
                                                <SelectItem value="in_stock">In Stock</SelectItem>
                                                <SelectItem value="low_stock">Low Stock (&lt;10)</SelectItem>
                                                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                                <SelectItem value="high_stock">High Stock (&gt;100)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Min Price</label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={filters.price_min}
                                            onChange={(e) => updateFilter("price_min", e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Max Price</label>
                                        <Input
                                            type="number"
                                            placeholder="9999.99"
                                            value={filters.price_max}
                                            onChange={(e) => updateFilter("price_max", e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Date Range */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center">
                                            <Calendar className="mr-1 h-4 w-4" />
                                            Date From
                                        </label>
                                        <Input
                                            type="date"
                                            value={filters.date_from}
                                            onChange={(e) => updateFilter("date_from", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center">
                                            <Calendar className="mr-1 h-4 w-4" />
                                            Date To
                                        </label>
                                        <Input
                                            type="date"
                                            value={filters.date_to}
                                            onChange={(e) => updateFilter("date_to", e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Applied Filters Indicator */}
                                {hasActiveFilters() && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm text-muted-foreground mb-2">Active Filters:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {appliedFilters.search && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs">
                                                    Search: "{appliedFilters.search}"
                                                </span>
                                            )}
                                            {appliedFilters.category !== "all" && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs">
                                                    Category: {appliedFilters.category}
                                                </span>
                                            )}
                                            {appliedFilters.status !== "all" && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-yellow-50 text-yellow-700 text-xs">
                                                    Status: {appliedFilters.status}
                                                </span>
                                            )}
                                            {appliedFilters.stock_level !== "all" && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs">
                                                    Stock: {appliedFilters.stock_level}
                                                </span>
                                            )}
                                            {appliedFilters.price_min && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-50 text-red-700 text-xs">
                                                    Min Price: ${appliedFilters.price_min}
                                                </span>
                                            )}
                                            {appliedFilters.price_max && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-50 text-red-700 text-xs">
                                                    Max Price: ${appliedFilters.price_max}
                                                </span>
                                            )}
                                            {appliedFilters.date_from && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs">
                                                    From: {appliedFilters.date_from}
                                                </span>
                                            )}
                                            {appliedFilters.date_to && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs">
                                                    To: {appliedFilters.date_to}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* <ProductsTable
            products={productsInfo?.products || []}
            isLoading={productsLoading}
            onEditProduct={handleEditProduct}
          /> */}
                    <ProductsTable
                        products={productInfo?.products || []}
                        isLoading={loading}
                        onEdit={handleEditProduct}
                    // categories={}
                    />
                    {totalItems > 0 && (
                        <div className="flex items-center justify-between mt-6">
                            <div className="flex items-center space-x-2">
                                <p className="text-sm text-muted-foreground">
                                    Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                                    {totalItems} products
                                </p>
                                <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                                    <SelectTrigger className="w-20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {totalPages > 1 && (
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
                                        {getPaginationNumbers().map((pageNum, index) =>
                                            pageNum === "..." ? (
                                                <span key={index} className="px-2 py-1 text-sm text-muted-foreground">
                                                    ...
                                                </span>
                                            ) : (
                                                <Button
                                                    key={pageNum}
                                                    variant={currentPage === pageNum ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handlePageChange(pageNum as number)}
                                                >
                                                    {pageNum}
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
                            )}
                        </div>
                    )}

                    {totalItems === 0 && !loading && (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">
                                {hasActiveFilters() ? "No products found matching your criteria" : "No products available"}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Product Dialog */}
            {/* <CreateProductDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} /> */}

            {/* Edit Product Dialog */}
            {/* <CreateProductDialog open={isEditDialogOpen} onOpenChange={handleEditDialogClose} editingProduct={selectedProduct} /> */}
        </div>
    )
}
