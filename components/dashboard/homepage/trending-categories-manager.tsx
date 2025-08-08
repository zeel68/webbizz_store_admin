"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Loader2, Star } from 'lucide-react'
import { useHomepageStore } from "@/store/homepageStore"
import { useCategoryStore } from "@/store/categoryStore"


interface TrendingCategoryFormData {
    category_id: string
    display_order: number
}

export function TrendingCategoriesManager() {
    const {
        trendingCategories,
        addTrendingCategory,
        updateTrendingCategory,
        removeTrendingCategory,
        loading
    } = useHomepageStore()
    const { categories, fetchCategories } = useCategoryStore()

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<iTrendingCategory | null>(null)
    const [formData, setFormData] = useState<TrendingCategoryFormData>({
        category_id: "",
        display_order: 1,
    })

    useEffect(() => {
        if (categories.length === 0) {
            fetchCategories()
        }
    }, [categories.length, fetchCategories])

    const availableCategories = categories.filter(category =>
        !trendingCategories.some(trending => trending.category_id === category._id)
    )

    const handleOpenDialog = (trendingCategory?: iTrendingCategory) => {
        if (trendingCategory) {
            setEditingCategory(trendingCategory)
            setFormData({
                category_id: trendingCategory.category_id,
                display_order: trendingCategory.display_order,
            })
        } else {
            setEditingCategory(null)
            setFormData({
                category_id: "",
                display_order: trendingCategories.length + 1,
            })
        }
        setIsDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setEditingCategory(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.category_id) {
            toast.error("Please select a category")
            return
        }

        try {
            if (editingCategory) {
                await updateTrendingCategory(
                    editingCategory._id,

                    formData.display_order,
                )
                toast.success("Trending category updated successfully")
            } else {
                await addTrendingCategory(
                    formData.category_id,
                    formData.display_order,
                )
                toast.success("Trending category added successfully")
            }

            handleCloseDialog()
        } catch (error: any) {
            toast.error(error.message || "Failed to save trending category")
        }
    }

    const handleDelete = async (trendingId: string) => {
        if (confirm("Are you sure you want to remove this trending category?")) {
            try {
                await removeTrendingCategory(trendingId)
                toast.success("Trending category removed successfully")
            } catch (error: any) {
                toast.error(error.message || "Failed to remove trending category")
            }
        }
    }

    const getCategoryInfo = (categoryId: string) => {
        return categories.find(cat => cat._id === categoryId)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Trending Categories</h3>
                <Button
                    onClick={() => handleOpenDialog()}
                    className="flex items-center gap-2"
                    disabled={availableCategories.length === 0}
                >
                    <Plus className="h-4 w-4" />
                    Add Trending Category
                </Button>
            </div>

            {availableCategories.length === 0 && trendingCategories.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                        <Star className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center">
                            No categories available. Create categories first to feature them as trending.
                        </p>
                    </CardContent>
                </Card>
            )}

            {trendingCategories.length === 0 && availableCategories.length > 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                        <Star className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center">
                            No trending categories set. Add categories to feature on your homepage.
                        </p>
                        <Button onClick={() => handleOpenDialog()} className="mt-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Trending Category
                        </Button>
                    </CardContent>
                </Card>
            )}

            {trendingCategories.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trendingCategories
                        .sort((a, b) => a.display_order - b.display_order)
                        .map((trendingCategory) => {
                            const categoryInfo = getCategoryInfo(trendingCategory.category_id)
                            return (
                                <Card key={trendingCategory._id} className="overflow-hidden">
                                    <div className="aspect-video relative">
                                        <img
                                            src={categoryInfo?.img_url || "/placeholder.svg"}
                                            alt={categoryInfo?.display_name || "Category"}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 right-2">
                                            <Badge variant="outline">
                                                #{trendingCategory.display_order}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <h4 className="font-medium truncate">
                                            {categoryInfo?.display_name || "Unknown Category"}
                                        </h4>
                                        {categoryInfo?.description && (
                                            <p className="text-sm text-muted-foreground truncate mt-1">
                                                {categoryInfo.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenDialog(trendingCategory)}
                                            >
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(trendingCategory._id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                </div>
            )}

            {/* Trending Category Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? "Edit Trending Category" : "Add Trending Category"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="category_id">Category *</Label>
                            <Select
                                value={formData.category_id}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {editingCategory && (
                                        <SelectItem value={editingCategory.category_id}>
                                            {getCategoryInfo(editingCategory.category_id)?.display_name || "Current Category"}
                                        </SelectItem>
                                    )}
                                    {availableCategories.map((category) => (
                                        <SelectItem key={category._id} value={category._id}>
                                            {category.display_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

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

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingCategory ? "Update" : "Add"} Category
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
