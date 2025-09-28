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
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

import { Plus, X, Trash2, Save, Package, Tag, Settings, DollarSign, Truck, Search, BarChart3, ImageIcon, Info, Copy } from 'lucide-react'
import { useProductStore } from "@/store/productStore"
import { useCategoryStore } from "@/store/categoryStore"
import ImageUpload from "@/components/shared/image-upload"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { toast } from "sonner"
import { v4 } from "uuid";
// Define interfaces for type safety
interface iProductFormData {
    name: string
    description?: string
    slug: string
    price: number
    compare_price?: number
    cost_price?: number
    category?: string
    brand?: string
    sku?: string
    GST?: string
    HSNCode: string
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
}

interface iVariantSize {
    id: string;
    size: string;
    stock: number;
    priceModifier: number;
    sku: string;
    attributes: Record<string, any>;
}

interface iProductVariant {
    id: string;
    color: string;
    images: (File | string)[];
    primaryIndex: number;
    sizes: iVariantSize[];
    option: any
    price: number
    stock_quantity: number
    sku: any
}

interface CategoryFilter {
    name: string
    type: "text" | "select" | "multiselect" | "number"
    options: string[]
    is_required: boolean
}

function normalizeFilters(raw: any): CategoryFilter[] {
    if (!raw) return []
    if (Array.isArray(raw)) {
        return raw.map(item => {
            if (!item) return { name: "", type: "text", options: [], is_required: false }
            const name = item.name ?? item.key ?? ""
            const type = item.type ?? "text"
            const options = Array.isArray(item.options) ? item.options : []
            const is_required = !!item.is_required
            return { name, type, options, is_required }
        })
    }
    if (typeof raw === "object") {
        return Object.entries(raw).map(([key, val]) => {
            if (val == null) return { name: key, type: "text", options: [], is_required: false }
            if (typeof val === "string") {
                return { name: key, type: "text", options: [], is_required: false }
            }
            const type = val.type ?? "text"
            const options = Array.isArray(val.options) ? val.options : []
            const is_required = !!val.is_required
            const name = val.name ?? key
            return { name, type, options, is_required }
        })
    }
    return []
}

export default function EditProductPage() {
    const params = useParams()
    const productId = params.id as string
    const router = useRouter()
    const { updateProduct, loading, fetchProductById, selectedProduct } = useProductStore()
    const { allCategories, fetchAllCategories } = useCategoryStore()

    const [activeTab, setActiveTab] = useState("basic")
    const [mainImages, setMainImages] = useState<(File | string)[]>([])
    const [mainPrimaryIndex, setMainPrimaryIndex] = useState(0)
    const [tags, setTags] = useState<string[]>([])
    const [newTag, setNewTag] = useState("")
    const [specifications, setSpecifications] = useState<Record<string, any>>({})
    const [newSpecification, setNewSpecification] = useState({ key: "", value: "" })
    const [colorVariants, setColorVariants] = useState<iProductVariant[]>([])
    const [seoKeywords, setSeoKeywords] = useState<string[]>([])
    const [newKeyword, setNewKeyword] = useState("")
    const [sizeOptions, setSizeOptions] = useState<string[]>(["S", "M", "L", "XL", "XXL"])
    const [newSizeOption, setNewSizeOption] = useState("")

    const form = useForm<iProductFormData>({
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            compare_price: undefined,
            cost_price: undefined,
            category: undefined,
            brand: undefined,
            sku: undefined,
            GST: undefined,
            HSNCode: undefined,
            stock: {
                quantity: 0,
                track_inventory: true,
                low_stock_threshold: 10,
                allow_backorder: false,
            },
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

    const selectedCategoryId = form.watch("category")
    const selectedCategory = allCategories.find(cat => cat._id === selectedCategoryId)
    const categoryAttributes = normalizeFilters(selectedCategory?.config?.filters)

    // Fetch data
    useEffect(() => {
        if (productId) {
            fetchProductById(productId)
        }
        if (allCategories.length === 0) {
            fetchAllCategories(true)
        }
    }, [productId, allCategories.length, fetchProductById, fetchAllCategories])

    // Populate form with product data
    useEffect(() => {
        if (selectedProduct) {
            form.reset(selectedProduct as any)
            setTags(selectedProduct.tags || [])
            setSeoKeywords(selectedProduct.seo?.keywords || [])
            setSpecifications(selectedProduct.specifications || {})
            setMainImages(selectedProduct.images || [])
            setMainPrimaryIndex(selectedProduct.primaryImageIndex || 0) // Assume added field if needed
            const variantsWithSizes = (selectedProduct.variants || []).map(v => {
                return {
                    ...v,
                    id: v.id || v4(),
                    images: v.images || [],
                    primaryIndex: v.primaryIndex || 0,
                    sizes: v.sizes ? v.sizes.map(s => ({
                        ...s,
                        id: s.id || v4(),
                        attributes: s.attributes || {}
                    })) : []
                }
            })
            setColorVariants(variantsWithSizes as any)
        }
    }, [selectedProduct, form])

    // Main image handling
    const handleMainImageSelect = useCallback((files: File[]) => {
        setMainImages(prev => [...prev, ...files])
    }, [])

    const handleMainImageRemove = useCallback((index: number) => {
        setMainImages(prev => prev.filter((_, i) => i !== index))
        setMainPrimaryIndex(prev => (index === prev ? 0 : prev > index ? prev - 1 : prev))
    }, [])

    const handleMainSetPrimaryImage = useCallback((index: number) => {
        setMainPrimaryIndex(index)
    }, [])

    // Variant image handling
    const handleVariantImageSelect = useCallback((id: string, files: File[]) => {
        setColorVariants(prev =>
            prev.map(v =>
                v.id === id ? { ...v, images: [...v.images, ...files] } : v
            )
        )
    }, [])

    const handleVariantImageRemove = useCallback((id: string, index: number) => {
        setColorVariants(prev =>
            prev.map(v => {
                if (v.id !== id) return v
                const newImages = v.images.filter((_, i) => i !== index)
                let newPrimary = v.primaryIndex
                if (index === newPrimary) newPrimary = 0
                else if (index < newPrimary) newPrimary -= 1
                return { ...v, images: newImages, primaryIndex: newPrimary }
            })
        )
    }, [])

    const handleVariantSetPrimaryImage = useCallback((id: string, index: number) => {
        setColorVariants(prev =>
            prev.map(v => (v.id === id ? { ...v, primaryIndex: index } : v))
        )
    }, [])

    // Tag management
    const addTag = useCallback(() => {
        const trimmed = newTag.trim()
        if (trimmed && !tags.includes(trimmed)) {
            setTags(prev => [...prev, trimmed])
            setNewTag("")
        }
    }, [newTag, tags])

    const removeTag = useCallback((tag: string) => {
        setTags(prev => prev.filter(t => t !== tag))
    }, [])

    // Specification management
    const addSpecification = useCallback(() => {
        const { key, value } = newSpecification
        const trimmedKey = key.trim()
        const trimmedValue = value.trim()
        if (trimmedKey && trimmedValue) {
            setSpecifications(prev => ({ ...prev, [trimmedKey]: trimmedValue }))
            setNewSpecification({ key: "", value: "" })
        }
    }, [newSpecification])

    const removeSpecification = useCallback((key: string) => {
        setSpecifications(prev => {
            const { [key]: _, ...rest } = prev
            return rest
        })
    }, [])

    // SEO keyword management
    const addKeyword = useCallback(() => {
        const trimmed = newKeyword.trim()
        if (trimmed && !seoKeywords.includes(trimmed)) {
            setSeoKeywords(prev => [...prev, trimmed])
            setNewKeyword("")
        }
    }, [newKeyword, seoKeywords])

    const removeKeyword = useCallback((keyword: string) => {
        setSeoKeywords(prev => prev.filter(k => k !== keyword))
    }, [])

    // Cloudinary upload
    const uploadMultipleToCloudinary = async (files: (File | string)[]): Promise<string[]> => {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "BizzWeb"

        if (!cloudName || !uploadPreset) {
            throw new Error("Missing Cloudinary configuration")
        }

        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

        const uploadPromises = files.map(async (file) => {
            if (typeof file === "string") return file // Already uploaded
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

    const addColorVariant = () => {
        const newVariant: iProductVariant = {
            id: v4(),
            color: "",
            images: [],
            primaryIndex: 0,
            sizes: [],
            option: "",
            price: 0,
            sku: "",
            stock_quantity: 0
        }
        setColorVariants([...colorVariants, newVariant])
    }

    const removeColorVariant = (id: string) => {
        setColorVariants(colorVariants.filter(v => v.id !== id))
    }

    const updateColorVariant = (id: string, updates: Partial<iProductVariant>) => {
        setColorVariants(
            colorVariants.map(variant =>
                variant.id === id ? { ...variant, ...updates } : variant
            )
        )
    }

    const toggleSizeSelection = (variantId: string, sizeLabel: string) => {
        setColorVariants(prev =>
            prev.map(variant => {
                if (variant.id !== variantId) return variant
                const exists = variant.sizes.find(s => s.size === sizeLabel)
                if (exists) {
                    return {
                        ...variant,
                        sizes: variant.sizes.filter(s => s.size !== sizeLabel)
                    }
                } else {
                    const newSize: iVariantSize = {
                        id: v4(),
                        size: sizeLabel,
                        stock: 0,
                        priceModifier: 0,
                        sku: "",
                        attributes: {}
                    }
                    const filters = normalizeFilters(selectedCategory?.config?.filters)
                    if (filters.length > 0) {
                        const initialAttributes: Record<string, any> = {}
                        filters.forEach(attr => {
                            if (attr.type === "multiselect") initialAttributes[attr.name] = []
                            else initialAttributes[attr.name] = ""
                        })
                        newSize.attributes = initialAttributes
                    }
                    return {
                        ...variant,
                        sizes: [...variant.sizes, newSize]
                    }
                }
            })
        )
    }

    const addNewSizeOption = () => {
        const label = newSizeOption.trim()
        if (!label) return
        if (!sizeOptions.includes(label)) {
            setSizeOptions(prev => [...prev, label])
        }
        setNewSizeOption("")
    }

    const removeSizeFromVariant = (variantId: string, sizeId: string) => {
        setColorVariants(
            colorVariants.map(variant =>
                variant.id === variantId
                    ? {
                        ...variant,
                        sizes: variant.sizes.filter(s => s.id !== sizeId)
                    }
                    : variant
            )
        )
    }

    const updateSizeInVariant = (
        variantId: string,
        sizeId: string,
        updates: Partial<iVariantSize>
    ) => {
        setColorVariants(
            colorVariants.map(variant => {
                if (variant.id === variantId) {
                    return {
                        ...variant,
                        sizes: variant.sizes.map(size =>
                            size.id === sizeId ? { ...size, ...updates } : size
                        )
                    }
                }
                return variant
            })
        )
    }
    const copyAttributeToAll = (attributeName: string, value: any) => {
        setColorVariants(
            colorVariants.map(v => ({
                ...v,
                attributes: {
                    ...v.attributes,
                    [attributeName]: value
                }
            }))
        )
        toast.success(`Copied ${attributeName} to all variants`)
    }

    const updateSizeAttribute = (
        variantId: string,
        sizeId: string,
        attributeName: string,
        value: any
    ) => {
        setColorVariants(
            colorVariants.map(variant => {
                if (variant.id === variantId) {
                    return {
                        ...variant,
                        sizes: variant.sizes.map(size => {
                            if (size.id === sizeId) {
                                return {
                                    ...size,
                                    attributes: {
                                        ...size.attributes,
                                        [attributeName]: value
                                    }
                                }
                            }
                            return size
                        })
                    }
                }
                return variant
            })
        )
    }

    // Form submission
    const onSubmit = async (data: iProductFormData) => {
        try {
            // Upload main images
            const mainImageUrls = await uploadMultipleToCloudinary(mainImages)

            // Upload variant images
            const variantUploadPromises = colorVariants.map(async variant => {
                const imageUrls = await uploadMultipleToCloudinary(variant.images)
                const sizes = variant.sizes.map(size => ({
                    ...size,
                    attributes: size.attributes
                }))
                return {
                    ...variant,
                    images: imageUrls,
                    sizes
                }
            })

            const variantsWithImages = await Promise.all(variantUploadPromises)

            data.slug = data.name.toLowerCase().replace(/\s+/g, "-")

            data.images = mainImageUrls
            data.variants = variantsWithImages
            data.tags = tags
            data.specifications = specifications
            data.seo = {
                ...data.seo,
                keywords: seoKeywords,
            }
            data.stock = {
                ...data.stock,
                low_stock_threshold: data.stock.low_stock_threshold,
                allow_backorder: data.stock.allow_backorder,
                track_inventory: data.stock.track_inventory
            }
            // console.log(data);

            await updateProduct(productId, data)
            toast.success("Product updated successfully")
            router.push("/products")
        } catch (error: any) {
            toast.error(error.message || "Failed to save product")
        }
    };

    const renderAttributeInput = (variantId: string, sizeId: string, attribute: CategoryFilter) => {
        const variant = colorVariants.find(v => v.id === variantId)
        if (!variant) return null
        const size = variant.sizes.find(s => s.id === sizeId)
        if (!size) return null
        const value = size.attributes[attribute.name]

        switch (attribute.type) {
            case "text":
                return (
                    <Input
                        className="h-8 text-sm"
                        value={value || ""}
                        onChange={(e) => updateSizeAttribute(variantId, sizeId, attribute.name, e.target.value)}
                        placeholder={`Enter ${attribute.name}`}
                    />
                )
            case "number":
                return (
                    <Input
                        className="h-8 text-sm"
                        type="number"
                        value={value || ""}
                        onChange={(e) => updateSizeAttribute(variantId, sizeId, attribute.name, Number(e.target.value))}
                        placeholder={`Enter ${attribute.name}`}
                    />
                )
            case "select":
                return (
                    <Select
                        value={value || ""}
                        onValueChange={(val) => updateSizeAttribute(variantId, sizeId, attribute.name, val)}
                    >
                        <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder={`Select ${attribute.name}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {attribute.options.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )
            case "multiselect":
                {
                    const currentValues = Array.isArray(value) ? value : []
                    return (
                        <div className="space-y-1">
                            {attribute.options.map((option) => (
                                <div key={option} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`${variantId}-${sizeId}-${attribute.name}-${option}`}
                                        checked={currentValues.includes(option)}
                                        onCheckedChange={(checked) => {
                                            const newValues = checked
                                                ? [...currentValues, option]
                                                : currentValues.filter((v) => v !== option)
                                            updateSizeAttribute(variantId, sizeId, attribute.name, newValues)
                                        }}
                                    />
                                    <label
                                        className="text-sm truncate"
                                        htmlFor={`${variantId}-${sizeId}-${attribute.name}-${option}`}
                                    >
                                        {option}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )
                }
            default:
                return null
        }
    }

    const getVariantTotalStock = (variant: iProductVariant) => {
        return variant.sizes.reduce((total, size) => total + (size.stock || 0), 0)
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
                                {...form.register("name", { required: "Product name is required" })}
                                placeholder="Enter product name"
                                disabled={loading}
                            />
                            {form.formState.errors.name && (
                                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={form.watch("category") || ""}
                                onValueChange={(value) => form.setValue("category", value)}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allCategories.map((category) => (
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="GST">GST</Label>
                                <Input
                                    id="GST"
                                    {...form.register("GST")}
                                    placeholder="Enter GST %"
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="HSNCode">HSN Code</Label>
                                <Input
                                    id="HSNCode"
                                    {...form.register("HSNCode")}
                                    placeholder="Enter product HSN code"
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
                            onSelectFiles={handleMainImageSelect}
                            onRemove={handleMainImageRemove}
                            onSetPrimary={handleMainSetPrimaryImage}
                            value={mainImages}
                            primaryIndex={mainPrimaryIndex}
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

                            value={form.watch("price")}
                            onChange={(e) => handleNumberChange("price", e.target.value)}
                            placeholder="0.00"
                            disabled={loading}
                        />
                        {form.formState.errors.price && (
                            <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="compare_price">Compare At Price</Label>
                        <Input
                            id="compare_price"
                            type="number"
                            step="0.01"

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

    const renderColorVariantsTab = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Color & Size Variants
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <Button
                            type="button"
                            onClick={addColorVariant}
                            className="w-full md:w-auto"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Color Variant
                        </Button>

                        <div className="flex flex-col gap-2 w-full md:w-auto">
                            <Label className="text-sm">Global Sizes</Label>
                            <div className="flex items-center gap-2">
                                <div className="flex flex-wrap gap-1">
                                    {sizeOptions.map(opt => (
                                        <Badge key={opt} variant="outline" className="px-2 py-1">
                                            {opt}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                    <Input
                                        placeholder="Add custom size"
                                        value={newSizeOption}
                                        onChange={(e) => setNewSizeOption(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addNewSizeOption())}
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        onClick={addNewSizeOption}
                                        variant="outline"
                                        size="icon"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {colorVariants.length === 0 ? (
                            <div className="text-center py-8 border rounded-lg bg-muted/20">
                                <p className="text-muted-foreground mb-4">No color variants added yet</p>
                                <Button
                                    type="button"
                                    onClick={addColorVariant}
                                    variant="secondary"
                                >
                                    Add Your First Color Variant
                                </Button>
                            </div>
                        ) : (
                            colorVariants.map((variant, index) => (
                                <Card key={variant.id} className="border rounded-lg overflow-hidden">
                                    <CardHeader className="bg-muted/40 p-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <span className="font-medium">{index + 1}. <b>{variant.color}</b> Color Variant </span>
                                                {/* {variant.color && (
                                                    <Badge variant="secondary">{variant.color}</Badge>
                                                )} */}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => removeColorVariant(variant.id)}
                                                    className="text-destructive-foreground"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Color Name *</Label>
                                                    <Input
                                                        value={variant.color}
                                                        onChange={(e) => updateColorVariant(variant.id, { color: e.target.value })}
                                                        placeholder="e.g., Red, Blue, Black"
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Variant Images</Label>
                                                    <ImageUpload
                                                        onSelectFiles={(files) => handleImageSelect(variant.id, files)}
                                                        onRemove={(index) => handleImageRemove(variant.id, index)}
                                                        onSetPrimary={(index) => handleSetPrimaryImage(variant.id, index)}
                                                        value={variant.images}
                                                        primaryIndex={variant.primaryIndex}
                                                        multiple={true}
                                                        showPreview={true}
                                                        showLocalPreview={true}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label>Choose Sizes</Label>
                                                    <p className="text-sm text-muted-foreground">Select sizes to show</p>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {sizeOptions.map(opt => {
                                                        const checked = !!variant.sizes.find(s => s.size === opt)
                                                        return (
                                                            <label
                                                                key={opt}
                                                                className={`flex items-center gap-2 p-2 border rounded transition-colors ${checked ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
                                                                    }`}
                                                            >
                                                                <Checkbox
                                                                    id={`${variant.id}-size-${opt}`}
                                                                    checked={checked}
                                                                    onCheckedChange={() => toggleSizeSelection(variant.id, opt)}
                                                                />
                                                                <span className="text-sm">{opt}</span>
                                                            </label>
                                                        )
                                                    })}
                                                </div>

                                                <div className="mt-2">
                                                    <Label className="text-sm">Custom size for this variant</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="Enter size and press Enter"
                                                            onKeyPress={(e) => {
                                                                if (e.key === "Enter") {
                                                                    e.preventDefault()
                                                                    const txt = (e.target as HTMLInputElement).value.trim()
                                                                    if (txt) {
                                                                        if (!sizeOptions.includes(txt)) {
                                                                            setSizeOptions(prev => [...prev, txt])
                                                                        }
                                                                        toggleSizeSelection(variant.id, txt)
                                                                            ; (e.target as HTMLInputElement).value = ""
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                        <Button
                                                            type="button"
                                                            onClick={() => toast("Press Enter in the input to add the custom size.")}
                                                            variant="outline"
                                                            size="icon"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* <div>
                                            <Label>Size Matrix</Label>
                                            {variant.sizes.length === 0 ? (
                                                <div className="text-sm text-muted-foreground p-4 border rounded">No sizes selected for this color.</div>
                                            ) : (
                                                <div className="mt-2 border rounded-lg overflow-x-auto">
                                                    <table className="w-full min-w-[800px]">
                                                        <thead>
                                                            <tr className="border-b">
                                                                <th className="text-left p-2 w-[100px]">Size</th>
                                                                <th className="text-left p-2 w-[150px]">SKU</th>
                                                                <th className="text-left p-2 w-[120px]">Price Modifier</th>
                                                                <th className="text-left p-2 w-[120px]">Final Price</th>
                                                                <th className="text-left p-2 w-[100px]">Stock Qty</th>
                                                                {categoryAttributes.map((attr) => (
                                                                    <th
                                                                        key={attr.name}
                                                                        className="text-left p-2 min-w-[150px]"
                                                                    >
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger className="text-left truncate max-w-[120px] block">
                                                                                    {attr.name}
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    {attr.name}
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    </th>
                                                                ))}
                                                                <th className="text-left p-2 w-[80px]">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {variant.sizes.map(size => {
                                                                const key = `${variant.id}_${size.id}`
                                                                const expanded = !!expandedSizeRows[key]
                                                                return (
                                                                    <tr key={size.id} className="border-b hover:bg-muted/50">
                                                                        <td className="p-2 font-medium">{size.size}</td>
                                                                        <td className="p-2">
                                                                            <Input
                                                                                className="h-8 text-sm"
                                                                                value={size.sku}
                                                                                onChange={(e) => updateSizeInVariant(variant.id, size.id, { sku: e.target.value })}
                                                                                placeholder="SKU"
                                                                            />
                                                                        </td>
                                                                        <td className="p-2">
                                                                            <Input
                                                                                className="h-8 text-sm"
                                                                                type="number"
                                                                                step="0.01"
                                                                                value={size.priceModifier}
                                                                                onChange={(e) => updateSizeInVariant(variant.id, size.id, { priceModifier: Number(e.target.value) })}
                                                                                placeholder="0.00"
                                                                            />
                                                                        </td>
                                                                        <td className="p-2 font-medium">
                                                                            ${(Number(form.watch("price") || 0) + Number(size.priceModifier || 0)).toFixed(2)}
                                                                        </td>
                                                                        <td className="p-2">
                                                                            <Input
                                                                                className="h-8 text-sm"
                                                                                type="number"
                                                                                
                                                                                value={size.stock}
                                                                                onChange={(e) => updateSizeInVariant(variant.id, size.id, { stock: Number(e.target.value) })}
                                                                                placeholder="0"
                                                                            />
                                                                        </td>

                                                                        {categoryAttributes.map(attr => (
                                                                            <td key={attr.name} className="p-2 min-w-[150px]">
                                                                                {renderAttributeInput(variant.id, size.id, attr)}
                                                                            </td>
                                                                        ))}
                                                                        <td className="p-2">
                                                                            <Button
                                                                                type="button"
                                                                                variant="destructive"
                                                                                size="icon"
                                                                                onClick={() => removeSizeFromVariant(variant.id, size.id)}
                                                                                className="h-8 w-8"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div> */}

                                    </CardContent>
                                </Card>
                            ))
                            // colorVariants.map(() => { })
                        )}
                        <table className="w-full min-w-[800px] border border-gray-500 rounded">
                            <thead>
                                <tr className="border-b border-b-gray-500">
                                    <th className="text-left p-2 w-[100px]">
                                        Color
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => copyAttributeToAll(attr.name, colorVariants[0].attributes[attr.name])}>
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Copy from first variant to all</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </th>
                                    <th className="text-left p-2 w-[100px]">Size</th>
                                    <th className="text-left p-2 w-[150px]">SKU</th>
                                    <th className="text-left p-2 w-[120px]">Price Modifier</th>
                                    <th className="text-left p-2 w-[120px]">Final Price</th>
                                    <th className="text-left p-2 w-[100px]">Stock Qty</th>
                                    {categoryAttributes.map((attr) => (
                                        <th
                                            key={attr.name}
                                            className="text-left p-2 min-w-[150px]"
                                        >
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger className="text-left truncate max-w-[120px] block">
                                                        {attr.name}
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        {attr.name}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </th>
                                    ))}
                                    <th className="text-left p-2 w-[80px]">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {colorVariants.map((variant) =>
                                    variant.sizes.map((size) => {
                                        const key = `${variant.id}_${size.id}`;

                                        return (
                                            <tr key={key} className="border-b hover:bg-muted/50">
                                                <td className="p-2 font-medium">{variant.color}</td>
                                                <td className="p-2 font-medium">{size.size}</td>
                                                <td className="p-2">
                                                    <Input
                                                        className="h-8 text-sm"
                                                        value={size.sku}
                                                        onChange={(e) =>
                                                            updateSizeInVariant(variant.id, size.id, {
                                                                sku: e.target.value,
                                                            })
                                                        }
                                                        placeholder="SKU"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        className="h-8 text-sm"
                                                        type="number"
                                                        step="0.01"
                                                        value={size.priceModifier}
                                                        onChange={(e) =>
                                                            updateSizeInVariant(variant.id, size.id, {
                                                                priceModifier: Number(e.target.value),
                                                            })
                                                        }
                                                        placeholder="0.00"
                                                    />
                                                </td>
                                                <td className="p-2 font-medium">
                                                    $
                                                    {(
                                                        Number(form.watch("price") || 0) +
                                                        Number(size.priceModifier || 0)
                                                    ).toFixed(2)}
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        className="h-8 text-sm"
                                                        type="number"

                                                        value={size.stock}
                                                        onChange={(e) =>
                                                            updateSizeInVariant(variant.id, size.id, {
                                                                stock: Number(e.target.value),
                                                            })
                                                        }
                                                        placeholder="0"
                                                    />
                                                </td>

                                                {categoryAttributes.map((attr) => (
                                                    <td key={attr.name} className="p-2 min-w-[150px]">
                                                        {renderAttributeInput(variant.id, size.id, attr)}
                                                    </td>
                                                ))}

                                                <td className="p-2">
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() =>
                                                            removeSizeFromVariant(variant.id, size.id)
                                                        }
                                                        className="h-8 w-8"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>

                        {/* {colorVariants.map((variant, index) => (<div>
                            <Label>Size Matrix {variant.color}</Label>

                            {variant.sizes.length === 0 ? (
                                <div className="text-sm text-muted-foreground p-4 border rounded">No sizes selected for this color.</div>
                            ) : (
                                <div className="mt-2 border rounded-lg overflow-x-auto">
                                    <table className="w-full min-w-[800px]">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-2 w-[100px]">Color</th>
                                                <th className="text-left p-2 w-[100px]">Size</th>
                                                <th className="text-left p-2 w-[150px]">SKU</th>
                                                <th className="text-left p-2 w-[120px]">Price Modifier</th>
                                                <th className="text-left p-2 w-[120px]">Final Price</th>
                                                <th className="text-left p-2 w-[100px]">Stock Qty</th>
                                                {categoryAttributes.map((attr) => (
                                                    <th
                                                        key={attr.name}
                                                        className="text-left p-2 min-w-[150px]"
                                                    >
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger className="text-left truncate max-w-[120px] block">
                                                                    {attr.name}
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    {attr.name}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </th>
                                                ))}
                                                <th className="text-left p-2 w-[80px]">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {variant.sizes.map(size => {
                                                const key = `${variant.id}_${size.id}`
                                                const expanded = !!expandedSizeRows[key]
                                                return (
                                                    <tr key={size.id} className="border-b hover:bg-muted/50">

                                                        <td className="p-2 font-medium">{variant.color}</td>
                                                        <td className="p-2 font-medium">{size.size}</td>
                                                        <td className="p-2">
                                                            <Input
                                                                className="h-8 text-sm"
                                                                value={size.sku}
                                                                onChange={(e) => updateSizeInVariant(variant.id, size.id, { sku: e.target.value })}
                                                                placeholder="SKU"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <Input
                                                                className="h-8 text-sm"
                                                                type="number"
                                                                step="0.01"
                                                                value={size.priceModifier}
                                                                onChange={(e) => updateSizeInVariant(variant.id, size.id, { priceModifier: Number(e.target.value) })}
                                                                placeholder="0.00"
                                                            />
                                                        </td>
                                                        <td className="p-2 font-medium">
                                                            ${(Number(form.watch("price") || 0) + Number(size.priceModifier || 0)).toFixed(2)}
                                                        </td>
                                                        <td className="p-2">
                                                            <Input
                                                                className="h-8 text-sm"
                                                                type="number"
                                                                
                                                                value={size.stock}
                                                                onChange={(e) => updateSizeInVariant(variant.id, size.id, { stock: Number(e.target.value) })}
                                                                placeholder="0"
                                                            />
                                                        </td>

                                                        {categoryAttributes.map(attr => (
                                                            <td key={attr.name} className="p-2 min-w-[150px]">
                                                                {renderAttributeInput(variant.id, size.id, attr)}
                                                            </td>
                                                        ))}
                                                        <td className="p-2">
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="icon"
                                                                onClick={() => removeSizeFromVariant(variant.id, size.id)}
                                                                className="h-8 w-8"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>))} */}
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
                                Variants
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
                            <TabsContent value="attributes">{renderColorVariantsTab()}</TabsContent>
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