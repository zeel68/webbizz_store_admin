"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Package,
    Edit,
    ImageIcon,
    Info,
    DollarSign,
    Archive,
    Tag,
    Search,
    Settings,
    Truck,
    BarChart3,
    Star,
    Eye,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Product {
    _id: string
    name: string
    description: string
    price: number
    discount_price?: number
    cost_price?: number
    category_id?: string
    brand?: string
    sku?: string
    stock?: {
        quantity: number
        low_stock_threshold?: number
    }
    attributes?: Record<string, any>
    specifications?: Record<string, any>
    tags?: Array<string | { tagName: string }>
    seo?: {
        title: string
        description: string
        keywords: string[]
    }
    shipping?: {
        weight?: number
        dimensions?: {
            length: number
            width: number
            height: number
        }
    }
    variants?: Array<{
        name: string
        options: string[]
        price_modifier?: number
    }>
    is_active: boolean
    is_featured?: boolean
    visibility?: "public" | "private" | "hidden"
    images?: string[]
    created_at?: string
    updated_at?: string
}

interface ProductDetailsDialogProps {
    product: Product | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onEdit?: (product: Product) => void
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

    const getTagName = (tag: string | { tagName: string }) => {
        return typeof tag === "string" ? tag : tag.tagName || ""
    }

    const getStockStatus = () => {
        const quantity = product.stock?.quantity || 0
        const threshold = product.stock?.low_stock_threshold || 10

        if (quantity === 0) return { status: "Out of Stock", variant: "destructive" as const }
        if (quantity <= threshold) return { status: "Low Stock", variant: "secondary" as const }
        return { status: "In Stock", variant: "default" as const }
    }

    const stockStatus = getStockStatus()

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
                        <TabsList className="grid w-full grid-cols-6">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="pricing">Pricing</TabsTrigger>
                            <TabsTrigger value="inventory">Inventory</TabsTrigger>
                            <TabsTrigger value="attributes">Attributes</TabsTrigger>
                            <TabsTrigger value="seo">SEO</TabsTrigger>
                            <TabsTrigger value="advanced">Advanced</TabsTrigger>
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
                                                {product.images.map((image, index) => (
                                                    <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                                                        <img
                                                            src={image}
                                                            alt={`${product.name} ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        // onError={(e) => {
                                                        //     e.currentTarget.src = "/placeholder.svg"
                                                        // }}
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
                                                <p className="font-medium">{getCategoryName(product.category_id)}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Description</label>
                                            <p className="text-sm mt-1">{product.description || "No description available"}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Brand</label>
                                                <p className="font-medium">{product.brand || "No brand specified"}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">SKU</label>
                                                <p className="font-mono text-sm bg-muted px-2 py-1 rounded">{product.sku || "No SKU"}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Status</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant={product.is_active ? "default" : "secondary"}>
                                                    {product.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                                {product.is_featured && (
                                                    <Badge variant="outline">
                                                        <Star className="h-3 w-3 mr-1" />
                                                        Featured
                                                    </Badge>
                                                )}
                                                <Badge variant="outline">
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    {product.visibility || "Public"}
                                                </Badge>
                                            </div>
                                        </div>

                                        {product.tags && product.tags.length > 0 && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Tags</label>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {product.tags.map((tag, index) => (
                                                        <Badge key={index} variant="secondary">
                                                            {getTagName(tag)}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="pricing" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Pricing Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <label className="text-sm font-medium text-muted-foreground">Selling Price</label>
                                            <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(product.price)}</p>
                                        </div>

                                        {product.discount_price && (
                                            <div className="text-center p-4 bg-orange-50 rounded-lg">
                                                <label className="text-sm font-medium text-muted-foreground">Discount Price</label>
                                                <p className="text-2xl font-bold text-orange-600 mt-1">
                                                    {formatCurrency(product.discount_price)}
                                                </p>
                                            </div>
                                        )}

                                        {product.cost_price && (
                                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                                <label className="text-sm font-medium text-muted-foreground">Cost Price</label>
                                                <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(product.cost_price)}</p>
                                            </div>
                                        )}
                                    </div>

                                    {product.discount_price && (
                                        <div className="mt-4 p-4 bg-muted rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Discount Amount:</span>
                                                <span className="text-lg font-bold text-red-600">
                                                    -{formatCurrency(product.price - product.discount_price)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="font-medium">Discount Percentage:</span>
                                                <span className="text-lg font-bold text-red-600">
                                                    -{Math.round(((product.price - product.discount_price) / product.price) * 100)}%
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="inventory" className="space-y-6 mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Archive className="h-5 w-5" />
                                            Stock Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                                            <span className="font-medium">Current Stock:</span>
                                            <span className="text-2xl font-bold">{product.stock?.quantity || 0}</span>
                                        </div>

                                        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                                            <span className="font-medium">Stock Status:</span>
                                            <Badge variant={stockStatus.variant}>{stockStatus.status}</Badge>
                                        </div>

                                        {product.stock?.low_stock_threshold && (
                                            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                                                <span className="font-medium">Low Stock Threshold:</span>
                                                <span className="font-bold">{product.stock.low_stock_threshold}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {product.shipping && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Truck className="h-5 w-5" />
                                                Shipping Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {product.shipping.weight && (
                                                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                                                    <span className="font-medium">Weight:</span>
                                                    <span className="font-bold">{product.shipping.weight} kg</span>
                                                </div>
                                            )}

                                            {product.shipping.dimensions && (
                                                <div className="p-4 bg-muted rounded-lg">
                                                    <span className="font-medium block mb-2">Dimensions (L × W × H):</span>
                                                    <span className="font-bold">
                                                        {product.shipping.dimensions.length} × {product.shipping.dimensions.width} ×{" "}
                                                        {product.shipping.dimensions.height} cm
                                                    </span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="attributes" className="space-y-6 mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {product.attributes && Object.keys(product.attributes).length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Tag className="h-5 w-5" />
                                                Product Attributes
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {Object.entries(product.attributes).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                                        <span className="font-medium">{key}:</span>
                                                        <span className="text-sm">{String(value)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {product.specifications && Object.keys(product.specifications).length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <BarChart3 className="h-5 w-5" />
                                                Specifications
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {Object.entries(product.specifications).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                                        <span className="font-medium">{key}:</span>
                                                        <span className="text-sm">{String(value)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {product.variants && product.variants.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Settings className="h-5 w-5" />
                                            Product Variants
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {product.variants.map((variant, index) => (
                                                <div key={index} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="font-medium">{variant.name}</h4>
                                                        {variant.price_modifier !== 0 && (
                                                            <Badge variant="outline">
                                                                {variant.price_modifier ?? 0 > 0 ? "+" : ""}
                                                                {variant.price_modifier}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {variant.options.map((option, optIndex) => (
                                                            <Badge key={optIndex} variant="secondary">
                                                                {option}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="seo" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Search className="h-5 w-5" />
                                        SEO Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">SEO Title</label>
                                        <p className="font-medium mt-1">{product.seo?.title || "No SEO title set"}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">SEO Description</label>
                                        <p className="text-sm mt-1">{product.seo?.description || "No SEO description set"}</p>
                                    </div>

                                    {product.seo?.keywords && product.seo.keywords.length > 0 && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">SEO Keywords</label>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {product.seo.keywords.map((keyword, index) => (
                                                    <Badge key={index} variant="outline">
                                                        {keyword}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="advanced" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="h-5 w-5" />
                                        Advanced Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                                                <span className="font-medium">Product Status:</span>
                                                <Badge variant={product.is_active ? "default" : "secondary"}>
                                                    {product.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </div>

                                            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                                                <span className="font-medium">Featured Product:</span>
                                                <Badge variant={product.is_featured ? "default" : "outline"}>
                                                    {product.is_featured ? "Yes" : "No"}
                                                </Badge>
                                            </div>

                                            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                                                <span className="font-medium">Visibility:</span>
                                                <Badge variant="outline">{product.visibility || "Public"}</Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {product.created_at && (
                                                <div className="p-4 bg-muted rounded-lg">
                                                    <span className="font-medium block mb-1">Created:</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {new Date(product.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}

                                            {product.updated_at && (
                                                <div className="p-4 bg-muted rounded-lg">
                                                    <span className="font-medium block mb-1">Last Updated:</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {new Date(product.updated_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="p-4 bg-muted rounded-lg">
                                                <span className="font-medium block mb-1">Product ID:</span>
                                                <span className="font-mono text-xs text-muted-foreground">{product._id}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
