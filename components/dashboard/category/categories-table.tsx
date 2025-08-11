"use client"

import React, { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Plus,
    Calendar,
    Package,
    Tag,
    CheckCircle,
    XCircle,
    Folder,
    FolderOpen,
} from "lucide-react"
import { formatRelativeTime, truncateText } from "@/lib/utils"
import { useCategoryStore } from "@/store/categoryStore"
import { toast } from "sonner"

interface Category {
    _id: string
    display_name: string
    description?: string
    is_active: boolean
    is_primary: boolean
    parent_id?: string
    subcategories: Category[]
    product_count?: number
    createdAt: string
    updatedAt: string
    img_url?: string
}

interface CategoriesTableProps {
    categories: Category[]
    isLoading: boolean
    onView?: (category: Category) => void
    onEdit?: (category: Category) => void
    onDelete?: (category: Category[]) => void
    onAddProduct?: (category: Category) => void
    onAddSubcategory?: (category: Category) => void
}

export function CategoriesTable({
    categories,
    isLoading,
    onView,
    onEdit,
    onDelete,
    onAddProduct,
    onAddSubcategory,
}: CategoriesTableProps) {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [expandedCategories, setExpandedCategories] = useState<string[]>([])
    const { deleteCategory, toggleCategoryStatus } = useCategoryStore();
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedCategories(categories.map((category) => category._id))
        } else {
            setSelectedCategories([])
        }
    }

    const handleSelectCategory = (categoryId: string, checked: boolean) => {
        if (checked) {
            setSelectedCategories((prev) => [...prev, categoryId])
        } else {
            setSelectedCategories((prev) => prev.filter((id) => id !== categoryId))
        }
    }

    const toggleExpanded = (categoryId: string) => {
        setExpandedCategories((prev) =>
            prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
        )
    }

    const getStatusBadge = (isActive: boolean) => {
        return (
            <Badge
                variant="secondary"
                className={`${isActive ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"} border-0 font-medium flex items-center gap-1`}
            >
                {isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                {isActive ? "Active" : "Inactive"}
            </Badge>
        )
    }

    const handleDelete = async (
        id: string,
        name?: string,
        skipConfirm?: boolean
    ) => {
        if (!skipConfirm) {
            const confirmed = confirm(`Are you sure you want to delete the category "${name}"?`);
            if (!confirmed) return;
        }

        try {
            await deleteCategory(id);
            if (!skipConfirm) toast.success("Category deleted successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete category");
        }
    };

    const handleMultipleDelete = async () => {
        if (selectedCategories.length === 0) return;

        try {
            await Promise.all(selectedCategories.map(id => handleDelete(id, "", true)));
            toast.success(`Deleted ${selectedCategories.length} categories`);
            setSelectedCategories([]);
        } catch (error: any) {
            toast.error(error.message || "Failed to delete categories");
        }
    };
    const handleChangeStatus = async (
        id: string,
        status: boolean,
        skipConfirm?: boolean
    ) => {
        if (!skipConfirm) {
            const confirmed = confirm(`Are you sure you want to change the category status?`);
            if (!confirmed) return;
        }

        try {
            console.log("status", status);

            await toggleCategoryStatus(id, status);
            if (!skipConfirm) toast.success("Category status change successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to change category status");
        }
    };

    const handleMultipleStatus = async (status: boolean) => {
        if (selectedCategories.length === 0) return;

        try {
            await Promise.all(selectedCategories.map(id => handleChangeStatus(id, status, true)));
            toast.success(`Deleted ${selectedCategories.length} categories`);
            setSelectedCategories([]);
        } catch (error: any) {
            toast.error(error.message || "Failed to chaneg categories status");
        }
    };

    const renderCategoryRow = (category: Category, level = 0) => {
        const isExpanded = expandedCategories.includes(category._id)
        const hasSubcategories = category.subcategories && category.subcategories.length > 0

        return (
            <React.Fragment key={category._id}>
                <TableRow className="hover:bg-muted/50  border-b border-gray-600">
                    <TableCell>
                        <input
                            type="checkbox"
                            checked={selectedCategories.includes(category._id)}
                            onChange={(e) => handleSelectCategory(category._id, e.target.checked)}
                            className="rounded border-gray-600"
                        />
                    </TableCell>

                    <TableCell>
                        <div className="flex items-center space-x-3" style={{ paddingLeft: `${level * 20}px` }}>
                            {hasSubcategories && (
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleExpanded(category._id)}>
                                    {isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
                                </Button>
                            )}

                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                                {category.img_url ? (
                                    <img
                                        src={category.img_url || "/placeholder.svg"}
                                        alt={category.display_name}
                                        className="h-10 w-10 object-cover"
                                    />
                                ) : (
                                    <Tag className="h-5 w-5 text-muted-foreground" />
                                )}
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium leading-none">{category.display_name}</p>
                                    {category.is_primary && (
                                        <Badge variant="outline" className="text-xs px-1 py-0">
                                            Primary
                                        </Badge>
                                    )}
                                </div>
                                {category.description && (
                                    <p className="text-xs text-muted-foreground">{truncateText(category.description, 50)}</p>
                                )}
                            </div>
                        </div>
                    </TableCell>

                    <TableCell>{getStatusBadge(category.is_active)}</TableCell>

                    <TableCell>
                        <div className="flex items-center">
                            <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="font-medium">{category.product_count || 0}</span>
                        </div>
                    </TableCell>

                    <TableCell>
                        <div className="flex items-center">
                            <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="font-medium">{category.subcategories?.length || 0}</span>
                        </div>
                    </TableCell>

                    <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-2" />
                            <span>{formatRelativeTime(category.createdAt)}</span>
                        </div>
                    </TableCell>

                    <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                {onView && (
                                    <DropdownMenuItem onClick={() => onView(category)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                    </DropdownMenuItem>
                                )}

                                {onEdit && (
                                    <DropdownMenuItem onClick={() => onEdit(category)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Category
                                    </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator />

                                {onAddProduct && (
                                    <DropdownMenuItem onClick={() => onAddProduct(category)}>
                                        <Package className="mr-2 h-4 w-4" />
                                        Add Products
                                    </DropdownMenuItem>
                                )}

                                {onAddSubcategory && (
                                    <DropdownMenuItem onClick={() => onAddSubcategory(category)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Subcategory
                                    </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator />


                                <DropdownMenuItem
                                    // onClick={() => onDelete(category)}
                                    onClick={() =>
                                        handleDelete(category._id, category.display_name)
                                    }
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Category
                                </DropdownMenuItem>

                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>

                {/* Render subcategories if expanded */}
                {isExpanded &&
                    hasSubcategories &&
                    category.subcategories.map((subcategory) => renderCategoryRow(subcategory, level + 1))}
            </React.Fragment>
        )
    }



    if (isLoading) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                                <Skeleton className="h-4 w-4" />
                            </TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead>Subcategories</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <Skeleton className="h-4 w-4" />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-3">
                                        <Skeleton className="h-10 w-10 rounded" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-6 w-16" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-8" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-8" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-20" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-8 w-8" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }

    if (categories.length === 0) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead>Subcategories</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                                <div className="flex flex-col items-center space-y-2">
                                    <Tag className="h-8 w-8 text-muted-foreground" />
                                    <p className="text-muted-foreground">No categories found</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        )
    }



    return (
        <div className="rounded-md border border-gray-600">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-gray-600 ">
                        <TableHead className="w-12 ">
                            <input
                                type="checkbox"
                                checked={selectedCategories.length === categories.length}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                                className="rounded border-gray-600"
                            />
                        </TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>Subcategories</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-12"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>{categories.map((category) => renderCategoryRow(category))}</TableBody>
            </Table>

            {/* Bulk Actions */}
            {selectedCategories.length > 0 && (
                <div className="border-t bg-muted/50 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {selectedCategories.length} categor{selectedCategories.length > 1 ? "ies" : "y"} selected
                        </p>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                                Export Selected
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleMultipleStatus(true)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activate Selected
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleMultipleStatus(false)}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Deactivate Selected
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleMultipleDelete}>
                                Delete Selected
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
