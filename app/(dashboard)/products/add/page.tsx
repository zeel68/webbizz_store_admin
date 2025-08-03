"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, X, Upload, Trash2, Save, ArrowLeft, Eye, EyeOff, Star, Package, Tag, Settings, Search, DollarSign, Truck, BarChart3, Image as ImageIcon, Info } from "lucide-react"
import { toast } from "sonner"
import { useProductStore } from "@/store/productStore"
import { useCategoryStore } from "@/store/categoryStore"

interface ProductPageProps {
    productId?: string // If provided, we're editing; otherwise creating
}

interface iProductFormData {
    name: string
    description: string
    price: number
    compare_price?: number
    cost_price?: number
    store_category_id: string
    brand: string
    sku: string
    stock: {
        quantity: number
        track_inventory: boolean
        low_stock_threshold: number
        allow_backorder: boolean
    }
    attributes: Record<string, string>
    specifications: Record<string, string>
    tags: string[]
    seo: {
        title: string
        description: string
        keywords: string[]
    }
    shipping: {
        weight?: number
        dimensions?: {
            length: number
            width: number
            height: number
        }
    }
    variants: Array<{
        name: string
        options: string[]
        price_modifier: number
    }>
    is_active: boolean
    is_featured: boolean
    visibility: "public" | "private" | "hidden"
}

interface iProduct extends iProductFormData {
    id: string
}

export default function ProductPage({ productId }: ProductPageProps) {
    const router = useRouter()
    const { createProduct, updateProduct, productInfo } = useProductStore()
    const { categories, fetchCategories } = useCategoryStore()

    const [activeSection, setActiveSection] = useState("basic")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDirty, setIsDirty] = useState(false)
    const [newTag, setNewTag] = useState("")
    const [newKeyword, setNewKeyword] = useState("")
    const [newAttribute, setNewAttribute] = useState({ key: "", value: "" })
    const [newSpecification, setNewSpecification] = useState({ key: "", value: "" })
    const [newVariant, setNewVariant] = useState({
        name: "",
        options: [] as string[],
        price_modifier: 0,
    })
    const [newVariantOption, setNewVariantOption] = useState("")
    const [editingProduct, setEditingProduct] = useState<iProduct | null>(null)
    const [selectedImages, setSelectedImages] = useState<File[]>([])
    const [existingImages, setExistingImages] = useState<string[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState<iProductFormData>({
        name: "",
        description: "",
        price: 0,
        compare_price: undefined,
        cost_price: undefined,
        store_category_id: "",
        brand: "",
        sku: "",
        stock: {
            quantity: 0,
            track_inventory: true,
            low_stock_threshold: 10,
            allow_backorder: false,
        },
        attributes: {},
        specifications: {},
        tags: [],
        seo: {
            title: "",
            description: "",
            keywords: [],
        },
        shipping: {
            weight: undefined,
            dimensions: undefined,
        },
        variants: [],
        is_active: true,
        is_featured: false,
        visibility: "public",
    })

    const sections = [
        { id: "basic", label: "Basic", icon: Info },
        { id: "pricing", label: "Pricing", icon: DollarSign },
        { id: "inventory", label: "Inventory", icon: BarChart3 },
        { id: "attributes", label: "Attributes", icon: Tag },
        { id: "shipping", label: "Shipping", icon: Truck },
        { id: "seo", label: "SEO", icon: Search },
        { id: "advanced", label: "Advanced", icon: Settings },
    ]

    useEffect(() => {
        if (categories.length === 0) {
            fetchCategories(true)
        }
    }, [categories.length, fetchCategories])

    useEffect(() => {
        if (productId && productInfo?.products) {
            // Fetch product data for editing
            const fetchProduct = async () => {
                try {
                    const product = productInfo.products.find(tproduct => tproduct.id === productId)
                    if (product) {
                        setEditingProduct(product)
                        setFormData({
                            name: product.name,
                            description: product.description,
                            price: product.price,
                            compare_price: product.compare_price,
                            cost_price: product.cost_price,
                            store_category_id: product.store_category_id,
                            brand: product.brand || "",
                            sku: product.sku || "",
                            stock: product.stock,
                            attributes: product.attributes || {},
                            specifications: product.specifications || {},
                            tags: product.tags || [],
                            seo: {
                                title: product.seo?.title || "",
                                description: product.seo?.description || "",
                                keywords: product.seo?.keywords || [],
                            },
                            shipping: {
                                weight: product.shipping?.weight,
                                dimensions: product.shipping?.dimensions,
                            },
                            variants: product.variants || [],
                            is_active: product.is_active,
                            is_featured: product.is_featured,
                            visibility: product.visibility,
                        })

                        // Set existing images if editing
                        if (product.images && product.images.length > 0) {
                            setExistingImages(product.images)
                        }
                    }
                } catch (error) {
                    toast.error("Failed to load product")
                    router.push("/products")
                }
            }
            fetchProduct()
        }
    }, [productId, router, productInfo])

    const uploadToCloudinary = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            // Simulate upload process
            setTimeout(() => {
                const url = URL.createObjectURL(file)
                resolve(url)
            }, 500)
        })
    }

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files)
            const newImages = [...selectedImages]

            for (const file of files) {
                // Only allow image files
                if (!file.type.match('image.*')) {
                    toast.error("Only image files are allowed")
                    continue
                }

                // Check file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    toast.error("File size must be less than 5MB")
                    continue
                }

                try {
                    const url = await uploadToCloudinary(file)
                    newImages.push(file)
                } catch (error) {
                    toast.error("Failed to upload image")
                    console.error(error)
                }
            }

            setSelectedImages(newImages)
        }
    }

    const handleRemoveImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index))
    }

    const handleRemoveExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            toast.error("Product name is required")
            setActiveSection("basic")
            return
        }

        if (formData.price <= 0) {
            toast.error("Product price must be greater than 0")
            setActiveSection("pricing")
            return
        }

        if (!formData.store_category_id) {
            toast.error("Please select a category")
            setActiveSection("basic")
            return
        }

        if (formData.stock.track_inventory && formData.stock.quantity < 0) {
            toast.error("Stock quantity cannot be negative")
            setActiveSection("inventory")
            return
        }

        setIsSubmitting(true)
        try {
            // Upload selected images
            const uploadedImageUrls = []
            for (const file of selectedImages) {
                try {
                    const url = await uploadToCloudinary(file)
                    uploadedImageUrls.push(url)
                } catch (error) {
                    console.error("Failed to upload image", error)
                }
            }

            const productData = {
                ...formData,
                price: Number(formData.price),
                compare_price: formData.compare_price ? Number(formData.compare_price) : undefined,
                cost_price: formData.cost_price ? Number(formData.cost_price) : undefined,
                images: [...existingImages, ...uploadedImageUrls],
                stock: {
                    ...formData.stock,
                    quantity: Number(formData.stock.quantity),
                    low_stock_threshold: Number(formData.stock.low_stock_threshold),
                },
                shipping: {
                    weight: formData.shipping.weight ? Number(formData.shipping.weight) : undefined,
                    dimensions: formData.shipping.dimensions
                        ? {
                            length: Number(formData.shipping.dimensions.length),
                            width: Number(formData.shipping.dimensions.width),
                            height: Number(formData.shipping.dimensions.height),
                        }
                        : undefined,
                },
            }

            if (editingProduct) {
                await updateProduct(editingProduct.id, productData)
                toast.success("Product updated successfully")
            } else {
                await createProduct(productData)
                toast.success("Product created successfully")
            }

            setIsDirty(false)
            router.push("/products")
        } catch (error: any) {
            toast.error(error.message || (editingProduct ? "Failed to update product" : "Failed to create product"))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFormChange = (updates: Partial<iProductFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }))
        setIsDirty(true)
    }

    const handleAddTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            handleFormChange({ tags: [...formData.tags, newTag.trim()] })
            setNewTag("")
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        handleFormChange({ tags: formData.tags.filter(t => t !== tagToRemove) })
    }

    const handleAddKeyword = () => {
        if (newKeyword.trim() && !formData.seo.keywords.includes(newKeyword.trim())) {
            handleFormChange({
                seo: {
                    ...formData.seo,
                    keywords: [...formData.seo.keywords, newKeyword.trim()],
                },
            })
            setNewKeyword("")
        }
    }

    const handleRemoveKeyword = (keyword: string) => {
        handleFormChange({
            seo: {
                ...formData.seo,
                keywords: formData.seo.keywords.filter((k) => k !== keyword),
            },
        })
    }

    const handleAddAttribute = () => {
        if (newAttribute.key.trim() && newAttribute.value.trim()) {
            handleFormChange({
                attributes: {
                    ...formData.attributes,
                    [newAttribute.key.trim()]: newAttribute.value.trim(),
                },
            })
            setNewAttribute({ key: "", value: "" })
        }
    }

    const handleRemoveAttribute = (key: string) => {
        const newAttributes = { ...formData.attributes }
        delete newAttributes[key]
        handleFormChange({ attributes: newAttributes })
    }

    const handleAddSpecification = () => {
        if (newSpecification.key.trim() && newSpecification.value.trim()) {
            handleFormChange({
                specifications: {
                    ...formData.specifications,
                    [newSpecification.key.trim()]: newSpecification.value.trim(),
                },
            })
            setNewSpecification({ key: "", value: "" })
        }
    }

    const handleRemoveSpecification = (key: string) => {
        const newSpecifications = { ...formData.specifications }
        delete newSpecifications[key]
        handleFormChange({ specifications: newSpecifications })
    }

    const handleAddVariantOption = () => {
        if (newVariantOption.trim() && !newVariant.options.includes(newVariantOption.trim())) {
            setNewVariant((prev) => ({
                ...prev,
                options: [...prev.options, newVariantOption.trim()],
            }))
            setNewVariantOption("")
        }
    }

    const handleRemoveVariantOption = (option: string) => {
        setNewVariant((prev) => ({
            ...prev,
            options: prev.options.filter((o) => o !== option),
        }))
    }

    const handleAddVariant = () => {
        if (newVariant.name.trim() && newVariant.options.length > 0) {
            handleFormChange({
                variants: [...formData.variants, { ...newVariant }],
            })
            setNewVariant({
                name: "",
                options: [],
                price_modifier: 0,
            })
        }
    }

    const handleRemoveVariant = (index: number) => {
        handleFormChange({
            variants: formData.variants.filter((_, i) => i !== index),
        })
    }

    const renderBasicSection = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-900/50 border-gray-800">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-gray-100 flex items-center gap-2">
                            <Package className="h-5 w-5 text-blue-400" />
                            Product Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-300 flex items-center gap-1">
                                Product Name <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleFormChange({ name: e.target.value })}
                                placeholder="Enter product name"
                                className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-gray-300 flex items-center gap-1">
                                Category <span className="text-red-400">*</span>
                            </Label>
                            <Select
                                value={formData.store_category_id}
                                onValueChange={(value) => handleFormChange({ store_category_id: value })}
                            >
                                <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700">
                                    {categories.map((category: any) => (
                                        <SelectItem key={category._id} value={category._id} className="text-gray-100 hover:bg-gray-700">
                                            {category.display_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="brand" className="text-gray-300">Brand</Label>
                                <Input
                                    id="brand"
                                    value={formData.brand}
                                    onChange={(e) => handleFormChange({ brand: e.target.value })}
                                    placeholder="Enter brand name"
                                    className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sku" className="text-gray-300">SKU</Label>
                                <Input
                                    id="sku"
                                    value={formData.sku}
                                    onChange={(e) => handleFormChange({ sku: e.target.value })}
                                    placeholder="Enter product SKU"
                                    className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-gray-300">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleFormChange({ description: e.target.value })}
                                placeholder="Describe your product in detail..."
                                rows={4}
                                className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 resize-none"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-800">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-gray-100 flex items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-purple-400" />
                            Product Images
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div
                                className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-gray-600 transition-colors bg-gray-800/30 cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                                <div className="space-y-2">
                                    <p className="text-lg font-medium text-gray-300">Upload product images</p>
                                    <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB each</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="mt-4 border-gray-700 text-gray-300 hover:bg-gray-800"
                                >
                                    Select Images
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                            </div>

                            {/* Image previews */}
                            {(existingImages.length > 0 || selectedImages.length > 0) && (
                                <div className="mt-6">
                                    <Label className="text-gray-300 mb-2 block">Selected Images</Label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {existingImages.map((url, index) => (
                                            <div key={`existing-${index}`} className="relative group">
                                                <img
                                                    src={url}
                                                    alt={`Product image ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg border border-gray-700"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleRemoveExistingImage(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}

                                        {selectedImages.map((file, index) => (
                                            <div key={`new-${index}`} className="relative group">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`New image ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg border border-gray-700"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleRemoveImage(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-4">
                    <CardTitle className="text-gray-100 flex items-center gap-2">
                        <Tag className="h-5 w-5 text-green-400" />
                        Tags
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add a tag"
                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                            className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
                        />
                        <Button type="button" onClick={handleAddTag} variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1">
                                    {tag}
                                    <X
                                        className="h-3 w-3 ml-2 cursor-pointer hover:text-red-400"
                                        onClick={() => handleRemoveTag(tag)}
                                    />
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )

    const renderPricingSection = () => (
        <div className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-4">
                    <CardTitle className="text-gray-100 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-400" />
                        Pricing Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-gray-300 flex items-center gap-1">
                                Selling Price <span className="text-red-400">*</span>
                            </Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => handleFormChange({ price: Number(e.target.value) })}
                                    className="pl-10 text-lg font-medium bg-gray-800 border-gray-700 text-gray-100"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="compare_price" className="text-gray-300">Compare At Price</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    id="compare_price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.compare_price || ""}
                                    onChange={(e) =>
                                        handleFormChange({
                                            compare_price: e.target.value ? Number(e.target.value) : undefined,
                                        })
                                    }
                                    className="pl-10 bg-gray-800 border-gray-700 text-gray-100"
                                    placeholder="0.00"
                                />
                            </div>
                            <p className="text-xs text-gray-500">Show customers the original price</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cost_price" className="text-gray-300">Cost Price</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    id="cost_price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.cost_price || ""}
                                    onChange={(e) =>
                                        handleFormChange({
                                            cost_price: e.target.value ? Number(e.target.value) : undefined,
                                        })
                                    }
                                    className="pl-10 bg-gray-800 border-gray-700 text-gray-100"
                                    placeholder="0.00"
                                />
                            </div>
                            <p className="text-xs text-gray-500">For profit margin calculations</p>
                        </div>
                    </div>

                    {formData.price > 0 && formData.compare_price && formData.compare_price > formData.price && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-green-400">
                                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                <p className="font-medium">
                                    Discount: {Math.round(((formData.compare_price - formData.price) / formData.compare_price) * 100)}% off
                                </p>
                            </div>
                            <p className="text-sm text-green-300 mt-1">
                                Customers save ${(formData.compare_price - formData.price).toFixed(2)}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )

    const renderInventorySection = () => (
        <div className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-4">
                    <CardTitle className="text-gray-100 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-orange-400" />
                        Inventory Management
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="quantity" className="text-gray-300">Stock Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="0"
                                value={formData.stock.quantity}
                                onChange={(e) =>
                                    handleFormChange({
                                        stock: { ...formData.stock, quantity: Number(e.target.value) },
                                    })
                                }
                                placeholder="0"
                                className="text-lg bg-gray-800 border-gray-700 text-gray-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="low_stock_threshold" className="text-gray-300">Low Stock Alert</Label>
                            <Input
                                id="low_stock_threshold"
                                type="number"
                                min="0"
                                value={formData.stock.low_stock_threshold}
                                onChange={(e) =>
                                    handleFormChange({
                                        stock: { ...formData.stock, low_stock_threshold: Number(e.target.value) },
                                    })
                                }
                                placeholder="10"
                                className="bg-gray-800 border-gray-700 text-gray-100"
                            />
                        </div>
                    </div>

                    <Separator className="bg-gray-700" />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-800/30">
                            <div className="space-y-1">
                                <Label htmlFor="track_inventory" className="text-base font-medium text-gray-300">Track Inventory</Label>
                                <p className="text-sm text-gray-500">Monitor stock levels for this product</p>
                            </div>
                            <Switch
                                id="track_inventory"
                                checked={formData.stock.track_inventory}
                                onCheckedChange={(checked) =>
                                    handleFormChange({
                                        stock: { ...formData.stock, track_inventory: checked },
                                    })
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-800/30">
                            <div className="space-y-1">
                                <Label htmlFor="allow_backorder" className="text-base font-medium text-gray-300">Allow Backorder</Label>
                                <p className="text-sm text-gray-500">Accept orders when out of stock</p>
                            </div>
                            <Switch
                                id="allow_backorder"
                                checked={formData.stock.allow_backorder}
                                onCheckedChange={(checked) =>
                                    handleFormChange({
                                        stock: { ...formData.stock, allow_backorder: checked },
                                    })
                                }
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )

    const renderAttributesSection = () => (
        <div className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-4">
                    <CardTitle className="text-gray-100 flex items-center gap-2">
                        <Tag className="h-5 w-5 text-purple-400" />
                        Product Attributes
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {Object.keys(formData.attributes).length > 0 && (
                        <div className="space-y-3">
                            {Object.entries(formData.attributes).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="border-purple-500/30 text-purple-300">{key}</Badge>
                                        <span className="font-medium text-gray-300">{String(value)}</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveAttribute(key)}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    <Separator className="bg-gray-700" />

                    <div className="space-y-4">
                        <Label className="text-gray-300">Add New Attribute</Label>
                        <div className="flex gap-2">
                            <Input
                                value={newAttribute.key}
                                onChange={(e) => setNewAttribute((prev) => ({ ...prev, key: e.target.value }))}
                                placeholder="Attribute name (e.g., Color)"
                                className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
                            />
                            <Input
                                value={newAttribute.value}
                                onChange={(e) => setNewAttribute((prev) => ({ ...prev, value: e.target.value }))}
                                placeholder="Attribute value (e.g., Red)"
                                className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
                            />
                            <Button type="button" onClick={handleAddAttribute} variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-4">
                    <CardTitle className="text-gray-100">Product Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {Object.keys(formData.specifications).length > 0 && (
                        <div className="space-y-3">
                            {Object.entries(formData.specifications).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="border-blue-500/30 text-blue-300">{key}</Badge>
                                        <span className="font-medium text-gray-300">{String(value)}</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveSpecification(key)}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    <Separator className="bg-gray-700" />

                    <div className="space-y-4">
                        <Label className="text-gray-300">Add New Specification</Label>
                        <div className="flex gap-2">
                            <Input
                                value={newSpecification.key}
                                onChange={(e) => setNewSpecification((prev) => ({ ...prev, key: e.target.value }))}
                                placeholder="Specification name (e.g., Material)"
                                className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
                            />
                            <Input
                                value={newSpecification.value}
                                onChange={(e) => setNewSpecification((prev) => ({ ...prev, value: e.target.value }))}
                                placeholder="Specification value (e.g., Cotton)"
                                className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
                            />
                            <Button type="button" onClick={handleAddSpecification} variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Product Variants */}
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-4">
                    <CardTitle className="text-gray-100">Product Variants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {formData.variants.length > 0 && (
                        <div className="space-y-4">
                            {formData.variants.map((variant, index) => (
                                <div key={index} className="border border-gray-700 rounded-lg p-4 bg-gray-800/30">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-lg text-gray-200">{variant.name}</h4>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveVariant(index)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {variant.options.map((option, optIndex) => (
                                            <Badge key={optIndex} variant="secondary" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-2 py-1">
                                                {option}
                                            </Badge>
                                        ))}
                                    </div>
                                    {variant.price_modifier !== 0 && (
                                        <p className="text-sm text-gray-400">
                                            Price modifier: {variant.price_modifier > 0 ? "+" : ""}
                                            ${variant.price_modifier.toFixed(2)}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <Separator className="bg-gray-700" />

                    <div className="space-y-4 border border-gray-700 rounded-lg p-4 bg-blue-500/5">
                        <h4 className="font-semibold text-gray-200">Add New Variant</h4>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Variant Name</Label>
                            <Input
                                value={newVariant.name}
                                onChange={(e) => setNewVariant((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., Size, Color, Style"
                                className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Options</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newVariantOption}
                                    onChange={(e) => setNewVariantOption(e.target.value)}
                                    placeholder="Add option (e.g., Small, Large)"
                                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddVariantOption())}
                                    className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
                                />
                                <Button type="button" onClick={handleAddVariantOption} variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            {newVariant.options.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {newVariant.options.map((option, index) => (
                                        <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 flex items-center px-2 py-1">
                                            {option}
                                            <X
                                                className="h-3 w-3 ml-1 cursor-pointer hover:text-red-400"
                                                onClick={() => handleRemoveVariantOption(option)}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Price Modifier</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={newVariant.price_modifier}
                                onChange={(e) =>
                                    setNewVariant((prev) => ({ ...prev, price_modifier: Number(e.target.value) }))
                                }
                                placeholder="0.00"
                                className="bg-gray-800 border-gray-700 text-gray-100"
                            />
                            <p className="text-xs text-gray-500">Additional cost (+) or discount (-) for this variant</p>
                        </div>

                        <Button
                            type="button"
                            onClick={handleAddVariant}
                            disabled={!newVariant.name.trim() || newVariant.options.length === 0}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Add Variant
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )

    const renderShippingSection = () => (
        <div className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-4">
                    <CardTitle className="text-gray-100 flex items-center gap-2">
                        <Truck className="h-5 w-5 text-indigo-400" />
                        Shipping Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="weight" className="text-gray-300">Weight (kg)</Label>
                        <Input
                            id="weight"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.shipping.weight || ""}
                            onChange={(e) =>
                                handleFormChange({
                                    shipping: {
                                        ...formData.shipping,
                                        weight: e.target.value ? Number(e.target.value) : undefined,
                                    },
                                })
                            }
                            placeholder="0.00"
                            className="bg-gray-800 border-gray-700 text-gray-100"
                        />
                    </div>

                    <div className="space-y-4">
                        <Label className="text-gray-300">Dimensions (cm)</Label>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-500">Length</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.shipping.dimensions?.length || ""}
                                    onChange={(e) =>
                                        handleFormChange({
                                            shipping: {
                                                ...formData.shipping,
                                                dimensions: {
                                                    ...formData.shipping.dimensions,
                                                    length: e.target.value ? Number(e.target.value) : 0,
                                                    width: formData.shipping.dimensions?.width || 0,
                                                    height: formData.shipping.dimensions?.height || 0,
                                                },
                                            },
                                        })
                                    }
                                    placeholder="Length"
                                    className="bg-gray-800 border-gray-700 text-gray-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-500">Width</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.shipping.dimensions?.width || ""}
                                    onChange={(e) =>
                                        handleFormChange({
                                            shipping: {
                                                ...formData.shipping,
                                                dimensions: {
                                                    ...formData.shipping.dimensions,
                                                    length: formData.shipping.dimensions?.length || 0,
                                                    width: e.target.value ? Number(e.target.value) : 0,
                                                    height: formData.shipping.dimensions?.height || 0,
                                                },
                                            },
                                        })
                                    }
                                    placeholder="Width"
                                    className="bg-gray-800 border-gray-700 text-gray-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-500">Height</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.shipping.dimensions?.height || ""}
                                    onChange={(e) =>
                                        handleFormChange({
                                            shipping: {
                                                ...formData.shipping,
                                                dimensions: {
                                                    ...formData.shipping.dimensions,
                                                    length: formData.shipping.dimensions?.length || 0,
                                                    width: formData.shipping.dimensions?.width || 0,
                                                    height: e.target.value ? Number(e.target.value) : 0,
                                                },
                                            },
                                        })
                                    }
                                    placeholder="Height"
                                    className="bg-gray-800 border-gray-700 text-gray-100"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )

    const renderSEOSection = () => (
        <div className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-4">
                    <CardTitle className="text-gray-100 flex items-center gap-2">
                        <Search className="h-5 w-5 text-pink-400" />
                        SEO Optimization
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="seo_title" className="text-gray-300">SEO Title</Label>
                        <Input
                            id="seo_title"
                            value={formData.seo.title}
                            onChange={(e) =>
                                handleFormChange({
                                    seo: { ...formData.seo, title: e.target.value },
                                })
                            }
                            placeholder="Enter SEO title"
                            className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
                        />
                        <p className="text-xs text-gray-500">
                            {formData.seo.title.length}/60 characters (recommended)
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="seo_description" className="text-gray-300">SEO Description</Label>
                        <Textarea
                            id="seo_description"
                            value={formData.seo.description}
                            onChange={(e) =>
                                handleFormChange({
                                    seo: { ...formData.seo, description: e.target.value },
                                })
                            }
                            placeholder="Enter SEO meta description"
                            rows={3}
                            className="resize-none bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
                        />
                        <p className="text-xs text-gray-500">
                            {formData.seo.description.length}/160 characters (recommended)
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-gray-300">SEO Keywords</Label>
                        <div className="flex gap-2">
                            <Input
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                placeholder="Add keyword"
                                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
                                className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
                            />
                            <Button type="button" onClick={handleAddKeyword} variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        {formData.seo.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {formData.seo.keywords.map((keyword, index) => (
                                    <Badge key={index} variant="secondary" className="bg-pink-500/20 text-pink-300 border-pink-500/30 px-3 py-1">
                                        {keyword}
                                        <X
                                            className="h-3 w-3 ml-2 cursor-pointer hover:text-red-400"
                                            onClick={() => handleRemoveKeyword(keyword)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )

    const renderAdvancedSection = () => (
        <div className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-4">
                    <CardTitle className="text-gray-100 flex items-center gap-2">
                        <Settings className="h-5 w-5 text-gray-400" />
                        Product Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="visibility" className="text-gray-300">Product Visibility</Label>
                        <Select
                            value={formData.visibility}
                            onValueChange={(value: "public" | "private" | "hidden") =>
                                handleFormChange({ visibility: value })
                            }
                        >
                            <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                                <SelectItem value="public" className="text-gray-100 hover:bg-gray-700">
                                    <div className="flex items-center gap-2">
                                        <Eye className="h-4 w-4" />
                                        Public - Visible to everyone
                                    </div>
                                </SelectItem>
                                <SelectItem value="private" className="text-gray-100 hover:bg-gray-700">
                                    <div className="flex items-center gap-2">
                                        <EyeOff className="h-4 w-4" />
                                        Private - Only visible to admins
                                    </div>
                                </SelectItem>
                                <SelectItem value="hidden" className="text-gray-100 hover:bg-gray-700">
                                    <div className="flex items-center gap-2">
                                        <EyeOff className="h-4 w-4" />
                                        Hidden - Not visible anywhere
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator className="bg-gray-700" />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-800/30">
                            <div className="space-y-1">
                                <Label htmlFor="is_active" className="text-base font-medium text-gray-300 flex items-center gap-2">
                                    <div className={`h-3 w-3 rounded-full ${formData.is_active ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                    Active Status
                                </Label>
                                <p className="text-sm text-gray-500">Make this product available for purchase</p>
                            </div>
                            <Switch
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) => handleFormChange({ is_active: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-800/30">
                            <div className="space-y-1">
                                <Label htmlFor="is_featured" className="text-base font-medium text-gray-300 flex items-center gap-2">
                                    <Star className={`h-4 w-4 ${formData.is_featured ? 'text-yellow-500 fill-current' : 'text-gray-500'}`} />
                                    Featured Product
                                </Label>
                                <p className="text-sm text-gray-500">Show this product in featured sections</p>
                            </div>
                            <Switch
                                id="is_featured"
                                checked={formData.is_featured}
                                onCheckedChange={(checked) => handleFormChange({ is_featured: checked })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )

    const renderSection = () => {
        switch (activeSection) {
            case "basic": return renderBasicSection()
            case "pricing": return renderPricingSection()
            case "inventory": return renderInventorySection()
            case "attributes": return renderAttributesSection()
            case "shipping": return renderShippingSection()
            case "seo": return renderSEOSection()
            case "advanced": return renderAdvancedSection()
            default: return renderBasicSection()
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
                <div className=" mx-auto 4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-xl font-semibold text-gray-100">
                                    {editingProduct ? "Edit Product" : "Create New Product"}
                                </h1>
                                {editingProduct && (
                                    <p className="text-sm text-gray-500">ID: {editingProduct.id}</p>
                                )}
                            </div>
                            {isDirty && (
                                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                                    Unsaved changes
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => router.push("/products")}
                                disabled={isSubmitting}
                                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-gray-100"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !formData.name.trim()}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Save className="h-4 w-4" />
                                {isSubmitting ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="space-y-6">
                    {/* Top Tabs Navigation */}
                    <Tabs value={activeSection} onValueChange={setActiveSection}>
                        <TabsList className="w-full grid grid-cols-7 h-12  bg-gray-900 border border-gray-800 rounded-lg">
                            {sections.map((section) => {
                                const Icon = section.icon
                                return (
                                    <TabsTrigger
                                        key={section.id}
                                        value={section.id}
                                        className="flex items-center gap-2 py-2 px-4 text-sm font-medium"
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{section.label}</span>
                                    </TabsTrigger>
                                )
                            })}
                        </TabsList>
                    </Tabs>

                    {/* Main Content */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {renderSection()}

                                {/* Save button at bottom of form */}
                                <div className="sticky bottom-6 bg-gray-900/80 backdrop-blur-lg p-4 rounded-lg border border-gray-800 z-10">
                                    <div className="flex justify-end gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => router.push("/products")}
                                            disabled={isSubmitting}
                                            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-gray-100"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting || !formData.name.trim()}
                                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            <Save className="h-4 w-4" />
                                            {isSubmitting
                                                ? "Saving..."
                                                : editingProduct
                                                    ? "Update Product"
                                                    : "Create Product"}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}