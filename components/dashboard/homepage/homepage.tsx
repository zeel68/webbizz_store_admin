"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Edit, Trash2, ImageIcon, ExternalLink, Loader2, Images } from 'lucide-react'
import { useHomepageStore } from "@/store/homepageStore"
import ImageUpload from "@/components/shared/image-upload"


interface HeroSlideFormData {
    title: string
    subtitle: string
    link: string
    display_order: number
    is_active: boolean
}

export function HeroSlidesManager() {
    const { heroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide, loading } = useHomepageStore()

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingSlide, setEditingSlide] = useState<iHeroSlide | null>(null)
    const [selectedImages, setSelectedImages] = useState<File[]>([])
    const [formData, setFormData] = useState<HeroSlideFormData>({
        title: "",
        subtitle: "",
        link: "",
        display_order: 1,
        is_active: true,
    })

    const handleOpenDialog = (slide?: iHeroSlide) => {
        if (slide) {
            setEditingSlide(slide)
            setFormData({
                title: slide.title,
                subtitle: slide.subtitle || "",
                link: slide.link || "",
                display_order: slide.display_order,
                is_active: slide.is_active,
            })
        } else {
            setEditingSlide(null)
            setFormData({
                title: "",
                subtitle: "",
                link: "",
                display_order: heroSlides.length + 1,
                is_active: true,
            })
        }
        setSelectedImages([])
        setIsDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setEditingSlide(null)
        setSelectedImages([])
    }
    const uploadToCloudinary = async (file: File): Promise<string> => {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        formDataUpload.append(
            "upload_preset",
            process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "BizzWeb",
        );
        formDataUpload.append("folder", "ecommerce_uploads/heroslides");

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/₹{process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
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
        e.preventDefault()

        if (!formData.title.trim()) {
            toast.error("Title is required")
            return
        }

        if (!editingSlide && selectedImages.length === 0) {
            toast.error("Please select an image")
            return
        }

        try {
            let submitData = {} as iHeroSlideForm
            submitData.title = formData.title;
            submitData.display_order = formData.display_order
            submitData.link = formData.link
            submitData.subtitle = formData.subtitle

            // submitData.append('subtitle', formData.subtitle)
            // submitData.append('link', formData.link)
            // submitData.append('display_order', formData.display_order.toString())
            // submitData.append('is_active', formData.is_active.toString())

            // if (selectedImages.length > 0) {
            //     submitData.image = await uploadToCloudinary(selectedImages[0])
            //     // submitData.append('image', selectedImages[0])
            // }
            // submitData.image = "https://res.cloudinary.com/dvgpflfpc/image/upload/v1754479203/ecommerce_uploads/heroslides/aj0kycuboyvurr970elm.png"
            if (selectedImages.length > 0) {
                toast.info("Uploading category image...");
                let image = await uploadToCloudinary(selectedImages[0]);
                toast.success("Image uploaded successfully");
                submitData.image = image
            }

            if (editingSlide) {
                console.log(submitData);

                await updateHeroSlide(editingSlide._id, submitData)
                toast.success("Hero slide updated successfully")
            } else {
                console.log(submitData);

                await createHeroSlide(submitData)
                toast.success("Hero slide created successfully")
            }

            handleCloseDialog()
        } catch (error: any) {
            toast.error(error.message || "Failed to save hero slide")
        }
    }

    const handleDelete = async (slideId: string) => {
        if (confirm("Are you sure you want to delete this hero slide?")) {
            try {
                await deleteHeroSlide(slideId)
                toast.success("Hero slide deleted successfully")
            } catch (error: any) {
                toast.error(error.message || "Failed to delete hero slide")
            }
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Hero Slides</h3>
                <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Hero Slide
                </Button>
            </div>

            {heroSlides.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                        <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center">
                            No hero slides found. Create your first hero slide to get started.
                        </p>
                        <Button onClick={() => handleOpenDialog()} className="mt-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Hero Slide
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {heroSlides
                        .sort((a, b) => a.display_order - b.display_order)
                        .map((slide) => (
                            <Card key={slide._id} className="overflow-hidden">
                                <div className="aspect-video relative">
                                    <img
                                        src={slide.image_url || "/placeholder.svg"}
                                        alt={slide.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <Badge variant={slide.is_active ? "default" : "secondary"}>
                                            {slide.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                        <Badge variant="outline">
                                            #{slide.display_order}
                                        </Badge>
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <h4 className="font-medium truncate">{slide.title}</h4>
                                    {slide.subtitle && (
                                        <p className="text-sm text-muted-foreground truncate mt-1">
                                            {slide.subtitle}
                                        </p>
                                    )}
                                    {slide.link && (
                                        <div className="flex items-center gap-1 mt-2">
                                            <ExternalLink className="h-3 w-3" />
                                            <span className="text-xs text-muted-foreground truncate">
                                                {slide.link}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 mt-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleOpenDialog(slide)}
                                        >
                                            <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(slide._id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                </div>
            )}

            {/* Hero Slide Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingSlide ? "Edit Hero Slide" : "Create Hero Slide"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter slide title"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subtitle">Subtitle</Label>
                            <Textarea
                                id="subtitle"
                                value={formData.subtitle}
                                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                                placeholder="Enter slide subtitle"
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="link">Link URL</Label>
                            <Input
                                id="link"
                                type="text"
                                value={formData.link}
                                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                                placeholder="https://example.com"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                            <div className="flex items-center space-x-2 pt-6">
                                <Switch
                                    id="is_active"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                                />
                                <Label htmlFor="is_active">Active</Label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Slide Image {!editingSlide && "*"}</Label>
                            <ImageUpload
                                onSelectFiles={(files) => setSelectedImages(files)}
                                onRemove={() => setSelectedImages([])}
                                value={selectedImages}
                                multiple={false}
                                showPreview={true}
                                showLocalPreview={true}
                            />
                            {editingSlide && editingSlide.image_url && selectedImages.length === 0 && (
                                <div className="mt-2">
                                    <p className="text-sm text-muted-foreground mb-2">Current image:</p>
                                    <img
                                        src={editingSlide.image_url || "/placeholder.svg"}
                                        alt="Current slide"
                                        className="w-32 h-20 object-cover rounded border"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingSlide ? "Update" : "Create"} Slide
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
