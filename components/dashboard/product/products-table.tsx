"use client"

import { useState } from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Trash2, Eye, Package } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { useProductStore } from "@/store/productStore"


interface ProductsTableProps {
    products: iProduct[]
    isLoading: boolean
    onEdit?: (product: iProduct) => void
    onDelete?: (id: string) => void
    categories?: Array<{ _id: string; display_name: string }>
}

export function ProductsTable({ products, isLoading, onEdit, onDelete, categories = [] }: ProductsTableProps) {
    const { deleteProduct } = useProductStore()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [selectedProductForDetails, setSelectedProductForDetails] = useState<iProduct | null>(null)
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete the product "${name}"?`)) {
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
        if (onEdit) onEdit(product)
    }

    const handleViewDetails = (product: iProduct) => {
        setSelectedProductForDetails(product)
        setIsDetailsDialogOpen(true)
    }

    const getCategoryName = (categoryId?: string) => {
        if (!categoryId) return "Uncategorized"
        const category = categories.find((cat) => cat._id === categoryId)
        return category?.display_name || "Unknown"
    }

    const getStockStatus = (product: iProduct) => {
        const quantity = product.stock?.quantity || 0
        const threshold = product.stock?.low_stock_threshold || 10

        if (quantity === 0) return { status: "Out of Stock", variant: "destructive" as const }
        if (quantity <= threshold) return { status: "Low Stock", variant: "secondary" as const }
        return { status: "In Stock", variant: "default" as const }
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
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => {
                        const stockStatus = getStockStatus(product)
                        return (
                            <TableRow key={product.id}>
                                <TableCell>
                                    {product.images && product.images.length > 0 ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="h-16 w-16 rounded object-cover"
                                        // onError={(e) => {
                                        //   e.currentTarget.src = "/placeholder.svg"
                                        // }}
                                        />
                                    ) : (
                                        <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
                                            <Package className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="font-medium">{product.name}</div>
                                        <div className="text-sm text-muted-foreground">SKU: {product.sku || "N/A"}</div>
                                        {product.brand && <div className="text-xs text-muted-foreground">Brand: {product.brand}</div>}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm">{product.category?.display_name}</span>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="font-medium">{formatCurrency(product.price)}</div>
                                        {product.discount_price && (
                                            <div className="text-sm text-muted-foreground line-through">
                                                {formatCurrency(product.discount_price)}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="font-medium">{product.stock?.quantity || 0}</div>
                                        <Badge variant={stockStatus.variant} className="text-xs">
                                            {stockStatus.status}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <Badge variant={product.is_active ? "default" : "secondary"}>
                                            {product.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                        {product.is_featured && (
                                            <Badge variant="outline" className="text-xs">
                                                Featured
                                            </Badge>
                                        )}
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
                                            <DropdownMenuItem onClick={() => handleViewDetails(product)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleEdit(product)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Product
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={() => handleDelete(product.id, product.name)}
                                                disabled={deletingId === product.id}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
            {/* <ProductDetailsDialog
                product={selectedProductForDetails}
                open={isDetailsDialogOpen}
                onOpenChange={setIsDetailsDialogOpen}
                onEdit={onEdit}
                categories={categories}
            /> */}
        </div>
    )
}
