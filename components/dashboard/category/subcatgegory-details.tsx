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
import { Search, Package, Plus, Check } from 'lucide-react'
import { useProductStore } from "@/store/productStore"
import { useCategoryStore } from "@/store/categoryStore"
import { formatCurrency } from "@/lib/utils"


interface SubcategoryProductsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    category: iStoreCategory | null
}

export function SubcategoryProductsDialog({
    open,
    onOpenChange,
    category,
}: SubcategoryProductsDialogProps) {
    const { productInfo, fetchProducts, assignProductsToCategory, loading } = useProductStore()
    const { fetchCategories } = useCategoryStore()

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>("")
    const [isAssigning, setIsAssigning] = useState(false)

    // Fetch products when dialog opens
    useEffect(() => {
        if (open) {
            fetchProducts({ limit: 100 }) // Fetch more products for selection
        }
    }, [open, fetchProducts])

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (open) {
            setSelectedProducts(new Set())
            setSelectedSubcategory("")
            setSearchTerm("")
        }
    }, [open])

    const filteredProducts = productInfo?.products?.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

    const handleProductToggle = (productId: string) => {
        setSelectedProducts(prev => {
            const newSet = new Set(prev)
            if (newSet.has(productId)) {
                newSet.delete(productId)
            } else {
                newSet.add(productId)
            }
            return newSet
        })
    }

    const handleSelectAll = () => {
        if (selectedProducts.size === filteredProducts.length) {
            setSelectedProducts(new Set())
        } else {
            setSelectedProducts(new Set(filteredProducts.map(p => p._id)))
        }
    }

    const handleAssignProducts = async () => {
        if (!selectedSubcategory || selectedProducts.size === 0) {
            toast.error("Please select a subcategory and at least one product")
            return
        }

        setIsAssigning(true)
        try {
            const promises = Array.from(selectedProducts).map(productId =>
                assignProductsToCategory([productId], selectedSubcategory)
            )

            await Promise.all(promises)

            toast.success(`Successfully assigned ₹{selectedProducts.size} product(s) to subcategory`)

            // Refresh categories to update product counts
            await fetchCategories()

            // Reset selections
            setSelectedProducts(new Set())
            setSelectedSubcategory("")

            onOpenChange(false)
        } catch (error: any) {
            toast.error(error.message || "Failed to assign products to subcategory")
        } finally {
            setIsAssigning(false)
        }
    }

    if (!category) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Assign Products to Subcategories - {category.display_name}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col h-full space-y-4">
                    {/* Subcategory Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Select Subcategory</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {category.subcategories && category.subcategories.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {category.subcategories.map((subcategory: any) => (
                                        <div
                                            key={subcategory._id}
                                            className={`p-3 border rounded-lg cursor-pointer transition-colors ₹{selectedSubcategory === subcategory._id
                                                ? "border-primary bg-primary/5"
                                                : "border-muted hover:border-primary/50"
                                                }`}
                                            onClick={() => setSelectedSubcategory(subcategory._id)}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-4 h-4 rounded-full border-2 ₹{selectedSubcategory === subcategory._id
                                                    ? "border-primary bg-primary"
                                                    : "border-muted-foreground"
                                                    }`}>
                                                    {selectedSubcategory === subcategory._id && (
                                                        <Check className="w-3 h-3 text-white m-0.5" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">
                                                        {subcategory.display_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {subcategory.products_count || 0} products
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No subcategories found for this category</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Separator />

                    {/* Product Selection */}
                    <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                                <div className="relative flex-1 min-w-[300px]">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <Input
                                        placeholder="Search products by name, SKU, or brand..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={handleSelectAll}
                                    disabled={filteredProducts.length === 0}
                                >
                                    {selectedProducts.size === filteredProducts.length ? "Deselect All" : "Select All"}
                                </Button>
                            </div>

                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">
                                    {selectedProducts.size} of {filteredProducts.length} selected
                                </span>
                            </div>
                        </div>

                        <ScrollArea className="h-[400px]">
                            {loading ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                                            <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                                            <div className="h-16 w-16 bg-muted rounded animate-pulse" />
                                            <div className="space-y-2 flex-1">
                                                <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                                                <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No products found</h3>
                                    <p className="text-muted-foreground">
                                        {searchTerm ? "Try adjusting your search terms" : "No products available"}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredProducts.map((product) => (
                                        <div
                                            key={product._id}
                                            className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors ₹{selectedProducts.has(product._id)
                                                ? "border-primary bg-primary/5"
                                                : "border-muted hover:border-primary/50"
                                                }`}
                                            onClick={() => handleProductToggle(product._id)}
                                        >
                                            <Checkbox
                                                checked={selectedProducts.has(product._id)}
                                                onChange={() => handleProductToggle(product._id)}
                                            />

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

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-medium truncate">{product.name}</h4>
                                                    <div className="flex items-center space-x-2">
                                                        <Badge variant={product.is_active ? "default" : "secondary"}>
                                                            {product.is_active ? "Active" : "Inactive"}
                                                        </Badge>
                                                        {product.is_featured && (
                                                            <Badge variant="outline">Featured</Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                    <span className="font-medium text-foreground">
                                                        {formatCurrency(product.price)}
                                                    </span>
                                                    {product.sku && <span>SKU: {product.sku}</span>}
                                                    {product.brand && <span>Brand: {product.brand}</span>}
                                                    <span>Stock: {product.stock?.quantity || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isAssigning}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssignProducts}
                            disabled={!selectedSubcategory || selectedProducts.size === 0 || isAssigning}
                        >
                            {isAssigning && (
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                            )}
                            Assign {selectedProducts.size} Product{selectedProducts.size !== 1 ? 's' : ''}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
