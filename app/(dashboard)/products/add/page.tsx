"use client"

import { useState, useEffect, useCallback, Fragment } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import {
    Plus, X, Trash2, Save, Package, Tag, Settings, DollarSign, Truck, Search,
    BarChart3, ImageIcon, Info, ChevronDown, ChevronUp,
    Table
} from 'lucide-react'
import { useProductStore } from "@/store/productStore"
import { useCategoryStore } from "@/store/categoryStore"
import ImageUpload from "@/components/shared/image-upload"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { v4 } from "uuid";
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
    priceModifier?: number;
    sku: string;
    attributes: Record<string, any>;
}

interface iProductVariant {
    id: string;
    color: string;
    images: (File | string)[];
    primaryIndex: number;
    sizes: iVariantSize[];
}

interface CategoryFilter {
    name: string
    type: "text" | "select" | "multiselect" | "number"
    options: string[]
    is_required: boolean
}

const productSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().optional(),
    price: z.number().min(1, "Price must be positive"),
    compare_price: z.number().optional(),
    cost_price: z.number().optional(),
    category: z.string().min(1, "Please select any category"),
    brand: z.string().optional(),
    sku: z.string().optional(),
    stock: z.object({
        quantity: z.number().min(0, "Stock quantity must be positive"),
        track_inventory: z.boolean(),
        low_stock_threshold: z.number().min(0),
        allow_backorder: z.boolean(),
    }),
    attributes: z.record(z.string(), z.any()).optional(),
    specifications: z.record(z.string(), z.any()).optional(),
    tags: z.array(z.string()).optional(),
    seo: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        keywords: z.array(z.string()).optional(),
    }).optional(),
    shipping: z.object({
        weight: z.number().optional(),
        dimensions: z.object({
            length: z.number().optional(),
            width: z.number().optional(),
            height: z.number().optional(),
        }).optional(),
    }).optional(),
    variants: z.array(z.object({
        id: z.string(),
        color: z.string(),
        images: z.array(z.any()).optional(),
        primaryIndex: z.number(),
        sizes: z.array(z.object({
            id: z.string(),
            size: z.string(),
            stock: z.number(),
            priceModifier: z.number(),
            sku: z.string(),
            attributes: z.record(z.string(), z.any()),
        }))
    })).optional(),
    is_active: z.boolean(),
    is_featured: z.boolean(),
    visibility: z.enum(["public", "private", "hidden"]),
    images: z.array(z.string()).optional(),
})

const useProductDefaults = () => {
    const [defaultSpecifications, setDefaultSpecifications] = useState<Record<string, string>>({})
    const [defaultAttributes, setDefaultAttributes] = useState<Record<string, any>>({})
    const [defaultTags, setDefaultTags] = useState<string[]>([])
    const [defaultSeoKeywords, setDefaultSeoKeywords] = useState<string[]>([])

    useEffect(() => {
        setDefaultSpecifications({
            "Material": "Cotton",
            "Size Guide": "See product description",
            "Care Instructions": "Machine wash cold"
        })
        setDefaultAttributes({
            "Fabric": "100% Cotton",
            "Pattern": "Solid"
        })
        setDefaultTags(["new-arrival", "summer-collection"])
        setDefaultSeoKeywords(["fashion", "clothing", "trendy"])
    }, [])

    const applyDefaults = useCallback((form: any) => {
        form.setValue("specifications", defaultSpecifications)
        form.setValue("attributes", defaultAttributes)
        form.setValue("tags", defaultTags)
        form.setValue("seo.keywords", defaultSeoKeywords)
    }, [defaultSpecifications, defaultAttributes, defaultTags, defaultSeoKeywords])

    return {
        defaultSpecifications,
        defaultAttributes,
        defaultTags,
        defaultSeoKeywords,
        applyDefaults
    }
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

export default function ProductPage() {
    const router = useRouter()
    const params = useParams()
    const productId = params.id as string | undefined
    const isEdit = !!productId

    const { createProduct, updateProduct, loading } = useProductStore()
    const { categories, allCategories, fetchCategories, fetchAllCategories, loading: categoriesLoading } = useCategoryStore()
    const { applyDefaults } = useProductDefaults()

    const [activeTab, setActiveTab] = useState("basic")
    const [colorVariants, setColorVariants] = useState<iProductVariant[]>([])
    const [tags, setTags] = useState<string[]>([])
    const [newTag, setNewTag] = useState("")
    const [seoKeywords, setSeoKeywords] = useState<string[]>([])
    const [newKeyword, setNewKeyword] = useState("")
    const [specifications, setSpecifications] = useState<Record<string, any>>({})
    const [newSpecification, setNewSpecification] = useState({ key: "", value: "" })
    const [isApplyingDefaults, setIsApplyingDefaults] = useState(false)
    const [expandedSizeRows, setExpandedSizeRows] = useState<Record<string, boolean>>({})
    const [sizeOptions, setSizeOptions] = useState<string[]>(["S", "M", "L", "XL", "XXL"])
    const [newSizeOption, setNewSizeOption] = useState("")

    const form = useForm<iProductFormData>({
        resolver: zodResolver(productSchema as any),
        defaultValues: {
            name: "",
            description: "",
            slug: "",
            price: 1,
            compare_price: 0,
            cost_price: 0,
            category: "",
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
                weight: 0,
                dimensions: undefined,
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

    useEffect(() => {
        if (selectedCategory && colorVariants.length > 0) {
            const filters = normalizeFilters(selectedCategory.config?.filters)
            const updatedVariants = colorVariants.map(variant => {
                const updatedSizes = (variant.sizes || []).map(size => {
                    const initialAttributes: Record<string, any> = { ...(size.attributes || {}) }
                    filters.forEach((attr) => {
                        if (!(attr.name in initialAttributes)) {
                            if (attr.type === "multiselect") {
                                initialAttributes[attr.name] = []
                            } else {
                                initialAttributes[attr.name] = ""
                            }
                        }
                    })
                    return {
                        ...size,
                        attributes: initialAttributes
                    }
                })
                return {
                    ...variant,
                    sizes: updatedSizes
                }
            })
            setColorVariants(updatedVariants)
        }
    }, [selectedCategoryId])

    useEffect(() => {
        if (allCategories.length === 0) {
            fetchAllCategories(true)
        }
    }, [allCategories.length, fetchAllCategories])



    const handleApplyDefaults = () => {
        setIsApplyingDefaults(true)
        applyDefaults(form)
        setTags(form.getValues("tags") || [])
        setSeoKeywords(form.getValues("seo.keywords") || [])
        setSpecifications(form.getValues("specifications") || {})
        setIsApplyingDefaults(false)
        toast.success("Default values applied")
    }

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()])
            setNewTag("")
        }
    }

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove))
    }

    const addSpecification = () => {
        if (newSpecification.key.trim() && newSpecification.value.trim()) {
            setSpecifications(prev => ({
                ...prev,
                [newSpecification.key.trim()]: newSpecification.value.trim()
            }))
            setNewSpecification({ key: "", value: "" })
        }
    }

    const removeSpecification = (key: string) => {
        setSpecifications(prev => {
            const updated = { ...prev }
            delete updated[key]
            return updated
        })
    }

    const addColorVariant = () => {
        const newVariant: iProductVariant = {
            id: v4(),
            color: "",
            images: [],
            primaryIndex: 0,
            sizes: [],
        }
        setColorVariants([...colorVariants, newVariant])
    }

    const removeColorVariant = (id: string) => {
        console.log(id);

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
                        priceModifier: null,
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
        const key = `${variantId}_${sizeId}`
        setExpandedSizeRows(prev => {
            const copy = { ...prev }
            delete copy[key]
            return copy
        })
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

    const handleImageSelect = (id: string, files: File[]) => {
        const variant = colorVariants.find(v => v.id === id)
        if (variant) {
            updateColorVariant(id, { images: [...variant.images, ...files] })
        }
    }

    const handleImageRemove = (id: string, index: number) => {
        const variant = colorVariants.find(v => v.id === id)
        if (!variant) return

        const newImages = variant.images.filter((_, i) => i !== index)
        let newPrimaryIndex = variant.primaryIndex

        if (index === variant.primaryIndex) {
            newPrimaryIndex = 0
        } else if (index < variant.primaryIndex) {
            newPrimaryIndex = variant.primaryIndex - 1
        }

        updateColorVariant(id, {
            images: newImages,
            primaryIndex: newPrimaryIndex
        })
    }

    const handleSetPrimaryImage = (id: string, index: number) => {
        updateColorVariant(id, { primaryIndex: index })
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

    const toggleExpandRow = (variantId: string, sizeId: string) => {
        const key = `${variantId}_${sizeId}`
        setExpandedSizeRows(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const addKeyword = () => {
        if (newKeyword.trim() && !seoKeywords.includes(newKeyword.trim())) {
            setSeoKeywords([...seoKeywords, newKeyword.trim()])
            setNewKeyword("")
        }
    }

    const removeKeyword = (keyword: string) => {
        setSeoKeywords(seoKeywords.filter(k => k !== keyword))
    }

    const uploadToCloudinary = async (file: File): Promise<string> => {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "BizzWeb";

        if (!cloudName || !uploadPreset) {
            throw new Error("Missing Cloudinary configuration.");
        }

        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        formData.append("folder", "ecommerce_uploads/products");

        const res = await fetch(uploadUrl, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error?.message || "Image upload failed");
        }

        const data = await res.json();
        return data.secure_url;
    };

    const onSubmit = async (data: iProductFormData) => {
        try {
            const variantUploadPromises = colorVariants.map(async variant => {
                const imageUrls = await Promise.all(
                    variant.images.map(async (img) => {
                        if (img instanceof File) {
                            return await uploadToCloudinary(img);
                        }
                        return img as string;
                    })
                );
                const sizes = variant.sizes.map(size => ({
                    ...size,
                    attributes: size.attributes
                }));
                return {
                    ...variant,
                    images: imageUrls,
                    sizes
                };
            })

            const variantsWithImages = await Promise.all(variantUploadPromises)

            data.slug = data.name.toLowerCase().replace(/\s+/g, "-")
            data.variants = variantsWithImages
            data.tags = tags
            data.specifications = specifications
            data.seo = {
                ...data.seo,
                keywords: seoKeywords,
            }
            console.log(data);

            // if (isEdit && productId) {
            //     await updateProduct(productId, data)
            //     toast.success("Product updated successfully")
            // } else {
            await createProduct(data as any)
            toast.success("Product created successfully")
            // }
            router.push("/products")
        } catch (error: any) {
            toast.error(error.message || "Failed to save product")
        }
    }

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

    const renderBasicTab = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Product Details
                        </CardTitle>
                        {/* <Button
                            type="button"
                            variant="secondary"
                            onClick={handleApplyDefaults}
                            disabled={isApplyingDefaults}
                        >
                            Apply Defaults
                        </Button> */}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                            id="name"
                            {...form.register("name")}
                            placeholder="Enter product name"
                        />
                        {form.formState.errors.name && (
                            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                            value={form.watch("category")}
                            onValueChange={(value) => form.setValue("category", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categoriesLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <SelectItem key={i} value={`loading-${i}`} disabled>
                                            <Skeleton className="h-4 w-32" />
                                        </SelectItem>
                                    ))
                                ) : (
                                    allCategories.map((category) => (
                                        <SelectItem key={category._id} value={category._id}>
                                            {category.display_name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {form.formState.errors.category && (
                            <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="brand">Brand</Label>
                            <Input
                                id="brand"
                                {...form.register("brand")}
                                placeholder="Enter brand name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sku">Product SKU</Label>
                            <Input
                                id="sku"
                                {...form.register("sku")}
                                placeholder="Enter product SKU"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <RichTextEditor
                            label="Description"
                            value={form.watch("description") || ""}
                            onChange={(value) => form.setValue("description", value)}
                            placeholder="Describe your product in detail..."
                        />
                    </div>
                </CardContent>
            </Card>

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
                        />
                        <Button type="button" onClick={addTag} variant="outline">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1">
                                    <span className="max-w-[120px] truncate">{tag}</span>
                                    <X
                                        className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground"
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
                                {colorVariants.map((variant) =>
                                    variant.sizes.map((size) => {
                                        const key = `${variant.id}_${size.id}`;
                                        const expanded = !!expandedSizeRows[key];
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
        </div >
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
                        <Label htmlFor="price">Base Price *</Label>
                        <Input
                            id="price"
                            type="number"
                            step="0.01"

                            {...form.register("price", { valueAsNumber: true })}
                            placeholder="0.00"
                        />
                        {form.formState.errors.price && (
                            <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="compare_price">Compare At Price</Label>
                        <Input
                            id="compare_price"
                            type="number"
                            step="0.01"

                            {...form.register("compare_price", { valueAsNumber: true })}
                            placeholder="0.00"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cost_price">Cost Price</Label>
                        <Input
                            id="cost_price"
                            type="number"
                            step="0.01"

                            {...form.register("cost_price", { valueAsNumber: true })}
                            placeholder="0.00"
                        />
                    </div>
                </div>

                {colorVariants.length > 0 && (
                    <div className="mt-6">
                        <Label>Variant Pricing</Label>
                        <div className="mt-2 border rounded-lg overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2">Color</th>
                                        <th className="text-left p-2">Size</th>
                                        <th className="text-left p-2">Price Modifier</th>
                                        <th className="text-left p-2">Final Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {colorVariants.map(variant =>
                                        variant.sizes.map(size => (
                                            <tr key={size.id} className="border-b hover:bg-muted/50">
                                                <td className="p-2">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-5 h-5 rounded-full border"
                                                            style={{
                                                                backgroundColor: variant.color.toLowerCase() === 'white' ? '#fff' : variant.color.toLowerCase() === 'black' ? '#000' : variant.color
                                                            }}
                                                        ></div>
                                                        <span className="truncate max-w-[120px]">{variant.color}</span>
                                                    </div>
                                                </td>
                                                <td className="p-2 font-medium">
                                                    {size.size}
                                                </td>
                                                <td className="p-2">
                                                    {size.priceModifier ?? 0 > 0 ? `+${size.priceModifier?.toFixed(2)}` : size.priceModifier?.toFixed(2)}
                                                </td>
                                                <td className="p-2 font-medium">
                                                    ${(form.watch("price") + size.priceModifier ?? 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
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
                        <Label htmlFor="low_stock_threshold">Low Stock Alert</Label>
                        <Input
                            id="low_stock_threshold"
                            type="number"

                            {...form.register("stock.low_stock_threshold", { valueAsNumber: true })}
                            placeholder="10"
                        />
                        {form.formState.errors?.stock?.low_stock_threshold && (
                            <p className="text-sm text-destructive">{form.formState.errors.stock.low_stock_threshold.message}</p>
                        )}
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <Label>Track Inventory</Label>
                            <p className="text-sm text-muted-foreground">Monitor stock levels for this product</p>
                        </div>
                        <Switch
                            checked={form.watch("stock.track_inventory")}
                            onCheckedChange={(checked) => form.setValue("stock.track_inventory", checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <Label>Allow Backorder</Label>
                            <p className="text-sm text-muted-foreground">Accept orders when out of stock</p>
                        </div>
                        <Switch
                            checked={form.watch("stock.allow_backorder")}
                            onCheckedChange={(checked) => form.setValue("stock.allow_backorder", checked)}
                        />
                    </div>
                </div>

                {colorVariants.length > 0 && (
                    <div className="mt-6">
                        <Label>Variant Stock</Label>
                        <div className="mt-2 border rounded-lg overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2">Color</th>
                                        <th className="text-left p-2">Size</th>
                                        <th className="text-left p-2">SKU</th>
                                        <th className="text-left p-2">Stock Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {colorVariants.map(variant =>
                                        variant.sizes.map(size => (
                                            <tr key={size.id} className="border-b hover:bg-muted/50">
                                                <td className="p-2">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-5 h-5 rounded-full border"
                                                            style={{
                                                                backgroundColor: variant.color.toLowerCase() === 'white' ? '#fff' : variant.color.toLowerCase() === 'black' ? '#000' : variant.color
                                                            }}
                                                        ></div>
                                                        <span className="truncate max-w-[120px]">{variant.color}</span>
                                                    </div>
                                                </td>
                                                <td className="p-2 font-medium">
                                                    {size.size}
                                                </td>
                                                <td className="p-2 truncate max-w-[120px]">
                                                    {size.sku || "N/A"}
                                                </td>
                                                <td className="p-2">
                                                    {size.stock}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
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

                        {...form.register("shipping.weight", { valueAsNumber: true })}
                        placeholder="0.00"
                    />
                    {form.formState.errors?.shipping?.weight && (
                        <p className="text-sm text-destructive">{form.formState.errors.shipping.weight.message}</p>
                    )}
                </div>

                <div className="space-y-4">
                    <Label>Dimensions (cm)</Label>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm">Length</Label>
                            <Input
                                type="number"
                                step="0.01"

                                {...form.register("shipping.dimensions.length", { valueAsNumber: true })}
                                placeholder="Length"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">Width</Label>
                            <Input
                                type="number"
                                step="0.01"

                                {...form.register("shipping.dimensions.width", { valueAsNumber: true })}
                                placeholder="Width"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">Height</Label>
                            <Input
                                type="number"
                                step="0.01"

                                {...form.register("shipping.dimensions.height", { valueAsNumber: true })}
                                placeholder="Height"
                            />
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                        {form.formState.errors?.shipping?.dimensions?.length?.message ||
                            form.formState.errors?.shipping?.dimensions?.width?.message ||
                            form.formState.errors?.shipping?.dimensions?.height?.message}
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
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="seo_description">SEO Description</Label>
                    <Textarea
                        id="seo_description"
                        {...form.register("seo.description")}
                        placeholder="Enter SEO meta description"
                        rows={3}
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
                        />
                        <Button type="button" onClick={addKeyword} variant="outline">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    {seoKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {seoKeywords.map((keyword, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1">
                                    <span className="max-w-[120px] truncate">{keyword}</span>
                                    <X
                                        className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground"
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
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <Label>Active Status</Label>
                            <p className="text-sm text-muted-foreground">Make this product available for purchase</p>
                        </div>
                        <Switch
                            checked={form.watch("is_active")}
                            onCheckedChange={(checked) => form.setValue("is_active", checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <Label>Featured Product</Label>
                            <p className="text-sm text-muted-foreground">Show this product in featured sections</p>
                        </div>
                        <Switch
                            checked={form.watch("is_featured")}
                            onCheckedChange={(checked) => form.setValue("is_featured", checked)}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    const tabs = [
        { value: "basic", label: "Basic", icon: Info },
        { value: "color-variants", label: "Variants", icon: ImageIcon },
        { value: "pricing", label: "Pricing", icon: DollarSign },
        { value: "inventory", label: "Inventory", icon: BarChart3 },
        { value: "shipping", label: "Shipping", icon: Truck },
        { value: "seo", label: "SEO", icon: Search },
        { value: "advanced", label: "Advanced", icon: Settings },
    ]

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    <p>Loading product data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
                        <div>
                            <h1 className="text-xl font-semibold">{isEdit ? "Edit Product" : "Create New Product"}</h1>
                            <p className="text-sm text-muted-foreground">
                                {isEdit ? "Update your product details" : "Add a new product to your store"}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant="outline"
                                onClick={() => router.push("/products")}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={form.handleSubmit(onSubmit)}
                                disabled={loading}
                                className="flex items-center gap-2"
                            >
                                {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />}
                                <Save className="h-4 w-4" />
                                {isEdit ? "Update Product" : "Create Product"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="overflow-x-auto pb-2">
                        <TabsList className="flex w-full">
                            {tabs.map((tab) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="flex items-center gap-2 whitespace-nowrap"
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <div className="mt-6">
                        <TabsContent value="basic">
                            {/* <ScrollArea className="h-[calc(100vh-200px)] pr-4"> */}
                            {renderBasicTab()}
                            {/* </ScrollArea> */}
                        </TabsContent>
                        <TabsContent value="color-variants">
                            {/* <ScrollArea className="h-[calc(100vh-200px)] pr-4"> */}
                            {renderColorVariantsTab()}
                            {/* </ScrollArea> */}
                        </TabsContent>
                        <TabsContent value="pricing">
                            {/* <ScrollArea className="h-[calc(100vh-200px)] pr-4"> */}
                            {renderPricingTab()}
                            {/* </ScrollArea> */}
                        </TabsContent>
                        <TabsContent value="inventory">
                            {/* <ScrollArea className="h-[calc(100vh-200px)] pr-4"> */}
                            {renderInventoryTab()}
                            {/* </ScrollArea> */}
                        </TabsContent>
                        <TabsContent value="shipping">
                            {/* <ScrollArea className="h-[calc(100vh-200px)] pr-4"> */}
                            {renderShippingTab()}
                            {/* </ScrollArea> */}
                        </TabsContent>
                        <TabsContent value="seo">
                            {/* <ScrollArea className="h-[calc(100vh-200px)] pr-4"> */}
                            {renderSEOTab()}
                            {/* </ScrollArea> */}
                        </TabsContent>
                        <TabsContent value="advanced">
                            {/* <ScrollArea className="h-[calc(100vh-200px)] pr-4"> */}
                            {renderAdvancedTab()}
                            {/* </ScrollArea> */}
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    )
}