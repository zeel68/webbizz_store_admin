"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Loader2, MessageSquare, User } from 'lucide-react'
import { useHomepageStore } from "@/store/homepageStore"
import ImageUpload from "@/components/shared/image-upload"

interface TestimonialFormData {
    name: string
    message: string
}

export function TestimonialsManager() {
    const { testimonials, createTestimonial, updateTestimonial, deleteTestimonial, loading } = useHomepageStore()

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingTestimonial, setEditingTestimonial] = useState<iTestimonial | null>(null)
    const [selectedImages, setSelectedImages] = useState<File[]>([])
    const [formData, setFormData] = useState<TestimonialFormData>({
        name: "",
        message: "",
    })

    const handleOpenDialog = (testimonial?: iTestimonial) => {
        if (testimonial) {
            setEditingTestimonial(testimonial)
            setFormData({
                name: testimonial.name,
                message: testimonial.message,
            })
        } else {
            setEditingTestimonial(null)
            setFormData({
                name: "",
                message: "",
            })
        }
        setSelectedImages([])
        setIsDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setEditingTestimonial(null)
        setSelectedImages([])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim() || !formData.message.trim()) {
            toast.error("Name and message are required")
            return
        }

        try {
            const submitData = new FormData()
            submitData.append('name', formData.name)
            submitData.append('message', formData.message)

            if (selectedImages.length > 0) {
                submitData.append('photo', selectedImages[0])
            }

            if (editingTestimonial) {
                await updateTestimonial(editingTestimonial._id, submitData as any)
                toast.success("Testimonial updated successfully")
            } else {
                await createTestimonial(submitData as any)
                toast.success("Testimonial created successfully")
            }

            handleCloseDialog()
        } catch (error: any) {
            toast.error(error.message || "Failed to save testimonial")
        }
    }

    const handleDelete = async (testimonialId: string) => {
        if (confirm("Are you sure you want to delete this testimonial?")) {
            try {
                await deleteTestimonial(testimonialId)
                toast.success("Testimonial deleted successfully")
            } catch (error: any) {
                toast.error(error.message || "Failed to delete testimonial")
            }
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Customer Testimonials</h3>
                <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Testimonial
                </Button>
            </div>

            {testimonials.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center">
                            No testimonials found. Add customer testimonials to build trust.
                        </p>
                        <Button onClick={() => handleOpenDialog()} className="mt-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Testimonial
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {testimonials.map((testimonial) => (
                        <Card key={testimonial._id}>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <Avatar className="w-12 h-12">
                                        <AvatarImage src={testimonial.photo_url || "/placeholder.svg"} alt={testimonial.name} />
                                        <AvatarFallback>
                                            <User className="h-6 w-6" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium">{testimonial.name}</h4>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleOpenDialog(testimonial)}
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(testimonial._id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            "{testimonial.message}"
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {new Date(testimonial.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Testimonial Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Customer Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter customer name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Testimonial Message *</Label>
                            <Textarea
                                id="message"
                                value={formData.message}
                                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="Enter customer testimonial"
                                rows={4}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Customer Photo (Optional)</Label>
                            <ImageUpload
                                onSelectFiles={(files) => setSelectedImages(files)}
                                onRemove={() => setSelectedImages([])}
                                value={selectedImages}
                                multiple={false}
                                showPreview={true}
                                type="profile"
                                showLocalPreview={true}
                            />
                            {editingTestimonial && editingTestimonial.photo_url && selectedImages.length === 0 && (
                                <div className="mt-2">
                                    <p className="text-sm text-muted-foreground mb-2">Current photo:</p>
                                    <Avatar className="w-16 h-16">
                                        <AvatarImage src={editingTestimonial.photo_url || "/placeholder.svg"} alt={editingTestimonial.name} />
                                        <AvatarFallback>
                                            <User className="h-8 w-8" />
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingTestimonial ? "Update" : "Create"} Testimonial
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
