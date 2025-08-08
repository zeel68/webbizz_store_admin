"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, Download, X, Calendar, Package, TrendingUp, AlertTriangle, ShoppingCart } from 'lucide-react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useProductStore } from "@/store/productStore"
import { useCategoryStore } from "@/store/categoryStore"
import { ProductsTable } from "@/components/dashboard/product/products-table"
import { ProductDetailsDialog } from "@/components/dashboard/product/product-details-dialog"

import { toast } from "sonner"

export default function ProductsPage() {
    const router = useRouter()
    const { productInfo, fetchProducts, error, loading, fetchProductStats, stats } = useProductStore()
    const { categories, fetchCategories } = useCategoryStore()

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(20)
    const [showFilters, setShowFilters] = useState(false)
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<iProduct | null>(null)

    const [filters, setFilters] = useState<iProductFilters>({
        search: "",
        category: "all",
        parent_category: "all",
        status: "all",
        stock_level: "all",
        price_min: "",
        price_max: "",
        date_from: "",
        date_to: "",
        sort: "created_at",
        order: "desc",
    })

    const [appliedFilters, setAppliedFilters] = useState<iProductFilters>({
        search: "",
        category: "all",
        parent_category: "all",
        status: "all",
        stock_level: "all",
        price_min: "",
        price_max: "",
        date_from: "",
        date_to: "",
        sort: "created_at",
        order: "desc",
    })

    // Load categories on mount
    useEffect(() => {
        if (categories.length === 0) {
            fetchCategories()
        }
        fetchProductStats()
    }, [categories.length, fetchCategories, fetchProductStats])

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
            parent_category: filters.parent_category,
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
            parent_category: appliedFilters.parent_category,
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
        filters.parent_category,
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
        const queryParams: iProductFilters = {
            page: currentPage,
            limit: itemsPerPage,
            sort: appliedFilters.sort,
            order: appliedFilters.order,
            category: appliedFilters.category !== "all" ? appliedFilters.category : undefined,
            parent_category: appliedFilters.parent_category !== "all" ? appliedFilters.parent_category : "",
            status: appliedFilters.status !== "all" ? appliedFilters.status : undefined,
            stock_level: appliedFilters.stock_level !== "all" ? appliedFilters.stock_level : undefined,
            price_min: appliedFilters.price_min || undefined,
            price_max: appliedFilters.price_max || undefined,
            date_from: appliedFilters.date_from || undefined,
            date_to: appliedFilters.date_to || undefined,
            search: appliedFilters.search || undefined,
        }

        // Filter out undefined values
        const cleanParams = Object.fromEntries(
            Object.entries(queryParams).filter(([_, value]) => value !== undefined)
        )

        fetchProducts(cleanParams as any)
    }, [appliedFilters, currentPage, itemsPerPage, fetchProducts])

    const updateFilter = (key: keyof iProductFilters, value: string | number) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        const defaultFilters: iProductFilters = {
            search: "",
            category: "all",
            parent_category: "all",
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
            appliedFilters.parent_category !== "all" ||
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

    // Handle product actions
    const handleViewProduct = (product: iProduct) => {
        setSelectedProduct(product)
        setIsDetailsDialogOpen(true)
    }

    const handleEditProduct = (product: iProduct) => {
        router.push(`/products/₹{product._id}`)
    }

    const handleDetailsDialogClose = (open: boolean) => {
        setIsDetailsDialogOpen(open)
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Products</h1>
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
                    <Button onClick={() => router.push("/products/add")} className="bg-gradient-to-r from-primary to-primary/80">
                        <Plus className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Add Product</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_products}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.active_products} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.low_stock_products}</div>
                            <p className="text-xs text-muted-foreground">
                                Need attention
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.out_of_stock_products}</div>
                            <p className="text-xs text-muted-foreground">
                                Restock needed
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.avg_price.toFixed(1)}</div>
                            <p className="text-xs text-muted-foreground">
                                From {stats.total_products} products
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

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
                        {hasActiveFilters() && ` (₹{totalItems} filtered results)`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Basic Search and Sort */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search by product name or description..."
                                value={filters.search}
                                onChange={(e) => updateFilter("search", e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex space-x-2">
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
                                    <SelectItem value="ratings.average">Rating</SelectItem>
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
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <Card className="mb-6 border-dashed">
                            <CardHeader>
                                <CardTitle className="text-lg">Advanced Filters</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Category Filters */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Store Category</label>
                                        <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Categories" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Categories</SelectItem>
                                                {categories.map((category) => (
                                                    <SelectItem key={category._id} value={category._id}>
                                                        {category.display_name}
                                                    </SelectItem>
                                                ))}
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
                            </CardContent>
                        </Card>
                    )}

                    <ProductsTable
                        products={productInfo?.products || []}
                        isLoading={loading}
                        onEdit={handleEditProduct}
                        onView={handleViewProduct}
                        categories={categories}
                    />

                    {totalItems > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
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
                            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                {hasActiveFilters() ? "No products found matching your criteria" : "No products available"}
                            </p>
                            {!hasActiveFilters() && (
                                <Button onClick={() => router.push("/products/add")} className="mt-4">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Your First Product
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Product Details Dialog */}
            <ProductDetailsDialog
                product={selectedProduct}
                open={isDetailsDialogOpen}
                onOpenChange={handleDetailsDialogClose}
                onEdit={handleEditProduct}
                categories={categories}
            />
        </div>
    )
}
