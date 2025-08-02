"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useStoreAdminStore } from "@/store/storeAdminStore"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { Plus, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import ImageUpload from "@/components/shared/image-upload"
import type { Product, ProductFormData, ProductTag } from "@/models/schemas/product"

interface CreateProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingProduct?: Product | null
  preselectedCategoryId?: string
}

export function CreateProductDialog({
  open,
  onOpenChange,
  editingProduct,
  preselectedCategoryId,
}: CreateProductDialogProps) {
  const {
    createProduct,
    updateProduct,
    categories,
    parentCategories,
    fetchCategories,
    fetchParentCategories,
    isLoading,
    loading,
  } = useStoreAdminStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0)
  const [newTag, setNewTag] = useState("")
  const [newColorOption, setNewColorOption] = useState("")
  const [newSizeOption, setNewSizeOption] = useState("")

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    discount_price: undefined,
    parent_category: "",
    category: preselectedCategoryId || "",
    attributes: {
      color: [],
      size: [],
    },
    stock: {
      quantity: 0,
      reserved: 0,
    },
    images: [],
    is_active: true,
    is_featured: false,
    tags: [],
    searchFilters: {},
    displaySettings: {},
  })

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories()
    }
    if (parentCategories.length === 0) {
      fetchParentCategories()
    }
  }, [categories.length, parentCategories.length, fetchCategories, fetchParentCategories])

  useEffect(() => {
    if (editingProduct && open) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description || "",
        price: editingProduct.price,
        discount_price: editingProduct.discount_price,
        parent_category: editingProduct.parent_category,
        category: editingProduct.category,
        attributes: editingProduct.attributes || { color: [], size: [] },
        stock: {
          quantity: editingProduct.stock.quantity,
          reserved: editingProduct.stock.reserved || 0,
        },
        images: editingProduct.images || [],
        is_active: editingProduct.is_active,
        is_featured: editingProduct.is_featured || false,
        tags: editingProduct.tags || [],
        searchFilters: editingProduct.searchFilters || {},
        displaySettings: editingProduct.displaySettings || {},
      })
      setSelectedImages([])
    } else if (open) {
      setFormData({
        name: "",
        description: "",
        price: 0,
        discount_price: undefined,
        parent_category: "",
        category: preselectedCategoryId || "",
        attributes: {
          color: [],
          size: [],
        },
        stock: {
          quantity: 0,
          reserved: 0,
        },
        images: [],
        is_active: true,
        is_featured: false,
        tags: [],
        searchFilters: {},
        displaySettings: {},
      })
      setSelectedImages([])
      setPrimaryImageIndex(0)
    }
  }, [editingProduct, open, preselectedCategoryId])

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formDataUpload = new FormData()
    formDataUpload.append("file", file)
    formDataUpload.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "BizzWeb")
    formDataUpload.append("folder", "ecommerce_uploads/products")
    formDataUpload.append("tags", "product_upload")

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formDataUpload,
      },
    )

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error?.message || "Upload failed")
    }

    const data = await res.json()
    return data.secure_url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Product name is required")
      return
    }

    if (formData.price <= 0) {
      toast.error("Product price must be greater than 0")
      return
    }

    if (!formData.category) {
      toast.error("Please select a category")
      return
    }

    if (!formData.parent_category) {
      toast.error("Please select a parent category")
      return
    }

    if (!editingProduct && selectedImages.length === 0) {
      toast.error("Please select at least one product image")
      return
    }

    setIsSubmitting(true)

    try {
      let uploadedUrls: string[] = []

      // Upload images if any are selected
      if (selectedImages.length > 0) {
        toast.info("Uploading product images...")
        uploadedUrls = await Promise.all(selectedImages.map((file) => uploadToCloudinary(file)))
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully`)
      }

      const productData: ProductFormData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        discount_price: formData.discount_price ? Number(formData.discount_price) : undefined,
        parent_category: formData.parent_category,
        category: formData.category,
        attributes: formData.attributes,
        stock: {
          quantity: Number(formData.stock.quantity),
          reserved: Number(formData.stock.reserved || 0),
        },
        images: uploadedUrls.length > 0 ? uploadedUrls : editingProduct?.images || [],
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        tags: formData.tags,
        searchFilters: formData.searchFilters,
        displaySettings: formData.displaySettings,
      }

      if (editingProduct) {
        await updateProduct(editingProduct._id, productData)
        toast.success("Product updated successfully")
      } else {
        await createProduct(productData)
        toast.success("Product created successfully")
      }

      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || (editingProduct ? "Failed to update product" : "Failed to create product"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddTag = () => {
    if (newTag.trim()) {
      const tag: ProductTag = {
        tagId: `tag_${Date.now()}`,
        tagName: newTag.trim(),
        tagType: "custom",
        value: newTag.trim(),
        category: "general",
      }
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tag],
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: ProductTag) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t.tagId !== tagToRemove.tagId),
    }))
  }

  const handleAddColorOption = () => {
    if (newColorOption.trim()) {
      setFormData((prev) => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          color: [
            ...(prev.attributes?.color || []),
            {
              colorOption: newColorOption.trim(),
              isSelected: false,
            },
          ],
        },
      }))
      setNewColorOption("")
    }
  }

  const handleRemoveColorOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        color: (prev.attributes?.color || []).filter((_, i) => i !== index),
      },
    }))
  }

  const handleAddSizeOption = () => {
    if (newSizeOption.trim()) {
      const sizeValue = isNaN(Number(newSizeOption)) ? newSizeOption : Number(newSizeOption)
      setFormData((prev) => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          size: [
            ...(prev.attributes?.size || []),
            {
              colorOption: sizeValue,
              isSelected: false,
            },
          ],
        },
      }))
      setNewSizeOption("")
    }
  }

  const handleRemoveSizeOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        size: (prev.attributes?.size || []).filter((_, i) => i !== index),
      },
    }))
  }

  const handleImageSelect = (files: File[]) => {
    setSelectedImages((prev) => [...prev, ...files])
  }

  const handleImageRemove = (index: number) => {
    setSelectedImages((prev) => {
      const updated = [...prev]
      updated.splice(index, 1)
      return updated
    })

    if (primaryImageIndex === index) {
      setPrimaryImageIndex(0)
    } else if (primaryImageIndex > index) {
      setPrimaryImageIndex(primaryImageIndex - 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{editingProduct ? "Edit Product" : "Create New Product"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <ScrollArea className="flex-1 pr-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="attributes">Attributes</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Product Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter product name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parent_category">
                          Parent Category <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.parent_category}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, parent_category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select parent category" />
                          </SelectTrigger>
                          <SelectContent>
                            {parentCategories.map((category) => (
                              <SelectItem key={category._id} value={category._id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">
                        Store Category <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select store category" />
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

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter product description"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">
                          Price <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discount_price">Discount Price</Label>
                        <Input
                          id="discount_price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.discount_price || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              discount_price: e.target.value ? Number(e.target.value) : undefined,
                            }))
                          }
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Product Images {!editingProduct && <span className="text-red-500">*</span>}</Label>
                      <ImageUpload
                        type="standard"
                        value={selectedImages}
                        primaryIndex={primaryImageIndex}
                        onSelectFiles={handleImageSelect}
                        onSetPrimary={setPrimaryImageIndex}
                        onRemove={handleImageRemove}
                        disabled={isSubmitting}
                        multiple={true}
                        showPreview={true}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attributes" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Attributes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Color Options */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Color Options</h4>
                      {formData.attributes?.color && formData.attributes.color.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.attributes.color.map((color, index) => (
                            <Badge key={index} variant="secondary" className="cursor-pointer">
                              {color.colorOption}
                              <X className="h-3 w-3 ml-1" onClick={() => handleRemoveColorOption(index)} />
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          value={newColorOption}
                          onChange={(e) => setNewColorOption(e.target.value)}
                          placeholder="Add color option"
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddColorOption())}
                        />
                        <Button type="button" onClick={handleAddColorOption}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Size Options */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Size Options</h4>
                      {formData.attributes?.size && formData.attributes.size.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.attributes.size.map((size, index) => (
                            <Badge key={index} variant="secondary" className="cursor-pointer">
                              {size.colorOption}
                              <X className="h-3 w-3 ml-1" onClick={() => handleRemoveSizeOption(index)} />
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          value={newSizeOption}
                          onChange={(e) => setNewSizeOption(e.target.value)}
                          placeholder="Add size option (e.g., XL, 42, Large)"
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSizeOption())}
                        />
                        <Button type="button" onClick={handleAddSizeOption}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Tags */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Product Tags</h4>
                      {formData.tags && formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="cursor-pointer">
                              {tag.tagName}
                              <X className="h-3 w-3 ml-1" onClick={() => handleRemoveTag(tag)} />
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add tag"
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                        />
                        <Button type="button" onClick={handleAddTag}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inventory" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Inventory Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Stock Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="0"
                          value={formData.stock.quantity}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              stock: { ...prev.stock, quantity: Number(e.target.value) },
                            }))
                          }
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reserved">Reserved Stock</Label>
                        <Input
                          id="reserved"
                          type="number"
                          min="0"
                          value={formData.stock.reserved || 0}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              stock: { ...prev.stock, reserved: Number(e.target.value) },
                            }))
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="is_active">Active Status</Label>
                          <p className="text-sm text-muted-foreground">Make this product visible to customers</p>
                        </div>
                        <Switch
                          id="is_active"
                          checked={formData.is_active}
                          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="is_featured">Featured Product</Label>
                          <p className="text-sm text-muted-foreground">Show this product in featured sections</p>
                        </div>
                        <Switch
                          id="is_featured"
                          checked={formData.is_featured}
                          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_featured: checked }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </ScrollArea>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading || loading}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
