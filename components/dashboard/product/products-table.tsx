"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Trash2, Eye, Package, Star, Users } from 'lucide-react'
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { useProductStore } from "@/store/productStore"


interface ProductsTableProps {
    products: iProduct[]
    isLoading: boolean
    onEdit?: (product: iProduct) => void
    onView?: (product: iProduct) => void
    onDelete?: (id: string) => void
    categories?: Array<{ _id: string; display_name: string }>
}

export function ProductsTable({
    products,
    isLoading,
    onEdit,
    onView,
    onDelete,
    categories = []
}: ProductsTableProps) {
    const router = useRouter()
    const { deleteProduct } = useProductStore()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete the product "₹{name}"?`)) {
            setDeletingId(id)
            try {
                await deleteProduct(id)
                toast.success("Product deleted successfully")
                if (onDelete) onDelete(id)
            } catch (error: any) {
                toast.error(error.message || "Failed to delete product")
            } finally {
                setDeletingId(null)
            }
        }
    }

    const handleEdit = (product: iProduct) => {
        if (onEdit) {
            onEdit(product)
        } else {
            router.push(`/products/add?id=₹{product._id}`)
        }
    }

    const handleView = (product: iProduct) => {
        if (onView) onView(product)
    }

    const getCategoryName = (categoryId?: string) => {
        if (!categoryId) return "Uncategorized"
        const category = categories.find((cat) => cat._id === categoryId)
        return category?.display_name || "Unknown"
    }

    const getStockStatus = (product: iProduct) => {
        const quantity = product.stock?.quantity || 0
        const reserved = product.stock?.reserved || 0
        const available = quantity - reserved

        if (available <= 0) return { status: "Out of Stock", variant: "destructive" as const }
        if (available <= 10) return { status: "Low Stock", variant: "secondary" as const }
        return { status: "In Stock", variant: "default" as const }
    }

    const renderStars = (rating: number) => {
        const stars = []
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 !== 0

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)
        }

        if (hasHalfStar) {
            stars.push(<Star key="half" className="h-3 w-3 fill-yellow-400/50 text-yellow-400" />)
        }

        const remainingStars = 5 - Math.ceil(rating)
        for (let i = 0; i < remainingStars; i++) {
            stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-gray-300" />)
        }

        return stars
    }

    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                        <Skeleton className="h-16 w-16 rounded" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                    </div>
                ))}
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="bg-muted rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground">Create your first product to start selling</p>
            </div>
        )
    }

    return (
        <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-[80px]">Image</TableHead>
                        <TableHead className="min-w-[200px]">Product</TableHead>
                        <TableHead className="min-w-[120px]">Category</TableHead>
                        <TableHead className="min-w-[100px]">Price</TableHead>
                        <TableHead className="min-w-[100px]">Stock</TableHead>
                        <TableHead className="min-w-[120px]">Rating</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => {
                        const stockStatus = getStockStatus(product)
                        const availableStock = (product.stock?.quantity || 0) - (product.stock?.reserved || 0)

                        return (
                            <TableRow key={product._id}>
                                <TableCell>
                                    {product.images && product.images.length > 0 ? (
                                        <img
                                            src={product.images[0] || "/placeholder.svg"}
                                            alt={product.name}
                                            className="h-12 w-12 md:h-16 md:w-16 rounded object-cover"
                                        />
                                    ) : (
                                        <div className="h-12 w-12 md:h-16 md:w-16 rounded bg-muted flex items-center justify-center">
                                            <Package className="h-4 w-4 md:h-6 md:w-6 text-muted-foreground" />
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="font-medium text-sm md:text-base line-clamp-2">
                                            {product.name}
                                        </div>
                                        {product.description && (
                                            <div className="text-xs text-muted-foreground line-clamp-1">
                                                {product.description}
                                            </div>
                                        )}
                                        {product.variants && product.variants.length > 0 && (
                                            <div className="text-xs text-blue-600">
                                                {product.variants.length} variant{product.variants.length > 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs md:text-sm">{getCategoryName(product.category as any)}</span>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="font-medium text-sm md:text-base">{formatCurrency(product.price)}</div>
                                        {product.variants && product.variants.length > 0 && (
                                            <div className="text-xs text-muted-foreground">
                                                Variants: {formatCurrency(Math.min(...product.variants.map((v: any) => v.price || product.price)))} - {formatCurrency(Math.max(...product.variants.map((v: any) => v.price || product.price)))}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
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
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1">
                                            {renderStars(product.ratings?.average || 0)}
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {product.ratings?.count || 0} reviews
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <Badge variant={product.is_active ? "default" : "secondary"} className="text-xs">
                                            {product.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleView(product)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleEdit(product)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Product
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={() => handleDelete(product._id, product.name)}
                                                disabled={deletingId === product._id}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                {deletingId === product._id ? "Deleting..." : "Delete"}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
