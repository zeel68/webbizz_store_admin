"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Search, Package, Plus, Loader2, Filter, X, DollarSign, Tag } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useProductStore } from "@/store/productStore";
import { useCategoryStore } from "@/store/categoryStore";


interface AddProductsToCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: iStoreCategory | null;
    onProductsAdded?: () => void;
}

export function AddProductsToCategoryDialog({
    open,
    onOpenChange,
    category,
    onProductsAdded,
}: AddProductsToCategoryDialogProps) {
    const { productInfo, fetchProducts, assignProductsToCategory, loading } = useProductStore();
    const { categories } = useCategoryStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterCategory, setFilterCategory] = useState<string>("unassigned");
    const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({
        min: "",
        max: "",
    });

    // Fetch products when dialog opens
    useEffect(() => {
        if (open) {
            fetchProducts({
                search: searchTerm,
                limit: 100,
            });
            console.log(productInfo);

        }
    }, [open, fetchProducts]);
    const filteredProducts = productInfo?.products ?? []
    // Filter products based on criteria
    // const filteredProducts = productInfo?.products?.filter((product) => {
    //     // Search filter
    //     const matchesSearch =
    //         product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //         product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //         product.brand?.toLowerCase().includes(searchTerm.toLowerCase());

    //     // Status filter
    //     const matchesStatus =
    //         filterStatus === "all" ||
    //         (filterStatus === "active" && product.is_active) ||
    //         (filterStatus === "inactive" && !product.is_active) ||
    //         (filterStatus === "featured" && product.is_featured);

    //     // Category filter
    //     const matchesCategory =
    //         filterCategory === "all" ||
    //         (filterCategory === "unassigned" && !product.store_category_id) ||
    //         (filterCategory === "assigned" && product.store_category_id) ||
    //         product.store_category_id === filterCategory;

    //     // Price range filter
    //     const matchesPrice =
    //         (!priceRange.min || product.price >= parseFloat(priceRange.min)) &&
    //         (!priceRange.max || product.price <= parseFloat(priceRange.max));

    //     // Exclude products already in this category
    //     const notInCategory = product.store_category_id !== category?._id;

    //     return (
    //         matchesSearch &&
    //         matchesStatus &&
    //         matchesCategory &&
    //         matchesPrice &&
    //         notInCategory
    //     );
    // }) || [];

    console.log(productInfo?.products);


    const handleProductToggle = (productId: string) => {
        console.log(productId);

        setSelectedProducts((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        );
        console.log(selectedProducts);

    };

    const handleSelectAll = () => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(filteredProducts.map((p) => p._id));
        }
    };

    const handleAssignProducts = async () => {
        if (!category || selectedProducts.length === 0) return;

        setIsSubmitting(true);
        try {
            // Assign each selected product to the category
            // const promises = selectedProducts.map((productId) =>
            //     assignProductsToCategory(productId, category._id)
            // );
            console.log(selectedProducts);
            console.log("cat", category);
            const id = category;

            await assignProductsToCategory(selectedProducts, category as any)

            // await Promise.all(promises);

            toast.success(
                `₹{selectedProducts.length} product(s) added to ₹{category.display_name}`
            );

            // Clear selection and close dialog
            setSelectedProducts([]);
            onProductsAdded?.();
            onOpenChange(false);

            // Refresh products
            fetchProducts({ limit: 100 });
        } catch (error: any) {
            toast.error(error.message || "Failed to assign products");
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFilterStatus("all");
        setFilterCategory("unassigned");
        setPriceRange({ min: "", max: "" });
    };

    const hasActiveFilters =
        searchTerm ||
        filterStatus !== "all" ||
        filterCategory !== "unassigned" ||
        priceRange.min ||
        priceRange.max;

    const ProductCard = ({
        product,
        isSelected,
        onToggle,
    }: {
        product: iProduct;
        isSelected: boolean;
        onToggle: (productId: string) => void;
    }) => (
        <Card
            className={`transition-all cursor-pointer hover:shadow-md ₹{isSelected ? "ring-2 ring-primary" : ""
                }`}
            onClick={() => onToggle(product._id)}
        >
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <Checkbox checked={isSelected} onChange={() => onToggle(product._id)} />

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                            {product.images && product.images.length > 0 ? (
                                <img
                                    src={product.images[0] || "/placeholder.svg"}
                                    alt={product.name}
                                    className="w-16 h-16 rounded object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                    <Package className="h-8 w-8 text-muted-foreground" />
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate mb-1">
                                    {product.name}
                                </h4>
                                <p className="text-xs text-muted-foreground truncate mb-2">
                                    {product.brand && `₹{product.brand} • `}
                                    SKU: {product.sku || "N/A"}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs">
                                        <DollarSign className="h-3 w-3 mr-1" />
                                        {product.price}
                                    </Badge>
                                    <Badge
                                        variant={
                                            product.stock?.quantity && product.stock.quantity > 0
                                                ? "default"
                                                : "destructive"
                                        }
                                        className="text-xs"
                                    >
                                        Stock: {product.stock?.quantity || 0}
                                    </Badge>
                                    {product.is_featured && (
                                        <Badge variant="secondary" className="text-xs">
                                            Featured
                                        </Badge>
                                    )}
                                    {!product.is_active && (
                                        <Badge variant="outline" className="text-xs">
                                            Inactive
                                        </Badge>
                                    )}
                                </div>
                                {product.store_category_id && (
                                    <div className="mt-2">
                                        <Badge variant="outline" className="text-xs">
                                            <Tag className="h-3 w-3 mr-1" />
                                            {categories.find((c) => c._id === product.store_category_id)
                                                ?.display_name || "Unknown Category"}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (!category) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Add Products to {category.display_name}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col h-full">
                    {/* Search and Filters */}
                    <div className="space-y-4 pb-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search products by name, SKU, or brand..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Products</SelectItem>
                                    <SelectItem value="active">Active Only</SelectItem>
                                    <SelectItem value="inactive">Inactive Only</SelectItem>
                                    <SelectItem value="featured">Featured Only</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    <SelectItem value="assigned">Assigned</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat._id} value={cat._id}>
                                            {cat.display_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input
                                placeholder="Min price"
                                type="number"
                                value={priceRange.min}
                                onChange={(e) =>
                                    setPriceRange((prev) => ({ ...prev, min: e.target.value }))
                                }
                            />

                            <Input
                                placeholder="Max price"
                                type="number"
                                value={priceRange.max}
                                onChange={(e) =>
                                    setPriceRange((prev) => ({ ...prev, max: e.target.value }))
                                }
                            />
                        </div>

                        {/* Active Filters & Controls */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {filteredProducts.length > 0 && (
                                    <>
                                        <Checkbox
                                            checked={selectedProducts.length === filteredProducts.length}
                                            onCheckedChange={handleSelectAll}
                                        />
                                        <span className="text-sm">
                                            Select All ({filteredProducts.length})
                                        </span>
                                    </>
                                )}
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="h-8"
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                            <Badge variant="outline">
                                {selectedProducts.length} selected
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    {/* Products List */}
                    <ScrollArea className="flex-1 py-4">
                        <div className="space-y-4">
                            {loading && (
                                <div className="text-center py-8">
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">Loading products...</p>
                                </div>
                            )}

                            {!loading && filteredProducts.length === 0 && (
                                <div className="text-center py-8">
                                    <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No products found</h3>
                                    <p className="text-muted-foreground">
                                        {hasActiveFilters
                                            ? "Try adjusting your filters"
                                            : "No products available to add to this category"}
                                    </p>
                                </div>
                            )}

                            {!loading && filteredProducts.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredProducts.map((product) => (
                                        <ProductCard
                                            key={product._id}
                                            product={product}
                                            isSelected={selectedProducts.includes(product._id)}
                                            onToggle={handleProductToggle}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                            {selectedProducts.length > 0 && (
                                <span>
                                    {selectedProducts.length} product(s) selected for assignment
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAssignProducts}
                                disabled={selectedProducts.length === 0 || isSubmitting}
                                className="flex items-center gap-2"
                            >
                                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                <Plus className="h-4 w-4" />
                                Add {selectedProducts.length > 0 ? `₹{selectedProducts.length} ` : ""}
                                Product{selectedProducts.length !== 1 ? "s" : ""}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
