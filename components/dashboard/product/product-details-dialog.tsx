"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Edit, ImageIcon, Info, Star, Users, Palette, Layers, Tag } from 'lucide-react'
import { formatCurrency } from "@/lib/utils"


interface ProductDetailsDialogProps {
    product: iProduct | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onEdit?: (product: iProduct) => void
    categories?: Array<{ _id: string; display_name: string }>
}

export function ProductDetailsDialog({
    product,
    open,
    onOpenChange,
    onEdit,
    categories = [],
}: ProductDetailsDialogProps) {
    if (!product) return null

    const handleEdit = () => {
        if (onEdit) {
            onEdit(product)
            onOpenChange(false)
        }
    }

    const getCategoryName = (categoryId?: string) => {
        if (!categoryId) return "Uncategorized"
        const category = categories.find((cat) => cat._id === categoryId)
        return category?.display_name || "Unknown Category"
    }

    const getStockStatus = () => {
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
            stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
        }

        if (hasHalfStar) {
            stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />)
        }

        const remainingStars = 5 - Math.ceil(rating)
        for (let i = 0; i < remainingStars; i++) {
            stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)
        }

        return stars
    }

    const stockStatus = getStockStatus()
    const availableStock = (product.stock?.quantity || 0) - (product.stock?.reserved || 0)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Package className="h-6 w-6 text-blue-600" />
                        {product.name}
                    </DialogTitle>
                    <div className="flex items-center gap-2 pr-5">
                        {onEdit && (
                            <Button onClick={handleEdit} size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Product
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <ScrollArea className="max-h-[calc(90vh-120px)]">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="inventory">Inventory</TabsTrigger>
                            <TabsTrigger value="attributes">Attributes</TabsTrigger>
                            <TabsTrigger value="variants">Variants</TabsTrigger>
                            <TabsTrigger value="reviews">Reviews</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6 mt-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Product Images */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ImageIcon className="h-5 w-5" />
                                            Product Images
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {product.images && product.images.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                {product.images.map((image: any, index: number) => (
                                                    <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                                                        <img
                                                            src={image || "/placeholder.svg"}
                                                            alt={`${product.name} ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                                                <div className="text-center">
                                                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/50" />
                                                    <p className="text-sm text-muted-foreground mt-2">No images available</p>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Basic Information */}
                                <Card className="lg:col-span-2">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Info className="h-5 w-5" />
                                            Basic Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Product Name</label>
                                                <p className="text-lg font-semibold">{product.name}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Category</label>
                                                <p className="font-medium">{getCategoryName(product.category as any)}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Description</label>
                                            <p className="text-sm mt-1">{product.description || "No description available"}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Price</label>
                                                <p className="text-2xl font-bold text-green-600">{formatCurrency(product.price)}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Rating</label>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1">
                                                        {renderStars(product.ratings?.average || 0)}
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">
                                                        ({product.ratings?.count || 0} reviews)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Status</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant={product.is_active ? "default" : "secondary"}>
                                                    {product.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                                <Badge variant={stockStatus.variant}>
                                                    {stockStatus.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="inventory" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Stock Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                                            <label className="text-sm font-medium text-muted-foreground">Total Stock</label>
                                            <p className="text-2xl font-bold text-blue-600 mt-1">{product.stock?.quantity || 0}</p>
                                        </div>

                                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                                            <label className="text-sm font-medium text-muted-foreground">Reserved</label>
                                            <p className="text-2xl font-bold text-orange-600 mt-1">{product.stock?.reserved || 0}</p>
                                        </div>

                                        <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <label className="text-sm font-medium text-muted-foreground">Available</label>
                                            <p className="text-2xl font-bold text-green-600 mt-1">{availableStock}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="attributes" className="space-y-6 mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Colors */}
                                {product.attributes?.color && product.attributes.color.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Palette className="h-5 w-5" />
                                                Colors
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                                {product.attributes.color.map((color: any, index: number) => (
                                                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                                                        <div
                                                            className="w-4 h-4 rounded border"
                                                            style={{ backgroundColor: color.colorOption.toLowerCase() }}
                                                        />
                                                        <span className="text-sm">{color.colorOption}</span>
                                                        {color.isSelected && (
                                                            <Badge variant="secondary" className="text-xs">Selected</Badge>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Sizes */}
                                {product.attributes?.size && product.attributes.size.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Layers className="h-5 w-5" />
                                                Sizes
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                                {product.attributes.size.map((size: any, index: number) => (
                                                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                                                        <Badge variant="outline">{size.sizeOption}</Badge>
                                                        {size.isSelected && (
                                                            <Badge variant="secondary" className="text-xs">Selected</Badge>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Tags */}
                            {product.tags && product.tags.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Tag className="h-5 w-5" />
                                            Product Tags
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {product.tags.map((tag: any, index: number) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline">{tag.tagName}</Badge>
                                                        <span className="text-sm text-muted-foreground">
                                                            {tag.tagType} - {tag.category}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm">{tag.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="variants" className="space-y-6 mt-6">
                            {product.variants && product.variants.length > 0 ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Package className="h-5 w-5" />
                                            Product Variants ({product.variants.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {product.variants.map((variant: any, index: number) => (
                                                <div key={index} className="border rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            {Object.entries(variant.attributes).map(([key, value]) => (
                                                                <Badge key={key} variant="secondary">
                                                                    {key}: {value as any}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-medium">
                                                                {formatCurrency(variant.price || product.price)}
                                                            </div>
                                                            {variant.price !== product.price && (
                                                                <div className="text-xs text-muted-foreground">
                                                                    ({variant.price && variant.price > product.price ? '+' : ''}{formatCurrency((variant.price || product.price) - product.price)} from base)
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                        <span>Stock: {variant.stock}</span>
                                                        <Badge variant={variant.stock > 0 ? "default" : "destructive"}>
                                                            {variant.stock > 0 ? "In Stock" : "Out of Stock"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="text-center py-8">
                                        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">No variants available for this product</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="reviews" className="space-y-6 mt-6">
                            {product.reviews && product.reviews.length > 0 ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Customer Reviews ({product.reviews.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {product.reviews.map((review: any, index: number) => (
                                                <div key={index} className="border rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            {renderStars(review.rating)}
                                                            <Badge variant={
                                                                review.status === 'published' ? 'default' :
                                                                    review.status === 'approved' ? 'secondary' :
                                                                        review.status === 'pending' ? 'outline' : 'destructive'
                                                            }>
                                                                {review.status}
                                                            </Badge>
                                                        </div>
                                                        <span className="text-sm text-muted-foreground">
                                                            {new Date(review.date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    {review.comment && (
                                                        <p className="text-sm">{review.comment}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="text-center py-8">
                                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">No reviews available for this product</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
