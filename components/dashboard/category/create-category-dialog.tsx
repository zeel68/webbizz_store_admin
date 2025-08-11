"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "@/components/shared/image-upload";
import { useCategoryStore } from "@/store/categoryStore";


interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: iStoreCategory | null;
  onCreate?: (category: iStoreCategory) => void;
  onUpdate?: (category: iStoreCategory) => void;
}

export function CreateCategoryDialog({
  open,
  onOpenChange,
  category,
  onCreate,
  onUpdate,
}: CreateCategoryDialogProps) {
  const {
    createCategory,
    updateCategory,
    categories,
    fetchParentCategory,
    loading,
  } = useCategoryStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [newFilterOption, setNewFilterOption] = useState("");

  const [newFilter, setNewFilter] = useState<iFilterOption>({
    name: "",
    type: "text",
    options: [],
    is_required: false,
  });

  const [newAttribute, setNewAttribute] = useState<iAttributeOption>({
    name: "",
    type: "text",
    is_required: false,
    default_value: "",
  });

  const [formData, setFormData] = useState<iCategoryFormData>({
    name: "",
    display_name: "",
    slug: "",
    description: "",
    parent_id: "",
    sort_order: 1,
    is_active: true,
    is_primary: false,
    image_url: "",
    filters: [],
    attributes: [],
  });

  useEffect(() => {
    if (open) {
      fetchParentCategory();
    }
  }, [open, fetchParentCategory]);

  useEffect(() => {
    if (category && open) {
      setFormData({
        name: category.display_name || "",
        display_name: category.display_name || "",
        slug: category.slug || "",
        description: category.description || "",
        parent_id: category.parent_id || "",
        sort_order: category.sort_order || 1,
        is_active: category.is_active !== false,
        is_primary: category.is_primary || false,
        image_url: category.image_url || category.img_url || "",
        filters: (category.config?.filters || []).map(f => ({
          ...f,
          options: f.options ? [...f.options] : []
        })),
        attributes: category.config?.attributes || [],
      });
      setSelectedImages([]);
    } else if (open) {
      setFormData({
        name: "",
        display_name: "",
        slug: "",
        description: "",
        parent_id: "",
        sort_order: 1,
        is_active: true,
        is_primary: false,
        image_url: "",
        filters: [],
        attributes: [],
      });
      setSelectedImages([]);
    }
  }, [category, open]);

  const filteredCategories = categories.filter((tcategory) => tcategory._id != category?._id)

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "BizzWeb",
    );
    formDataUpload.append("folder", "ecommerce_uploads/categories");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formDataUpload,
      },
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || "Image upload failed");
    }

    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.display_name.trim()) {
      toast.error("Category display name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedImageUrl = formData.image_url;

      // Upload image if selected
      if (selectedImages.length > 0) {
        toast.info("Uploading category image...");
        uploadedImageUrl = await uploadToCloudinary(selectedImages[0]);
        toast.success("Image uploaded successfully");
      }

      const categoryData = {
        display_name:
          formData.display_name.toLowerCase(),
        slug: formData.display_name.toLowerCase().replace(" ", "-"),
        description: formData.description,
        parent_id: formData.parent_id || null,
        sort_order: Number(formData.sort_order),
        is_active: formData.is_active,
        is_primary: formData.is_primary,
        img_url: uploadedImageUrl,
        image_url: uploadedImageUrl,
        config: {
          filters: formData.filters,
          attributes: formData.attributes,
        },
      };

      if (category) {
        const result = await updateCategory(category._id, categoryData as any);
        toast.success("Category updated successfully");
        // if (onUpdate) onUpdate();
      } else {
        const result = await createCategory(categoryData as any);
        toast.success("Category created successfully");
        // if (onCreate) onCreate();
      }


    } catch (error: any) {
      toast.error(
        error.message ||
        (category
          ? "Failed to update category"
          : "Failed to create category"),
      );
    } finally {
      setIsSubmitting(false);
      onOpenChange(false);
    }
  };

  const handleAddFilterOption = () => {
    if (
      newFilterOption.trim() &&
      !newFilter.options.includes(newFilterOption.trim())
    ) {
      setNewFilter((prev) => ({
        ...prev,
        options: [...prev.options, newFilterOption.trim()],
      }));
      setNewFilterOption("");
    }
  };

  const handleRemoveFilterOption = (option: string) => {
    setNewFilter((prev) => ({
      ...prev,
      options: prev.options.filter((o) => o !== option),
    }));
  };

  const handleAddFilter = () => {
    if (newFilter.name.trim()) {
      setFormData((prev) => ({
        ...prev,
        filters: [...prev.filters, { ...newFilter }],
      }));
      setNewFilter({
        name: "",
        type: "text",
        options: [],
        is_required: false,
      });
    }
  };

  const handleRemoveFilter = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index),
    }));
  };

  const handleAddAttribute = () => {
    if (newAttribute.name.trim()) {
      setFormData((prev) => ({
        ...prev,
        attributes: [...prev.attributes, { ...newAttribute }],
      }));
      setNewAttribute({
        name: "",
        type: "text",
        is_required: false,
        default_value: "",
      });
    }
  };

  const handleRemoveAttribute = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  const handleImageSelect = (files: File[]) => {
    setSelectedImages(files.slice(0, 1)); // Only allow one image for categories
  };

  const handleImageRemove = () => {
    setSelectedImages([]);
    setFormData((prev) => ({ ...prev, image_url: "" }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90dvh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {category ? "Edit Category" : "Create New Category"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <Tabs defaultValue="basic" className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="attributes">Attributes</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 py-2 pr-3">
              <TabsContent value="basic" className="space-y-4 mt-4 px-1">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <ScrollArea>
                    <CardContent className="space-y-3 p-4 pt-0">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="display_name">
                            Display Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="display_name"
                            value={formData.display_name}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                display_name: e.target.value,
                              }))
                            }
                            placeholder="Enter display name"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="name">Slug</Label>
                          <Input
                            id="name"
                            value={formData.slug}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                slug: e.target.value,
                              }))
                            }
                            placeholder="Auto-generated from display name"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Enter category description"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="parent_id">Parent Category</Label>
                          <Select
                            value={formData.parent_id || "none"}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                parent_id: value === "none" ? "" : value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select parent category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                No Parent (Root Category)
                              </SelectItem>
                              {filteredCategories.map((cat) => (
                                <SelectItem key={cat._id} value={cat._id}>
                                  {cat.display_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="sort_order">Sort Order</Label>
                          <Input
                            id="sort_order"
                            type="number"
                            min="1"
                            value={formData.sort_order}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                sort_order: Number(e.target.value),
                              }))
                            }
                            placeholder="1"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label>Category Image</Label>
                        <div className="flex flex-col gap-3">
                          <ImageUpload
                            // type="standard"
                            value={selectedImages}
                            onSelectFiles={handleImageSelect}
                            onRemove={handleImageRemove}
                            disabled={isSubmitting}
                            multiple={false}
                            showPreview={true}
                            showLocalPreview={true}
                          />
                          {formData.image_url &&
                            selectedImages.length === 0 && (
                              <div className="flex flex-col gap-2">
                                <p className="text-xs text-muted-foreground">
                                  Current image:
                                </p>
                                <div className="flex items-center gap-3">
                                  <img
                                    src={formData.image_url}
                                    alt="Current category image"
                                    className="h-16 w-16 rounded object-cover border"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleImageRemove}
                                  >
                                    Remove Image
                                  </Button>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="is_active">Active Status</Label>
                            <p className="text-xs text-muted-foreground">
                              Make this category visible to customers
                            </p>
                          </div>
                          <Switch
                            id="is_active"
                            checked={formData.is_active}
                            onCheckedChange={(checked) =>
                              setFormData((prev) => ({
                                ...prev,
                                is_active: checked,
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="is_primary">Primary Category</Label>
                            <p className="text-xs text-muted-foreground">
                              Mark as a main category
                            </p>
                          </div>
                          <Switch
                            id="is_primary"
                            checked={formData.is_primary}
                            onCheckedChange={(checked) =>
                              setFormData((prev) => ({
                                ...prev,
                                is_primary: checked,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </ScrollArea>
                </Card>
              </TabsContent>

              <TabsContent value="filters" className="space-y-4 mt-4 px-1">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">
                      Category Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4 pt-0">
                    {formData.filters.length > 0 ? (
                      <div className="space-y-2">
                        {formData.filters.map((filter, index) => (
                          <div key={index} className="border rounded p-3">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-sm">
                                {filter.name}
                              </h4>
                              <div className="flex items-center gap-1">
                                <Badge
                                  variant="outline"
                                  className="text-xs py-0"
                                >
                                  {filter.type}
                                </Badge>
                                {filter.is_required && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs py-0"
                                  >
                                    Required
                                  </Badge>
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleRemoveFilter(index)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            {filter.options.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {filter.options.map((option, optIndex) => (
                                  <Badge
                                    key={optIndex}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {option}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No filters added yet
                      </p>
                    )}

                    <Separator className="my-3" />

                    <div className="space-y-3 border rounded p-3 bg-muted/50">
                      <h4 className="font-medium text-sm">Add New Filter</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Filter Name</Label>
                          <Input
                            value={newFilter.name}
                            onChange={(e) =>
                              setNewFilter((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder="e.g., Color, Size"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Filter Type</Label>
                          <Select
                            value={newFilter.type}
                            onValueChange={(value) =>
                              setNewFilter((prev) => ({
                                ...prev,
                                type: value as iFilterOption["type"]
                              }))
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="select">Select</SelectItem>
                              <SelectItem value="multiselect">
                                Multi-Select
                              </SelectItem>
                              <SelectItem value="range">Range</SelectItem>
                              <SelectItem value="boolean">Boolean</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {(newFilter.type === "select" ||
                        newFilter.type === "multiselect") && (
                          <div className="space-y-1">
                            <Label className="text-xs">Filter Options</Label>
                            <div className="flex gap-1">
                              <Input
                                value={newFilterOption}
                                onChange={(e) =>
                                  setNewFilterOption(e.target.value)
                                }
                                placeholder="Add option"
                                className="h-8 text-sm"
                                onKeyDown={(e) =>
                                  e.key === "Enter" &&
                                  (e.preventDefault(), handleAddFilterOption())
                                }
                              />
                              <Button
                                type="button"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handleAddFilterOption}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            {newFilter.options.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {newFilter.options.map((option, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs cursor-pointer px-1.5 py-0"
                                  >
                                    <span className="max-w-[80px] truncate">
                                      {option}
                                    </span>
                                    <X
                                      className="h-3 w-3 ml-1"
                                      onClick={() =>
                                        handleRemoveFilterOption(option)
                                      }
                                    />
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={newFilter.is_required}
                            onCheckedChange={(checked) =>
                              setNewFilter((prev) => ({
                                ...prev,
                                is_required: checked,
                              }))
                            }
                            className="h-4 w-7"
                          />
                          <Label className="text-xs">Required Filter</Label>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          className="h-8"
                          onClick={handleAddFilter}
                          disabled={!newFilter.name.trim()}
                        >
                          Add Filter
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attributes" className="space-y-4 mt-4 px-1">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">
                      Category Attributes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4 pt-0">
                    {formData.attributes.length > 0 ? (
                      <div className="space-y-2">
                        {formData.attributes.map((attribute, index) => (
                          <div key={index} className="border rounded p-3">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-sm">
                                {attribute.name}
                              </h4>
                              <div className="flex items-center gap-1">
                                <Badge
                                  variant="outline"
                                  className="text-xs py-0"
                                >
                                  {attribute.type}
                                </Badge>
                                {attribute.is_required && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs py-0"
                                  >
                                    Required
                                  </Badge>
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleRemoveAttribute(index)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            {attribute.default_value && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Default: {attribute.default_value}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No attributes added yet
                      </p>
                    )}

                    <Separator className="my-3" />

                    <div className="space-y-3 border rounded p-3 bg-muted/50">
                      <h4 className="font-medium text-sm">Add New Attribute</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Attribute Name</Label>
                          <Input
                            value={newAttribute.name}
                            onChange={(e) =>
                              setNewAttribute((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder="e.g., Brand, Material"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Attribute Type</Label>
                          <Select
                            value={newAttribute.type}
                            onValueChange={(value) =>
                              setNewAttribute((prev) => ({
                                ...prev,
                                type: value,
                              }))
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="boolean">Boolean</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="url">URL</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">
                          Default Value (Optional)
                        </Label>
                        <Input
                          value={newAttribute.default_value || ""}
                          onChange={(e) =>
                            setNewAttribute((prev) => ({
                              ...prev,
                              default_value: e.target.value,
                            }))
                          }
                          placeholder="Enter default value"
                          className="h-8 text-sm"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={newAttribute.is_required}
                            onCheckedChange={(checked) =>
                              setNewAttribute((prev) => ({
                                ...prev,
                                is_required: checked,
                              }))
                            }
                            className="h-4 w-7"
                          />
                          <Label className="text-xs">Required Attribute</Label>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          className="h-8"
                          onClick={handleAddAttribute}
                          disabled={!newAttribute.name.trim()}
                        >
                          Add Attribute
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </ScrollArea>

            <div className="flex justify-end gap-2 pt-4 border-t mt-2 px-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || loading}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                )}
                {isSubmitting
                  ? "Saving..."
                  : category
                    ? "Update Category"
                    : "Create Category"}
              </Button>
            </div>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  );
}