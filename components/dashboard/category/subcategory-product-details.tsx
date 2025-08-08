"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Search, Package, Plus, Loader2 } from 'lucide-react'
import { useProductStore } from "@/store/productStore"
import { useCategoryStore } from "@/store/categoryStore"


interface SubcategoryProductsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    subcategory: iStoreCategory | null
}

export function SubcategoryProductsDialog({
    open,
    onOpenChange,
    subcategory,
}: SubcategoryProductsDialogProps) {
    const { productInfo, fetchProducts, assignProductsToCategory, loading } = useProductStore()
    const { fetchCategories } = useCategoryStore()

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedProducts, setSelectedProducts] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Fetch products when dialog opens
    useEffect(() => {
        if (open) {
            fetchProducts({
                search: searchTerm,
                category: "all", // Get all products to allow assignment
                limit: 100
            })
        }
    }, [open, searchTerm, fetchProducts])

    // Filter products based on search term
    const filteredProducts = productInfo?.products?.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

    // Get products already in this subcategory
    const productsInSubcategory = filteredProducts.filter(product =>
        product.store_category_id === subcategory?._id
    )

    // Get products not in this subcategory
    const availableProducts = filteredProducts.filter(product =>
        product.store_category_id !== subcategory?._id
    )

    const handleProductToggle = (productId: string) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        )
    }

    const handleSelectAll = () => {
        if (selectedProducts.length === availableProducts.length) {
            setSelectedProducts([])
        } else {
            setSelectedProducts(availableProducts.map(p => p._id))
        }
    }

    const handleAssignProducts = async () => {
        if (!subcategory || selectedProducts.length === 0) return

        setIsSubmitting(true)
        try {
            // Assign each selected product to the subcategory
            const promises = selectedProducts.map(productId =>
                assignProductsToCategory([productId], subcategory._id)
            )

            await Promise.all(promises)

            toast.success(`${selectedProducts.length} product(s) assigned to ${subcategory.display_name}`)

            // Refresh data
            await fetchProducts({ limit: 100 })
            await fetchCategories(true)

            // Clear selection and close dialog
            setSelectedProducts([])
            onOpenChange(false)
        } catch (error: any) {
            toast.error(error.message || "Failed to assign products")
        } finally {
            setIsSubmitting(false)
        }
    }

    const ProductCard = ({ product, isSelected, onToggle, isAssigned = false }: {
        product: iProduct
        isSelected: boolean
        onToggle: (productId: string) => void
        isAssigned?: boolean
    }) => (
        <Card className={`transition-all ${isSelected ? 'ring-2 ring-primary' : ''} ${isAssigned ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    {!isAssigned && (
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onToggle(product._id)}
                            className="mt-1"
                        />
                    )}

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                            {product.images && product.images.length > 0 ? (
                                <img
                                    src={product.images[0] || "/placeholder.svg"}
                                    alt={product.name}
                                    className="w-12 h-12 rounded object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                    <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">{product.name}</h4>
                                <p className="text-xs text-muted-foreground truncate">
                                    {product.brand && `${product.brand} • `}
                                    SKU: {product.sku || "N/A"}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                        ${product.price}
                                    </Badge>
                                    <Badge variant={product.stock?.quantity ? "default" : "destructive"} className="text-xs">
                                        Stock: {product.stock?.quantity || 0}
                                    </Badge>
                                    {isAssigned && (
                                        <Badge variant="secondary" className="text-xs">
                                            Already Assigned
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    if (!subcategory) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Assign Products to {subcategory.display_name}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col h-full">
                    {/* Search and Controls */}
                    <div className="space-y-4 pb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search products by name, SKU, or brand..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {availableProducts.length > 0 && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        checked={selectedProducts.length === availableProducts.length}
                                        onCheckedChange={handleSelectAll}
                                    />
                                    <Label className="text-sm">
                                        Select All Available ({availableProducts.length})
                                    </Label>
                                </div>
                                <Badge variant="outline">
                                    {selectedProducts.length} selected
                                </Badge>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Products List */}
                    <ScrollArea className="flex-1 py-4">
                        <div className="space-y-6">
                            {/* Products already in subcategory */}
                            {productsInSubcategory.length > 0 && (
                                <div>
                                    <h3 className="font-medium text-sm text-muted-foreground mb-3">
                                        Products in {subcategory.display_name} ({productsInSubcategory.length})
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {productsInSubcategory.map((product) => (
                                            <ProductCard
                                                key={product._id}
                                                product={product}
                                                isSelected={false}
                                                onToggle={() => { }}
                                                isAssigned={true}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Available products */}
                            {availableProducts.length > 0 && (
                                <div>
                                    <h3 className="font-medium text-sm text-muted-foreground mb-3">
                                        Available Products ({availableProducts.length})
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {availableProducts.map((product) => (
                                            <ProductCard
                                                key={product._id}
                                                product={product}
                                                isSelected={selectedProducts.includes(product._id)}
                                                onToggle={handleProductToggle}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* No products found */}
                            {filteredProducts.length === 0 && !loading && (
                                <div className="text-center py-8">
                                    <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">
                                        {searchTerm ? "No products found matching your search" : "No products available"}
                                    </p>
                                </div>
                            )}

                            {/* Loading state */}
                            {loading && (
                                <div className="text-center py-8">
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">Loading products...</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                            {selectedProducts.length > 0 && (
                                <span>{selectedProducts.length} product(s) selected for assignment</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAssignProducts}
                                disabled={selectedProducts.length === 0 || isSubmitting}
                                className="flex items-center gap-2"
                            >
                                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                <Plus className="h-4 w-4" />
                                Assign {selectedProducts.length > 0 ? `${selectedProducts.length} ` : ''}Product{selectedProducts.length !== 1 ? 's' : ''}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
