"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
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
import { toast } from "sonner"
import { Plus, X, Trash2, Save, Package, Tag, Settings, DollarSign, Truck, Search, BarChart3, ImageIcon, Info } from 'lucide-react'
import { useProductStore } from "@/store/productStore"
import { useCategoryStore } from "@/store/categoryStore"
import ImageUpload from "@/components/shared/image-upload"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { file } from "zod"

// Define interfaces for type safety
interface iProductFormData {
    name: string
    description?: string
    price: number
    compare_price?: number
    cost_price?: number
    store_category_id?: string
    brand?: string
    sku?: string
    stock: {
        quantity: number
        track_inventory: boolean
        low_stock_threshold: number
        allow_backorder: boolean
    }
    attributes?: Record<string, any>
    specifications?: Record<string, any>
    tags?: string[]
    seo?: {
        title?: string
        description?: string
        keywords?: string[]
    }
    shipping?: {
        weight?: number
        dimensions?: {
            length?: number
            width?: number
            height?: number
        }
    }
    variants?: iProductVariant[]
    is_active: boolean
    is_featured: boolean
    visibility: "public" | "private" | "hidden"
    images?: string[]
    category: string
}

interface iProductVariant {
    name: string
    options: string[]
    price_modifier?: number
    stock_quantity?: number
    sku?: string
}

export default function EditProductPage() {
    const params = useParams()
    const productId = params.id as string
    const router = useRouter()
    const { updateProduct, loading, fetchProductById, selectedProduct } = useProductStore()
    const { categories, fetchCategories } = useCategoryStore()

    const [activeTab, setActiveTab] = useState("basic")
    const [allImages, setAllImages] = useState<any[]>([])
    const [primaryIndex, setPrimaryIndex] = useState(0)
    const [tags, setTags] = useState<string[]>([])
    const [newTag, setNewTag] = useState("")
    const [attributes, setAttributes] = useState<Record<string, any>>({})
    const [newAttribute, setNewAttribute] = useState({ key: "", value: "" })
    const [specifications, setSpecifications] = useState<Record<string, any>>({})
    const [newSpecification, setNewSpecification] = useState({ key: "", value: "" })
    const [variants, setVariants] = useState<iProductVariant[]>([])
    const [newVariant, setNewVariant] = useState<iProductVariant>({
        name: "",
        options: [],
        price_modifier: 0,
        stock_quantity: 0,
        sku: "",
    })
    const [newVariantOption, setNewVariantOption] = useState("")
    const [seoKeywords, setSeoKeywords] = useState<string[]>([])
    const [newKeyword, setNewKeyword] = useState("")

    // Initialize form
    const form = useForm<iProductFormData>({
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            compare_price: undefined,
            cost_price: undefined,
            store_category_id: undefined,
            brand: undefined,
            sku: undefined,
            stock: {
                quantity: 0,
                track_inventory: true,
                low_stock_threshold: 10,
                allow_backorder: false,
            },
            attributes: undefined,
            specifications: undefined,
            tags: [],
            seo: {
                title: "",
                description: "",
                keywords: [],
            },
            shipping: {
                weight: undefined,
                dimensions: {
                    length: undefined,
                    width: undefined,
                    height: undefined,
                },
            },
            variants: [],
            is_active: true,
            is_featured: false,
            visibility: "public",
            images: [],
        },
    })

    // Fetch data
    useEffect(() => {
        if (productId) {
            fetchProductById(productId)
        }
        if (categories.length === 0) {
            fetchCategories(true)
        }
    }, [productId, categories.length, fetchProductById, fetchCategories])

    // Populate form with product data
    useEffect(() => {
        if (selectedProduct) {
            const normalizedProduct = {
                ...selectedProduct,
                stock: {
                    quantity: selectedProduct.stock?.quantity || 0,
                    track_inventory: selectedProduct.stock?.track_inventory ?? true,
                    low_stock_threshold: selectedProduct.stock?.low_stock_threshold || 10,
                    allow_backorder: selectedProduct.stock?.allow_backorder ?? false,
                },
                shipping: selectedProduct.shipping ? {
                    weight: selectedProduct.shipping.weight,
                    dimensions: selectedProduct.shipping.dimensions ? {
                        length: selectedProduct.shipping.dimensions.length,
                        width: selectedProduct.shipping.dimensions.width,
                        height: selectedProduct.shipping.dimensions.height,
                    } : undefined
                } : undefined,
                seo: selectedProduct.seo ? {
                    title: selectedProduct.seo.title || "",
                    description: selectedProduct.seo.description || "",
                    keywords: selectedProduct.seo.keywords || [],
                } : undefined,
            }
            form.reset(normalizedProduct)
            setTags(selectedProduct.tags || [])
            setAttributes(selectedProduct.attributes || {})
            setSpecifications(selectedProduct.specifications || {})
            setVariants(selectedProduct.variants || [])
            setSeoKeywords(selectedProduct.seo?.keywords || [])
            setAllImages(selectedProduct.images || [])
            setPrimaryIndex(0)
        }
    }, [selectedProduct, form])

    // Image handling
    const handleImageSelect = useCallback((files: File[]) => {
        const newImages = files.map(tfile => { value: tfile })
        setAllImages((prev: any) => [...prev, ...files])
    }, [])

    const handleImageRemove = useCallback((index: number) => {
        setAllImages(prev => prev.filter((_, i) => i !== index))
        setPrimaryIndex(prev => (index === prev ? 0 : prev > index ? prev - 1 : prev))
    }, [])

    const handleSetPrimaryImage = useCallback((index: number) => {
        setPrimaryIndex(index)
    }, [])

    // Tag management
    const addTag = useCallback(() => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags(prev => [...prev, newTag.trim()])
            setNewTag("")
        }
    }, [newTag, tags])

    const removeTag = useCallback((tagToRemove: string) => {
        setTags(prev => prev.filter(tag => tag !== tagToRemove))
    }, [])

    // Attribute management
    const addAttribute = useCallback(() => {
        if (newAttribute.key.trim() && newAttribute.value.trim()) {
            setAttributes(prev => ({
                ...prev,
                [newAttribute.key.trim()]: newAttribute.value.trim(),
            }))
            setNewAttribute({ key: "", value: "" })
        }
    }, [newAttribute])

    const removeAttribute = useCallback((key: string) => {
        setAttributes(prev => {
            const updated = { ...prev }
            delete updated[key]
            return updated
        })
    }, [])

    // Specification management
    const addSpecification = useCallback(() => {
        if (newSpecification.key.trim() && newSpecification.value.trim()) {
            setSpecifications(prev => ({
                ...prev,
                [newSpecification.key.trim()]: newSpecification.value.trim(),
            }))
            setNewSpecification({ key: "", value: "" })
        }
    }, [newSpecification])

    const removeSpecification = useCallback((key: string) => {
        setSpecifications(prev => {
            const updated = { ...prev }
            delete updated[key]
            return updated
        })
    }, [])

    // Variant management
    const addVariantOption = useCallback(() => {
        if (newVariantOption.trim() && !newVariant.options.includes(newVariantOption.trim())) {
            setNewVariant(prev => ({
                ...prev,
                options: [...prev.options, newVariantOption.trim()],
            }))
            setNewVariantOption("")
        }
    }, [newVariantOption, newVariant])

    const removeVariantOption = useCallback((option: string) => {
        setNewVariant(prev => ({
            ...prev,
            options: prev.options.filter(opt => opt !== option),
        }))
    }, [newVariant])

    const addVariant = useCallback(() => {
        if (newVariant.name.trim() && newVariant.options.length > 0) {
            setVariants(prev => [...prev, { ...newVariant }])
            setNewVariant({
                name: "",
                options: [],
                price_modifier: 0,
                stock_quantity: 0,
                sku: "",
            })
            setNewVariantOption("")
        }
    }, [newVariant])

    const removeVariant = useCallback((index: number) => {
        setVariants(prev => prev.filter((_, i) => i !== index))
    }, [])

    // SEO keyword management
    const addKeyword = useCallback(() => {
        if (newKeyword.trim() && !seoKeywords.includes(newKeyword.trim())) {
            setSeoKeywords(prev => [...prev, newKeyword.trim()])
            setNewKeyword("")
        }
    }, [newKeyword, seoKeywords])

    const removeKeyword = useCallback((keyword: string) => {
        setSeoKeywords(prev => prev.filter(k => k !== keyword))
    }, [])

    // Cloudinary upload
    const uploadMultipleToCloudinary = async (files: File[]): Promise<string[]> => {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "BizzWeb"

        if (!cloudName || !uploadPreset) {
            throw new Error("Missing Cloudinary configuration")
        }

        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

        const uploadPromises = files.map(async (file) => {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("upload_preset", uploadPreset)
            formData.append("folder", "ecommerce_uploads/products")

            const res = await fetch(uploadUrl, {
                method: "POST",
                body: formData,
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error?.message || "Image upload failed")
            }

            const data = await res.json()
            return data.secure_url
        })

        return await Promise.all(uploadPromises)
    }

    // Handle number inputs
    const handleNumberChange = (field: string, value: string) => {
        const num = value === "" ? undefined : Number(value);
        form.setValue(field as any, num);
    };

    // Form submission
    const onSubmit = async (data: iProductFormData) => {
        try {
            toast.info("Uploading images...")
            // const newFiles = allImages.filter(img => img.type === 'new').map(img => img.value as File)
            const newUrls = await uploadMultipleToCloudinary(allImages)

            let newUrlIndex = 0
            const imageUrls = allImages.map(img => {
                if (img.type === 'existing') {
                    return img.value as string
                } else {
                    const url = newUrls[newUrlIndex++]
                    return url
                }
            })
            console.log(newUrls);

            if (imageUrls.length === 0) {
                throw new Error("At least one image is required")
            }

            const primaryUrl = imageUrls[primaryIndex] || imageUrls[0]
            const otherUrls = imageUrls.filter((_, i) => i !== primaryIndex)
            const finalImages = [primaryUrl, ...otherUrls]
            data.category = data.store_category_id
            const productData: iProductFormData = {
                ...data,
                tags,
                attributes,
                specifications,
                variants,
                images: newUrls,
                seo: {
                    ...data.seo,
                    keywords: seoKeywords,
                },
            }
            console.log(productData);

            await updateProduct(productId, productData as any)
            toast.success("Product updated successfully")
            router.push("/products")
        } catch (error: any) {
            toast.error(error.message || "Failed to update product")
        }
    }

    // Render tabs
    const renderBasicTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Product Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name *</Label>
                            <Input
                                id="name"
                                {...form.register("name")}
                                placeholder="Enter product name"
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={form.watch("store_category_id") || ""}
                                onValueChange={(value) => form.setValue("store_category_id", value)}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category._id} value={category._id}>
                                            {category.display_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="brand">Brand</Label>
                                <Input
                                    id="brand"
                                    {...form.register("brand")}
                                    placeholder="Enter brand name"
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input
                                    id="sku"
                                    {...form.register("sku")}
                                    placeholder="Enter product SKU"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <RichTextEditor
                                label="Description"
                                value={form.watch("description") || ""}
                                onChange={(value) => form.setValue("description", value)}
                                placeholder="Describe your product in detail..."
                                disabled={loading}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5" />
                            Product Images
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ImageUpload
                            onSelectFiles={handleImageSelect}
                            onRemove={handleImageRemove}
                            onSetPrimary={handleSetPrimaryImage}
                            value={allImages}
                            primaryIndex={primaryIndex}
                            multiple={true}
                            showPreview={true}
                            disabled={loading}
                            showLocalPreview={true}
                        />

                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Tags
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add a tag"
                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                            disabled={loading}
                        />
                        <Button type="button" onClick={addTag} variant="outline" disabled={loading}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                    {tag}
                                    <X
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() => removeTag(tag)}
                                    />
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )

    const renderPricingTab = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="price">Selling Price *</Label>
                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.watch("price")}
                            onChange={(e) => handleNumberChange("price", e.target.value)}
                            placeholder="0.00"
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="compare_price">Compare At Price</Label>
                        <Input
                            id="compare_price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.watch("compare_price") || ""}
                            onChange={(e) => handleNumberChange("compare_price", e.target.value)}
                            placeholder="0.00"
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cost_price">Cost Price</Label>
                        <Input
                            id="cost_price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.watch("cost_price") || ""}
                            onChange={(e) => handleNumberChange("cost_price", e.target.value)}
                            placeholder="0.00"
                            disabled={loading}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    const renderInventoryTab = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Inventory Management
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Stock Quantity</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="0"
                            value={form.watch("stock.quantity")}
                            onChange={(e) => handleNumberChange("stock.quantity", e.target.value)}
                            placeholder="0"
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="low_stock_threshold">Low Stock Alert</Label>
                        <Input
                            id="low_stock_threshold"
                            type="number"
                            min="0"
                            value={form.watch("stock.low_stock_threshold")}
                            onChange={(e) => handleNumberChange("stock.low_stock_threshold", e.target.value)}
                            placeholder="10"
                            disabled={loading}
                        />
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Track Inventory</Label>
                            <p className="text-sm text-muted-foreground">Monitor stock levels for this product</p>
                        </div>
                        <Switch
                            checked={form.watch("stock.track_inventory")}
                            onCheckedChange={(checked) => form.setValue("stock.track_inventory", checked)}
                            disabled={loading}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Allow Backorder</Label>
                            <p className="text-sm text-muted-foreground">Accept orders when out of stock</p>
                        </div>
                        <Switch
                            checked={form.watch("stock.allow_backorder")}
                            onCheckedChange={(checked) => form.setValue("stock.allow_backorder", checked)}
                            disabled={loading}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    const renderAttributesTab = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Product Attributes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {Object.keys(attributes).length > 0 && (
                        <div className="space-y-2">
                            {Object.entries(attributes).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between p-2 bg-muted rounded">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{key}</Badge>
                                        <span>{String(value)}</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeAttribute(key)}
                                        disabled={loading}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Input
                            value={newAttribute.key}
                            onChange={(e) => setNewAttribute(prev => ({ ...prev, key: e.target.value }))}
                            placeholder="Attribute name"
                            disabled={loading}
                        />
                        <Input
                            value={newAttribute.value}
                            onChange={(e) => setNewAttribute(prev => ({ ...prev, value: e.target.value }))}
                            placeholder="Attribute value"
                            disabled={loading}
                        />
                        <Button type="button" onClick={addAttribute} variant="outline" disabled={loading}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Product Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {Object.keys(specifications).length > 0 && (
                        <div className="space-y-2">
                            {Object.entries(specifications).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between p-2 bg-muted rounded">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{key}</Badge>
                                        <span>{String(value)}</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeSpecification(key)}
                                        disabled={loading}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Input
                            value={newSpecification.key}
                            onChange={(e) => setNewSpecification(prev => ({ ...prev, key: e.target.value }))}
                            placeholder="Specification name"
                            disabled={loading}
                        />
                        <Input
                            value={newSpecification.value}
                            onChange={(e) => setNewSpecification(prev => ({ ...prev, value: e.target.value }))}
                            placeholder="Specification value"
                            disabled={loading}
                        />
                        <Button type="button" onClick={addSpecification} variant="outline" disabled={loading}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Product Variants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {variants.length > 0 && (
                        <div className="space-y-4">
                            {variants.map((variant, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium">{variant.name}</h4>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeVariant(index)}
                                            disabled={loading}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {variant.options.map((option, optIndex) => (
                                            <Badge key={optIndex} variant="secondary">
                                                {option}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                                        <span>Price Modifier: ${variant.price_modifier || 0}</span>
                                        <span>Stock: {variant.stock_quantity || 0}</span>
                                        <span>SKU: {variant.sku || "N/A"}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="border rounded-lg p-4 space-y-4">
                        <h4 className="font-medium">Add New Variant</h4>
                        <div className="space-y-2">
                            <Label>Variant Name</Label>
                            <Input
                                value={newVariant.name}
                                onChange={(e) => setNewVariant(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., Size, Color"
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Options</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newVariantOption}
                                    onChange={(e) => setNewVariantOption(e.target.value)}
                                    placeholder="Add option"
                                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addVariantOption())}
                                    disabled={loading}
                                />
                                <Button type="button" onClick={addVariantOption} variant="outline" disabled={loading}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            {newVariant.options.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {newVariant.options.map((option, index) => (
                                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                            {option}
                                            <X
                                                className="h-3 w-3 cursor-pointer"
                                                onClick={() => removeVariantOption(option)}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Price Modifier</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={newVariant.price_modifier || ""}
                                    onChange={(e) => setNewVariant(prev => ({
                                        ...prev,
                                        price_modifier: e.target.value === "" ? undefined : Number(e.target.value)
                                    }))}
                                    placeholder="0.00"
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Stock Quantity</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={newVariant.stock_quantity || ""}
                                    onChange={(e) => setNewVariant(prev => ({
                                        ...prev,
                                        stock_quantity: e.target.value === "" ? undefined : Number(e.target.value)
                                    }))}
                                    placeholder="0"
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>SKU</Label>
                                <Input
                                    value={newVariant.sku || ""}
                                    onChange={(e) => setNewVariant(prev => ({ ...prev, sku: e.target.value }))}
                                    placeholder="Variant SKU"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <Button
                            type="button"
                            onClick={addVariant}
                            disabled={!newVariant.name.trim() || newVariant.options.length === 0 || loading}
                            className="w-full"
                        >
                            Add Variant
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )

    const renderShippingTab = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.watch("shipping.weight") || ""}
                        onChange={(e) => handleNumberChange("shipping.weight", e.target.value)}
                        placeholder="0.00"
                        disabled={loading}
                    />
                </div>
                <div className="space-y-4">
                    <Label>Dimensions (cm)</Label>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm">Length</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.watch("shipping.dimensions.length") || ""}
                                onChange={(e) => handleNumberChange("shipping.dimensions.length", e.target.value)}
                                placeholder="0.00"
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">Width</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.watch("shipping.dimensions.width") || ""}
                                onChange={(e) => handleNumberChange("shipping.dimensions.width", e.target.value)}
                                placeholder="0.00"
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">Height</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.watch("shipping.dimensions.height") || ""}
                                onChange={(e) => handleNumberChange("shipping.dimensions.height", e.target.value)}
                                placeholder="0.00"
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    const renderSEOTab = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    SEO Optimization
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="seo_title">SEO Title</Label>
                    <Input
                        id="seo_title"
                        {...form.register("seo.title")}
                        placeholder="Enter SEO title"
                        disabled={loading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="seo_description">SEO Description</Label>
                    <Textarea
                        id="seo_description"
                        {...form.register("seo.description")}
                        placeholder="Enter SEO meta description"
                        rows={3}
                        disabled={loading}
                    />
                </div>
                <div className="space-y-4">
                    <Label>SEO Keywords</Label>
                    <div className="flex gap-2">
                        <Input
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            placeholder="Add keyword"
                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                            disabled={loading}
                        />
                        <Button type="button" onClick={addKeyword} variant="outline" disabled={loading}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    {seoKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {seoKeywords.map((keyword, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                    {keyword}
                                    <X
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() => removeKeyword(keyword)}
                                    />
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )

    const renderAdvancedTab = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Product Settings
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="visibility">Product Visibility</Label>
                    <Select
                        value={form.watch("visibility")}
                        onValueChange={(value: "public" | "private" | "hidden") => form.setValue("visibility", value)}
                        disabled={loading}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="public">Public - Visible to everyone</SelectItem>
                            <SelectItem value="private">Private - Only visible to admins</SelectItem>
                            <SelectItem value="hidden">Hidden - Not visible anywhere</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Separator />
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Active Status</Label>
                            <p className="text-sm text-muted-foreground">Make this product available for purchase</p>
                        </div>
                        <Switch
                            checked={form.watch("is_active")}
                            onCheckedChange={(checked) => form.setValue("is_active", checked)}
                            disabled={loading}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Featured Product</Label>
                            <p className="text-sm text-muted-foreground">Show this product in featured sections</p>
                        </div>
                        <Switch
                            checked={form.watch("is_featured")}
                            onCheckedChange={(checked) => form.setValue("is_featured", checked)}
                            disabled={loading}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="min-h-screen bg-background">
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-semibold">Edit Product</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => router.push("/products")}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                form="product-form"
                                disabled={loading}
                                className="flex items-center gap-2"
                            >
                                {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />}
                                <Save className="h-4 w-4" />
                                Update Product
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form
                    id="product-form"
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                >
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-7">
                            <TabsTrigger value="basic" className="flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                Basic
                            </TabsTrigger>
                            <TabsTrigger value="pricing" className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Pricing
                            </TabsTrigger>
                            <TabsTrigger value="inventory" className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Inventory
                            </TabsTrigger>
                            <TabsTrigger value="attributes" className="flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                Attributes
                            </TabsTrigger>
                            <TabsTrigger value="shipping" className="flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                Shipping
                            </TabsTrigger>
                            <TabsTrigger value="seo" className="flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                SEO
                            </TabsTrigger>
                            <TabsTrigger value="advanced" className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                Advanced
                            </TabsTrigger>
                        </TabsList>
                        <div className="mt-8">
                            <TabsContent value="basic">{renderBasicTab()}</TabsContent>
                            <TabsContent value="pricing">{renderPricingTab()}</TabsContent>
                            <TabsContent value="inventory">{renderInventoryTab()}</TabsContent>
                            <TabsContent value="attributes">{renderAttributesTab()}</TabsContent>
                            <TabsContent value="shipping">{renderShippingTab()}</TabsContent>
                            <TabsContent value="seo">{renderSEOTab()}</TabsContent>
                            <TabsContent value="advanced">{renderAdvancedTab()}</TabsContent>
                        </div>
                    </Tabs>
                </form>
            </div>
        </div>
    )
}