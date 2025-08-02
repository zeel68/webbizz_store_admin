"use client"

import { useState } from "react"
import { useStoreAdminStore } from "@/store/storeAdminStore"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Trash2, Eye, Star, Package, Copy } from "lucide-react"
import { toast } from "sonner"
import type { Product } from "@/models/schemas/product"

interface ProductsTableProps {
  products: Product[]
  isLoading: boolean
  onEdit?: (product: Product) => void
  onDelete?: (id: string) => void
  onView?: (product: Product) => void
  onDuplicate?: (product: Product) => void
}

export function ProductsTable({ products, isLoading, onEdit, onDelete, onView, onDuplicate }: ProductsTableProps) {
  const { deleteProduct, duplicateProduct, categories } = useStoreAdminStore()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)

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

  const handleDuplicate = async (product: Product) => {
    setDuplicatingId(product._id)
    try {
      await duplicateProduct(product._id)
      toast.success("Product duplicated successfully")
      if (onDuplicate) onDuplicate(product)
    } catch (error: any) {
      toast.error(error.message || "Failed to duplicate product")
    } finally {
      setDuplicatingId(null)
    }
  }

  const handleEdit = (product: Product) => {
    if (onEdit) onEdit(product)
  }

  const handleView = (product: Product) => {
    if (onView) onView(product)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat._id === categoryId)
    return category?.display_name || "Unknown Category"
  }

  const getStockStatus = (product: Product) => {
    const { quantity } = product.stock
    if (quantity === 0) return { status: "Out of Stock", variant: "destructive" as const }
    if (quantity <= 10) return { status: "Low Stock", variant: "secondary" as const }
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
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const stockStatus = getStockStatus(product)
            return (
              <TableRow key={product._id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        className="h-16 w-16 rounded object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {product.description || "No description"}
                      </div>
                      {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag.tagName}
                            </Badge>
                          ))}
                          {product.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{product.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{getCategoryName(product.category)}</Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{formatPrice(product.price)}</div>
                    {product.discount_price && product.discount_price < product.price && (
                      <div className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.discount_price)}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{product.stock.quantity}</div>
                    <Badge variant={stockStatus.variant} className="text-xs">
                      {stockStatus.status}
                    </Badge>
                    {product.stock.reserved > 0 && (
                      <div className="text-xs text-muted-foreground">{product.stock.reserved} reserved</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.ratings?.average?.toFixed(1) || "0.0"}</span>
                    <span className="text-xs text-muted-foreground">({product.ratings?.count || 0})</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {product.is_featured && (
                      <div className="flex items-center text-xs text-yellow-600">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Featured
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {new Date(product.created_at).toLocaleDateString()}
                  </span>
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
                        onClick={() => handleDuplicate(product)}
                        disabled={duplicatingId === product._id}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        {duplicatingId === product._id ? "Duplicating..." : "Duplicate"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
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
