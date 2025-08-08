"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Loader2, Star, Package } from 'lucide-react'
import { useHomepageStore } from "@/store/homepageStore"
import { useProductStore } from "@/store/productStore"


interface TrendingProductFormData {
    product_id: string
    display_order: number
}

export function TrendingProductsManager() {
    const {
        trendingProducts,
        addTrendingProduct,
        updateTrendingProduct,
        removeTrendingProduct,
        loading
    } = useHomepageStore()
    const { productInfo, fetchProducts } = useProductStore()

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<iTrendingProduct | null>(null)
    const [formData, setFormData] = useState<TrendingProductFormData>({
        product_id: "",
        display_order: 1,
    })

    useEffect(() => {
        if (!productInfo || productInfo.products.length === 0) {
            fetchProducts({ limit: 100 })
        }
    }, [productInfo, fetchProducts])

    const availableProducts = productInfo?.products?.filter(product =>
        !trendingProducts.some(trending => trending.product_id === product._id)
    ) || []

    const handleOpenDialog = (trendingProduct?: iTrendingProduct) => {
        if (trendingProduct) {
            setEditingProduct(trendingProduct)
            setFormData({
                product_id: trendingProduct.product_id,
                display_order: trendingProduct.display_order,
            })
        } else {
            setEditingProduct(null)
            setFormData({
                product_id: "",
                display_order: trendingProducts.length + 1,
            })
        }
        setIsDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setEditingProduct(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.product_id) {
            toast.error("Please select a product")
            return
        }

        try {
            if (editingProduct) {
                await updateTrendingProduct(editingProduct._id, formData.display_order,)
                toast.success("Trending product updated successfully")
            } else {
                await addTrendingProduct(formData.product_id, formData.display_order)
                toast.success("Trending product added successfully")
            }

            handleCloseDialog()
        } catch (error: any) {
            toast.error(error.message || "Failed to save trending product")
        }
    }

    const handleDelete = async (trendingId: string) => {
        if (confirm("Are you sure you want to remove this trending product?")) {
            try {
                await removeTrendingProduct(trendingId)
                toast.success("Trending product removed successfully")
            } catch (error: any) {
                toast.error(error.message || "Failed to remove trending product")
            }
        }
    }

    const getProductInfo = (productId: string) => {
        return productInfo?.products?.find(product => product._id === productId)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Trending Products</h3>
                <Button
                    onClick={() => handleOpenDialog()}
                    className="flex items-center gap-2"
                    disabled={availableProducts.length === 0}
                >
                    <Plus className="h-4 w-4" />
                    Add Trending Product
                </Button>
            </div>

            {availableProducts.length === 0 && trendingProducts.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center">
                            No products available. Create products first to feature them as trending.
                        </p>
                    </CardContent>
                </Card>
            )}

            {trendingProducts.length === 0 && availableProducts.length > 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                        <Star className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center">
                            No trending products set. Add products to feature on your homepage.
                        </p>
                        <Button onClick={() => handleOpenDialog()} className="mt-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Trending Product
                        </Button>
                    </CardContent>
                </Card>
            )}

            {trendingProducts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trendingProducts
                        .sort((a, b) => a.display_order - b.display_order)
                        .map((trendingProduct) => {
                            const productInfo = getProductInfo(trendingProduct.product_id)
                            return (
                                <Card key={trendingProduct._id} className="overflow-hidden">
                                    <div className="aspect-video relative">
                                        <img
                                            src={productInfo?.images?.[0] || "/placeholder.svg"}
                                            alt={productInfo?.name || "Product"}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            <Badge variant="outline">
                                                #{trendingProduct.display_order}
                                            </Badge>
                                            <Badge variant="default">
                                                ${productInfo?.price || 0}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <h4 className="font-medium truncate">
                                            {productInfo?.name || "Unknown Product"}
                                        </h4>
                                        {productInfo?.description && (
                                            <p className="text-sm text-muted-foreground truncate mt-1">
                                                {productInfo.description}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleOpenDialog(trendingProduct)}
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(trendingProduct._id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <Badge variant="secondary" className="text-xs">
                                                Stock: {productInfo?.stock?.quantity || 0}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                </div>
            )}

            {/* Trending Product Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingProduct ? "Edit Trending Product" : "Add Trending Product"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="product_id">Product *</Label>
                            <Select
                                value={formData.product_id}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, product_id: value }))}
                                disabled={!!editingProduct}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {editingProduct && (
                                        <SelectItem value={editingProduct.product_id}>
                                            {getProductInfo(editingProduct.product_id)?.name || "Current Product"}
                                        </SelectItem>
                                    )}
                                    {availableProducts.map((product) => (
                                        <SelectItem key={product._id} value={product._id}>
                                            {product.name} - ${product.price}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="display_order">Display Order</Label>
                            <Input
                                id="display_order"
                                type="number"
                                min="1"
                                value={formData.display_order}
                                onChange={(e) => setFormData(prev => ({ ...prev, display_order: Number(e.target.value) }))}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingProduct ? "Update" : "Add"} Product
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
