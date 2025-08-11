"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Copy,
    Calendar,
    Package,
    Tag,
    DollarSign,
    Star,
    AlertTriangle,
    CheckCircle,
    XCircle,
} from "lucide-react"
import { formatCurrency, formatRelativeTime, truncateText } from "@/lib/utils"
import { useProductStore } from "@/store/productStore"
import { toast } from "sonner"

interface Product {
    _id: string
    name: string
    description?: string
    price: number
    compare_price?: number
    images?: string[]
    category?: Category
    stock?: {
        quantity: number
        track_inventory: boolean
    }
    is_active: boolean
    is_featured: boolean
    createdAt: string
    updatedAt: string
    ratings?: {
        average: number
        count: number
    }
    sku?: string
}

interface Category {
    _id: string
    display_name: string
}

interface ProductsTableProps {
    products: iProduct[]
    categories: Category[]
    isLoading: boolean
    onView?: (product: iProduct) => void
    onEdit?: (product: iProduct) => void
    onDelete?: (product: iProduct) => void
    onDuplicate?: (product: iProduct) => void
}

export function ProductsTable({
    products,
    categories,
    isLoading,
    onView,
    onEdit,
    onDelete,
    onDuplicate,
}: ProductsTableProps) {
    const [selectedProducts, setSelectedProducts] = useState<string[]>([])
    const { deleteProduct, togglePoductStatus } = useProductStore()
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedProducts(products.map((product) => product._id))
        } else {
            setSelectedProducts([])
        }
    }

    const handleSelectProduct = (productId: string, checked: boolean) => {
        if (checked) {
            setSelectedProducts((prev) => [...prev, productId])
        } else {
            setSelectedProducts((prev) => prev.filter((id) => id !== productId))
        }
    }

    const getStatusBadge = (isActive: boolean) => {
        return (
            <Badge
                variant="secondary"
                className={`${isActive ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"} border-0 font-medium flex items-center gap-1`}
            >
                {isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                {isActive ? "Active" : "Inactive"}
            </Badge>
        )
    }
    const getStockStatus = (product: iProduct) => {
        const quantity = product.stock?.quantity || 0
        const reserved = product.stock?.reserved || 0
        const available = quantity - reserved

        if (available <= 0) return { status: "Out of Stock", variant: "destructive" as const }
        if (available <= 10) return { status: "Low Stock", variant: "secondary" as const }
        return { status: "In Stock", variant: "default" as const }
    }


    const getStockBadge = (product: iProduct) => {
        const availableStock = (product.stock?.quantity || 0) - (product.stock?.reserved || 0)
        const stockStatus = getStockStatus(product)

        if (!product.stock?.track_inventory) {
            return (
                <div className="space-y-1">
                    <div className="font-medium text-sm md:text-base">{availableStock}</div>
                    {product.stock?.reserved && product.stock.reserved > 0 && (
                        <div className="text-xs text-muted-foreground">
                            {product.stock.reserved} reserved
                        </div>
                    )}
                    <Badge variant={stockStatus.variant} className="text-xs">
                        {stockStatus.status}
                    </Badge>
                </div>
            )
        }

        const quantity = product.stock.quantity
        if (quantity === 0) {
            return (
                <Badge variant="secondary" className="text-red-600 bg-red-50 border-0">
                    <XCircle className="h-3 w-3 mr-1" />
                    Out of stock
                </Badge>
            )
        } else if (quantity < 10) {
            return (
                <Badge variant="secondary" className="text-orange-600 bg-orange-50 border-0">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Low stock ({quantity})
                </Badge>
            )
        } else {
            return (
                <Badge variant="secondary" className="text-green-600 bg-green-50 border-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    In stock ({quantity})
                </Badge>
            )
        }
    }

    const getCategoryName = (categoryId?: Category) => {
        if (!categoryId) return "Uncategorized"
        const category = categories.find((cat) => cat._id === categoryId._id)
        return category?.display_name || "Unknown Category"
    }

    const renderStars = (rating?: { average: number; count: number }) => {
        if (!rating || rating.count === 0) {
            return <span className="text-muted-foreground text-sm">No reviews</span>
        }

        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-3 w-3 ${star <= rating.average ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                ))}
                <span className="ml-1 text-xs text-muted-foreground">
                    {rating.average.toFixed(1)} ({rating.count})
                </span>
            </div>
        )
    }


    const handleDelete = async (
        id: string,
        name?: string,
        skipConfirm?: boolean
    ) => {
        if (!skipConfirm) {
            const confirmed = confirm(`Are you sure you want to delete the category "${name}"?`);
            if (!confirmed) return;
        }

        try {
            await deleteProduct(id);
            if (!skipConfirm) toast.success("Category deleted successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete category");
        }
    };

    const handleMultipleDelete = async () => {
        if (selectedProducts.length === 0) return;

        try {
            await Promise.all(selectedProducts.map(id => handleDelete(id, "", true)));
            toast.success(`Deleted ${selectedProducts.length} categories`);
            setSelectedProducts([]);
        } catch (error: any) {
            toast.error(error.message || "Failed to delete categories");
        }
    };
    const handleChangeStatus = async (
        id: string,
        status: boolean,
        skipConfirm?: boolean
    ) => {
        if (!skipConfirm) {
            const confirmed = confirm(`Are you sure you want to change the category status?`);
            if (!confirmed) return;
        }

        try {
            await togglePoductStatus(id, status);
            if (!skipConfirm) toast.success("Category status change successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to change category status");
        }
    };

    const handleMultipleStatus = async (status: boolean) => {
        if (selectedProducts.length === 0) return;
        try {
            await Promise.all(selectedProducts.map(id => handleChangeStatus(id, status, true)));
            toast.success(`Deleted ${selectedProducts.length} categories`);
            setSelectedProducts([]);
        } catch (error: any) {
            toast.error(error.message || "Failed to chaneg categories status");
        }
    };

    if (isLoading) {
        return (
            <div className="rounded-md border ">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                                <Skeleton className="h-4 w-4" />
                            </TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Created</TableHead>
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
                                        <Skeleton className="h-12 w-12 rounded" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-48" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-24" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-20" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-6 w-20" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-6 w-16" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-20" />
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

    if (products.length === 0) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                                <div className="flex flex-col items-center space-y-2">
                                    <Package className="h-8 w-8 text-muted-foreground" />
                                    <p className="text-muted-foreground">No products found</p>
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
                                checked={selectedProducts.length === products.length}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                        </TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-12"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product._id} className="hover:bg-muted/50">
                            <TableCell>
                                <input
                                    type="checkbox"
                                    checked={selectedProducts.includes(product._id)}
                                    onChange={(e) => handleSelectProduct(product._id, e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                            </TableCell>

                            <TableCell>
                                <div className="flex items-center space-x-3">
                                    <div className="h-12 w-12 rounded bg-muted flex items-center justify-center overflow-hidden">
                                        {product.images && product.images[0] ? (
                                            <img
                                                src={product.images[0] || "/placeholder.svg"}
                                                alt={product.name}
                                                className="h-12 w-12 object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement
                                                    target.src = "/placeholder.svg?height=48&width=48&text=No+Image"
                                                }}
                                            />
                                        ) : (
                                            <Package className="h-6 w-6 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="space-y-1 min-w-0 flex-1">
                                        <p className="font-medium leading-none truncate" title={product.name}>
                                            {product.name}
                                        </p>
                                        {product.description && (
                                            <p className="text-xs text-muted-foreground truncate" title={product.description}>
                                                {truncateText(product.description, 50)}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2">
                                            {product.sku && (
                                                <Badge variant="outline" className="text-xs px-1 py-0">
                                                    SKU: {product.sku}
                                                </Badge>
                                            )}
                                            {product.is_featured && (
                                                <Badge variant="secondary" className="text-xs px-1 py-0 bg-yellow-50 text-yellow-700">
                                                    <Star className="h-3 w-3 mr-1 fill-current" />
                                                    Featured
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="flex items-center">
                                    <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span className="text-sm">{getCategoryName(product.category)}</span>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="space-y-1">
                                    <div className="flex items-center">
                                        <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                                        <span className="font-medium">{formatCurrency(product.price)}</span>
                                    </div>
                                    {product.compare_price && product.compare_price > product.price && (
                                        <div className="text-xs text-muted-foreground line-through">
                                            {formatCurrency(product.compare_price)}
                                        </div>
                                    )}
                                </div>
                            </TableCell>

                            <TableCell>{getStockBadge(product)}</TableCell>

                            <TableCell>{getStatusBadge(product.is_active)}</TableCell>

                            <TableCell>{renderStars(product.ratings)}</TableCell>

                            <TableCell>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="h-3 w-3 mr-2" />
                                    <span>{formatRelativeTime(product.createdAt ?? "")}</span>
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
                                            <DropdownMenuItem onClick={() => onView(product)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                        )}

                                        {onEdit && (
                                            <DropdownMenuItem onClick={() => onEdit(product)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Product
                                            </DropdownMenuItem>
                                        )}

                                        {onDuplicate && (
                                            <DropdownMenuItem onClick={() => onDuplicate(product)}>
                                                <Copy className="mr-2 h-4 w-4" />
                                                Duplicate Product
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuSeparator />

                                        {/* {onDelete && ( */}
                                        <DropdownMenuItem
                                            onClick={() => handleDelete(product._id, product.name)}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Product
                                        </DropdownMenuItem>
                                        {/* )} */}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
                <div className="border-t bg-muted/50 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {selectedProducts.length} product{selectedProducts.length > 1 ? "s" : ""} selected
                        </p>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                                Export Selected
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleMultipleStatus(true)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activate Selected
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleMultipleStatus(false)}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Deactivate Selected
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleMultipleDelete}>
                                Delete Selected
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
