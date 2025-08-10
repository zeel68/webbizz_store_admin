"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { Plus, X, Trash2, Save, Package, Tag, Settings, DollarSign, Truck, Search, BarChart3, ImageIcon, Info } from 'lucide-react'
import { useProductStore } from "@/store/productStore"
import { useCategoryStore } from "@/store/categoryStore"
import ImageUpload from "@/components/shared/image-upload"
import { RichTextEditor } from "@/components/ui/rich-text-editor"

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
    images?: string[] // Add images property
}

const productSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().optional(),
    price: z.number().min(0, "Price must be positive"),
    compare_price: z.number().optional(),
    cost_price: z.number().optional(),
    store_category_id: z.string().optional(),
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
        name: z.string(),
        options: z.array(z.string()),
        price_modifier: z.number().optional(),
        stock_quantity: z.number().optional(),
        sku: z.string().optional(),
    })).optional(),
    is_active: z.boolean(),
    is_featured: z.boolean(),
    visibility: z.enum(["public", "private", "hidden"]),
    images: z.array(z.string()).optional(), // Add to schema
})


interface iProductVariant {
    name: string
    options: string[]
    price_modifier: number
    stock_quantity: number
    sku: string
}


export default function AddProductPage() {
    const router = useRouter()
    const { createProduct, loading } = useProductStore()
    const { categories, fetchCategories } = useCategoryStore()

    const [activeTab, setActiveTab] = useState("basic")
    const [selectedImages, setSelectedImages] = useState<File[]>([])
    const [primaryImageIndex, setPrimaryImageIndex] = useState(0)

    // Form state for complex fields
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

    const form = useForm<iProductFormData>({
        resolver: zodResolver(productSchema as any),
        defaultValues: {
            name: "qw",
            description: "qwqw",
            price: 1,
            compare_price: 2,
            cost_price: 1,
            store_category_id: "",
            brand: "",
            sku: "",
            stock: {
                quantity: 1,
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
                weight: 1,
                dimensions: undefined,
            },
            variants: [],
            is_active: true,
            is_featured: false,
            visibility: "public",
            images: [], // Add default value
        },
    })

    // Load categories on mount
    useEffect(() => {
        if (categories.length === 0) {
            fetchCategories(true)
        }
    }, [categories.length, fetchCategories])

    const handleImageSelect = (files: File[]) => {
        setSelectedImages([...selectedImages, ...files])
    }

    const handleImageRemove = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index))
        if (primaryImageIndex === index) {
            setPrimaryImageIndex(0)
        } else if (index < primaryImageIndex) {
            setPrimaryImageIndex(prev => prev - 1)
        }
    }

    const handleSetPrimaryImage = (index: number) => {
        setPrimaryImageIndex(index)
    }

    // Tag management
    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            const updatedTags = [...tags, newTag.trim()]
            setTags(updatedTags)
            setNewTag("")
        }
    }

    const removeTag = (tagToRemove: string) => {
        const updatedTags = tags.filter(tag => tag !== tagToRemove)
        setTags(updatedTags)
    }

    // Attribute management
    const addAttribute = () => {
        if (newAttribute.key.trim() && newAttribute.value.trim()) {
            setAttributes(prev => ({
                ...prev,
                [newAttribute.key.trim()]: newAttribute.value.trim()
            }))
            setNewAttribute({ key: "", value: "" })
        }
    }

    const removeAttribute = (key: string) => {
        setAttributes(prev => {
            const updated = { ...prev }
            delete updated[key]
            return updated
        })
    }

    // Specification management
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

    // Variant management
    const addVariantOption = () => {
        if (newVariantOption.trim() && !newVariant.options.includes(newVariantOption.trim())) {
            setNewVariant(prev => ({
                ...prev,
                options: [...prev.options, newVariantOption.trim()]
            }))
            setNewVariantOption("")
        }
    }

    const removeVariantOption = (option: string) => {
        setNewVariant(prev => ({
            ...prev,
            options: prev.options.filter(opt => opt !== option)
        }))
    }

    const addVariant = () => {
        if (newVariant.name.trim() && newVariant.options.length > 0) {
            setVariants(prev => [...prev, { ...newVariant }])
            setNewVariant({
                name: "",
                options: [],
                price_modifier: 0,
                stock_quantity: 0,
                sku: "",
            })
        }
    }

    const removeVariant = (index: number) => {
        setVariants(prev => prev.filter((_, i) => i !== index))
    }

    // SEO keyword management
    const addKeyword = () => {
        if (newKeyword.trim() && !seoKeywords.includes(newKeyword.trim())) {
            setSeoKeywords(prev => [...prev, newKeyword.trim()])
            setNewKeyword("")
        }
    }

    const removeKeyword = (keyword: string) => {
        setSeoKeywords(prev => prev.filter(k => k !== keyword))
    }

    const uploadMultipleToCloudinary = async (files: File[]): Promise<string[]> => {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "BizzWeb";

        if (!cloudName || !uploadPreset) {
            throw new Error("Missing Cloudinary configuration.");
        }

        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        const uploadPromises = files.map(async (file) => {
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
        });

        return await Promise.all(uploadPromises);
    };

    const onSubmit = async (data: any) => {
        console.log("Hello");

        try {
            toast.info("Uploading images...")
            const urls = await uploadMultipleToCloudinary(selectedImages)

            // Combine form data with complex state
            const productData: iProductFormData = {
                ...data,
                tags,
                attributes,
                specifications,
                variants,
                images: urls,
                seo: {
                    ...data.seo,
                    keywords: seoKeywords,
                },
            }
            console.log(productData);

            await createProduct(productData as any)
            toast.success("Product created successfully")
            router.push("/products")
        } catch (error: any) {
            toast.error(error.message || "Failed to create product")
        }
    }

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
                            />
                            {form.formState.errors.name && (
                                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={form.watch("store_category_id")}
                                onValueChange={(value) => form.setValue("store_category_id", value)}
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
                            {form.formState.errors.store_category_id && (
                                <p className="text-sm text-destructive">{form.formState.errors.store_category_id.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="brand">Brand</Label>
                                <Input
                                    id="brand"
                                    {...form.register("brand")}
                                    placeholder="Enter brand name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU</Label>
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
                            <ImageIcon className="h-5 w-5" />
                            Product Images
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ImageUpload
                            onSelectFiles={handleImageSelect}
                            onRemove={handleImageRemove}
                            onSetPrimary={handleSetPrimaryImage}
                            value={selectedImages}
                            primaryIndex={primaryImageIndex}
                            multiple={true}
                            showPreview={true}
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
                        />
                        <Button type="button" onClick={addTag} variant="outline">
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
                            min="0"
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
                            min="0"
                            {...form.register("cost_price", { valueAsNumber: true })}
                            placeholder="0.00"
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
                            {...form.register("stock.quantity", { valueAsNumber: true })}
                            placeholder="0"
                        />
                        {form.formState.errors?.stock?.quantity && (
                            <p className="text-sm text-destructive">{form.formState.errors.stock.quantity.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="low_stock_threshold">Low Stock Alert</Label>
                        <Input
                            id="low_stock_threshold"
                            type="number"
                            min="0"
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
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Track Inventory</Label>
                            <p className="text-sm text-muted-foreground">Monitor stock levels for this product</p>
                        </div>
                        <Switch
                            checked={form.watch("stock.track_inventory")}
                            onCheckedChange={(checked) => form.setValue("stock.track_inventory", checked)}
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
                        />
                        <Input
                            value={newAttribute.value}
                            onChange={(e) => setNewAttribute(prev => ({ ...prev, value: e.target.value }))}
                            placeholder="Attribute value"
                        />
                        <Button type="button" onClick={addAttribute} variant="outline">
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
                        />
                        <Input
                            value={newSpecification.value}
                            onChange={(e) => setNewSpecification(prev => ({ ...prev, value: e.target.value }))}
                            placeholder="Specification value"
                        />
                        <Button type="button" onClick={addSpecification} variant="outline">
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
                                placeholder="e.g., Size, Color, Style"
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
                                />
                                <Button type="button" onClick={addVariantOption} variant="outline">
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
                                    value={newVariant.price_modifier}
                                    onChange={(e) => setNewVariant(prev => ({ ...prev, price_modifier: Number(e.target.value) }))}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Stock Quantity</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={newVariant.stock_quantity}
                                    onChange={(e) => setNewVariant(prev => ({ ...prev, stock_quantity: Number(e.target.value) }))}
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>SKU</Label>
                                <Input
                                    value={newVariant.sku}
                                    onChange={(e) => setNewVariant(prev => ({ ...prev, sku: e.target.value }))}
                                    placeholder="Variant SKU"
                                />
                            </div>
                        </div>

                        <Button
                            type="button"
                            onClick={addVariant}
                            disabled={!newVariant.name.trim() || newVariant.options.length === 0}
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
                                min="0"
                                {...form.register("shipping.dimensions.length", { valueAsNumber: true })}
                                placeholder="Length"
                            />
                            {form.formState.errors?.shipping?.dimensions?.length && (
                                <p className="text-sm text-destructive">{form.formState.errors.shipping.dimensions?.length.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">Width</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...form.register("shipping.dimensions.width", { valueAsNumber: true })}
                                placeholder="Width"
                            />
                            {form.formState.errors?.shipping?.dimensions?.width && (
                                <p className="text-sm text-destructive">{form.formState.errors.shipping.dimensions?.width.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">Height</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...form.register("shipping.dimensions.height", { valueAsNumber: true })}
                                placeholder="Height"
                            />
                            {form.formState.errors?.shipping?.dimensions?.height && (
                                <p className="text-sm text-destructive">{form.formState.errors.shipping.dimensions?.height.message}</p>
                            )}
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
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-xl font-semibold">Create New Product</h1>
                                <p className="text-sm text-muted-foreground">Add a new product to your store</p>
                            </div>
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
                                Create Product
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
                            <TabsContent value="basic">
                                {renderBasicTab()}
                            </TabsContent>
                            <TabsContent value="pricing">
                                {renderPricingTab()}
                            </TabsContent>
                            <TabsContent value="inventory">
                                {renderInventoryTab()}
                            </TabsContent>
                            <TabsContent value="attributes">
                                {renderAttributesTab()}
                            </TabsContent>
                            <TabsContent value="shipping">
                                {renderShippingTab()}
                            </TabsContent>
                            <TabsContent value="seo">
                                {renderSEOTab()}
                            </TabsContent>
                            <TabsContent value="advanced">
                                {renderAdvancedTab()}
                            </TabsContent>
                        </div>
                    </Tabs>
                </form>
            </div>
        </div>
    )
}