"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Loader2, Save, Search, Package, Tag, X } from "lucide-react"
import { useProductStore } from "@/store/productStore"
import { useCategoryStore } from "@/store/categoryStore"
import { Skeleton } from "@/components/ui/skeleton"

interface AddProductsToCategoryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    category?: any
}

interface Product {
    _id: string
    name: string
    price: number
    images?: string[]
    store_category_id?: string
    is_active: boolean
}

export function AddProductsToCategoryDialog({ open, onOpenChange, category }: AddProductsToCategoryDialogProps) {
    const { productInfo, fetchProducts, loading: productsLoading, assignProductsToCategory } = useProductStore()
    const { loading: categoryLoading } = useCategoryStore()
    const [editProducts, setEditingProducts] = useState<boolean>(false)
    const [selectedProducts, setSelectedProducts] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Fetch products when dialog opens
    useEffect(() => {
        if (open) {
            fetchProducts({
                page: 1,
                limit: 100, // Get more products for selection
                search: searchTerm || undefined,
            })
            if (category.products.length > 0) {
                setEditingProducts(true)
            } else {
                setEditingProducts(false)
            }

            setSelectedProducts(category.products)
            setCurrentPage(1)
        }
    }, [open, searchTerm, fetchProducts])

    // Filter products based on search term and exclude already assigned products
    const filteredProducts = (productInfo?.products || []).filter((product) => {
        const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm.toLowerCase())

        // Optionally exclude products already in this category
        const notInCategory = !category || product.store_category_id !== category._id

        return matchesSearch && notInCategory && product.is_active
    })

    // Paginate filtered products
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedProducts(paginatedProducts.map((product) => product._id))
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if ((!category || selectedProducts.length === 0) && !editProducts) {
            toast.error("Please select at least one product")
            return
        }

        setIsSubmitting(true)

        try {
            await assignProductsToCategory(selectedProducts, category._id)
            toast.success(
                `${selectedProducts.length} product${selectedProducts.length > 1 ? "s" : ""} assigned to ${category.display_name}`,
            )
            onOpenChange(false)
        } catch (error: any) {
            console.error("Assign products error:", error)
            toast.error(error.message || "Failed to assign products to category")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        if (!categoryLoading && !isSubmitting) {
            onOpenChange(false)
        }
    }

    const isFormDisabled = categoryLoading || isSubmitting || productsLoading

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        Add Products to Category
                    </DialogTitle>
                    <DialogDescription>
                        {category && (
                            <>
                                Select products to add to <strong>{category.display_name}</strong> category.
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col space-y-4">
                    {/* Search and Filters */}
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                                disabled={isFormDisabled}
                            />
                        </div>

                        {/* Selection Summary */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">{filteredProducts.length} products available</Badge>
                                {selectedProducts.length > 0 && <Badge variant="default">{selectedProducts.length} selected</Badge>}
                            </div>

                            {selectedProducts.length > 0 && (
                                <Button variant="outline" size="sm" onClick={() => setSelectedProducts([])} disabled={isFormDisabled}>
                                    <X className="h-4 w-4 mr-1" />
                                    Clear Selection
                                </Button>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Products List */}
                    <div className="flex-1 overflow-hidden">
                        <ScrollArea className="h-[400px] pr-4">
                            {productsLoading ? (
                                <div className="space-y-4">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                                            <Skeleton className="h-4 w-4" />
                                            <Skeleton className="h-12 w-12 rounded" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-48" />
                                                <Skeleton className="h-3 w-24" />
                                            </div>
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                    ))}
                                </div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="text-center py-8">
                                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">
                                        {searchTerm ? "No products found matching your search" : "No products available"}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {/* Select All */}
                                    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                                        <Checkbox
                                            checked={
                                                paginatedProducts.length > 0 &&
                                                paginatedProducts.every((product) => selectedProducts.includes(product._id))
                                            }
                                            onCheckedChange={handleSelectAll}
                                            disabled={isFormDisabled}
                                        />
                                        <Label className="font-medium">Select all products on this page ({paginatedProducts.length})</Label>
                                    </div>

                                    {/* Product List */}
                                    {paginatedProducts.map((product) => (
                                        <div
                                            key={product._id}
                                            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                            onClick={() => { handleSelectProduct(product._id, !selectedProducts.includes(product._id)) }}
                                        >
                                            <Checkbox
                                                checked={selectedProducts.includes(product._id)}
                                                onCheckedChange={(checked) => handleSelectProduct(product._id, checked as boolean)}
                                                disabled={isFormDisabled}
                                            />

                                            <div className="h-12 w-12 rounded bg-muted flex items-center justify-center overflow-hidden">
                                                {product.images && product.images[0] ? (
                                                    <img
                                                        src={product.images[0] || "/placeholder.svg"}
                                                        alt={product.name}
                                                        className="h-12 w-12 object-cover"
                                                    />
                                                ) : (
                                                    <Package className="h-6 w-6 text-muted-foreground" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{product.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                                                    {product.store_category_id && (
                                                        <Badge variant="outline" className="text-xs">
                                                            <Tag className="h-3 w-3 mr-1" />
                                                            Already categorized
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1 || isFormDisabled}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages || isFormDisabled}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={handleClose} disabled={isFormDisabled}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isFormDisabled}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Assigning...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                {editProducts ? "Update" : `Add ${selectedProducts.length} Product${selectedProducts.length !== 1 ? "s" : ""}`}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
