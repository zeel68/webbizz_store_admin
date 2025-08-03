"use client";

import { useState, useEffect } from "react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Edit,
    Plus,
    Package,
    Settings,
    Eye,
    Star,
    DollarSign,
    Tag,
    Filter,
    Grid3X3,
    BarChart3,
    Calendar,
} from "lucide-react";



interface CategoryDetailsDialogProps {
    category: iStoreCategory | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit?: (category: iStoreCategory) => void;
    onAddProduct?: (categoryId: string) => void;
    onAddSubcategory?: (categoryId: string) => void;
}

export function CategoryDetailsDialog({
    category,
    open,
    onOpenChange,
    onEdit,
    onAddProduct,
    onAddSubcategory,
}: CategoryDetailsDialogProps) {

    const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
    const [categoryProducts, setCategoryProducts] = useState<any[]>([]);

    useEffect(() => {
        // if (category && open && productsInfo?.products) {
        //     const filtered = productsInfo.products.filter(
        //         (product) => product.category === category._id,
        //     );
        //     setCategoryProducts(filtered);
        // }
    }, [category, open]);

    if (!category) return null;

    const totalProducts = categoryProducts.length;
    const activeProducts = categoryProducts.filter((p) => p.is_active).length;
    const featuredProducts = categoryProducts.filter((p) => p.is_featured).length;
    const totalValue = categoryProducts.reduce(
        (sum, p) => sum + (p.price * p.stock?.quantity || 0),
        0,
    );
    const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;

    const handleEdit = () => {
        if (onEdit) onEdit(category);
    };

    const handleAddProduct = () => {
        setIsAddProductDialogOpen(true);
    };

    const handleAddSubcategory = () => {
        if (onAddSubcategory) onAddSubcategory(category._id);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
                    <DialogHeader className="flex-shrink-0 pb-4">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            <div className="flex items-start space-x-4">
                                {category.img_url ? (
                                    <img
                                        src={category.img_url || "/placeholder.svg"}
                                        alt={category.display_name}
                                        className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                                    />
                                ) : (
                                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                        <Tag className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <DialogTitle className="text-2xl truncate">
                                        {category.display_name}
                                    </DialogTitle>
                                    <p className="text-muted-foreground mt-1 line-clamp-2">
                                        {category.description || "No description"}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                        <Badge
                                            variant={category.is_active ? "default" : "secondary"}
                                        >
                                            {category.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                        {category.is_primary && (
                                            <Badge
                                                variant="outline"
                                                className="flex items-center gap-1"
                                            >
                                                <Star className="h-3 w-3" />
                                                Primary
                                            </Badge>
                                        )}
                                        <Badge variant="outline">Sort: {category.sort_order}</Badge>
                                        <Badge
                                            variant="outline"
                                            className="flex items-center gap-1"
                                        >
                                            <Calendar className="h-3 w-3" />
                                            {new Date(category.created_at).toLocaleDateString()}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Button variant="outline" onClick={handleEdit} size="sm">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                                <Button onClick={handleAddProduct} size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Product
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleAddSubcategory}
                                    size="sm"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Subcategory
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>

                    <Tabs
                        defaultValue="overview"
                        className="flex flex-col flex-1 overflow-hidden"
                    >
                        <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="products">
                                Products ({totalProducts})
                            </TabsTrigger>
                            <TabsTrigger value="subcategories">
                                Subcategories ({category.subcategories?.length || 0})
                            </TabsTrigger>
                            <TabsTrigger value="configuration">Configuration</TabsTrigger>
                        </TabsList>

                        <div className="flex-1 overflow-hidden">
                            <ScrollArea className="h-full">
                                <div className="p-1">
                                    <TabsContent value="overview" className="space-y-6 mt-4">
                                        {/* Stats Cards */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <Card className="hover:shadow-md transition-shadow">
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-sm font-medium">
                                                        Products
                                                    </CardTitle>
                                                    <Package className="h-4 w-4 text-muted-foreground" />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">
                                                        {totalProducts}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {activeProducts} active • {featuredProducts}{" "}
                                                        featured
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <Card className="hover:shadow-md transition-shadow">
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-sm font-medium">
                                                        Total Value
                                                    </CardTitle>
                                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">
                                                        {formatPrice(totalValue)}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Inventory value
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <Card className="hover:shadow-md transition-shadow">
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-sm font-medium">
                                                        Avg Price
                                                    </CardTitle>
                                                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">
                                                        {formatPrice(avgPrice)}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Average product price
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <Card className="hover:shadow-md transition-shadow">
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-sm font-medium">
                                                        Subcategories
                                                    </CardTitle>
                                                    <Grid3X3 className="h-4 w-4 text-muted-foreground" />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">
                                                        {category.subcategories?.length || 0}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Nested categories
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Category Information */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Eye className="h-5 w-5" />
                                                    Category Information
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="text-sm font-medium text-muted-foreground">
                                                                Created
                                                            </label>
                                                            <p className="text-sm">
                                                                {new Date(
                                                                    category.created_at,
                                                                ).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-muted-foreground">
                                                                Last Updated
                                                            </label>
                                                            <p className="text-sm">
                                                                {new Date(
                                                                    category.updated_at,
                                                                ).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="text-sm font-medium text-muted-foreground">
                                                                Category ID
                                                            </label>
                                                            <p className="text-sm font-mono text-xs">
                                                                {category._id}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-muted-foreground">
                                                                Store ID
                                                            </label>
                                                            <p className="text-sm font-mono text-xs">
                                                                {category.store_id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="text-sm font-medium text-muted-foreground">
                                                                Parent Category
                                                            </label>
                                                            <p className="text-sm">
                                                                {category.parent_id
                                                                    ? "Has parent"
                                                                    : "Root category"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-muted-foreground">
                                                                Configuration
                                                            </label>
                                                            <p className="text-sm">
                                                                {category.config?.filters?.length || 0} filters,{" "}
                                                                {category.config?.attributes?.length || 0}{" "}
                                                                attributes
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="products" className="space-y-4 mt-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-medium">
                                                Products in this category
                                            </h3>
                                            <Button onClick={handleAddProduct} size="sm">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Product
                                            </Button>
                                        </div>

                                        {categoryProducts.length === 0 ? (
                                            <Card>
                                                <CardContent className="flex flex-col items-center justify-center py-12">
                                                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                                    <h3 className="text-lg font-medium mb-2">
                                                        No products in this category
                                                    </h3>
                                                    <p className="text-muted-foreground text-center mb-4">
                                                        Start building your catalog by adding products to
                                                        this category.
                                                    </p>
                                                    <Button onClick={handleAddProduct}>
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Add First Product
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ) : (
                                            <div className="grid gap-4">
                                                {categoryProducts.map((product) => (
                                                    <Card
                                                        key={product._id}
                                                        className="hover:shadow-md transition-shadow"
                                                    >
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-4">
                                                                {product.images && product.images.length > 0 ? (
                                                                    <img
                                                                        src={
                                                                            product.images[0] || "/placeholder.svg"
                                                                        }
                                                                        alt={product.name}
                                                                        className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                                                                    />
                                                                ) : (
                                                                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                                                        <Package className="h-6 w-6 text-muted-foreground" />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <h4 className="font-medium truncate">
                                                                            {product.name}
                                                                        </h4>
                                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                                            <Badge
                                                                                variant={
                                                                                    product.is_active
                                                                                        ? "default"
                                                                                        : "secondary"
                                                                                }
                                                                            >
                                                                                {product.is_active
                                                                                    ? "Active"
                                                                                    : "Inactive"}
                                                                            </Badge>
                                                                            {product.is_featured && (
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className="flex items-center gap-1"
                                                                                >
                                                                                    <Star className="h-3 w-3" />
                                                                                    Featured
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                                        {product.description}
                                                                    </p>
                                                                    <div className="flex items-center space-x-4 text-sm">
                                                                        <span className="font-medium">
                                                                            {formatPrice(product.price)}
                                                                        </span>
                                                                        <span className="text-muted-foreground">
                                                                            Stock: {product.stock?.quantity || 0}
                                                                        </span>
                                                                        <span className="text-muted-foreground">
                                                                            Created:{" "}
                                                                            {new Date(
                                                                                product.createdAt,
                                                                            ).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="subcategories" className="space-y-4 mt-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-medium">Subcategories</h3>
                                            <Button onClick={handleAddSubcategory} size="sm">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Subcategory
                                            </Button>
                                        </div>

                                        {!category.subcategories ||
                                            category.subcategories.length === 0 ? (
                                            <Card>
                                                <CardContent className="flex flex-col items-center justify-center py-12">
                                                    <Grid3X3 className="h-12 w-12 text-muted-foreground mb-4" />
                                                    <h3 className="text-lg font-medium mb-2">
                                                        No subcategories
                                                    </h3>
                                                    <p className="text-muted-foreground text-center mb-4">
                                                        Create subcategories to better organize products
                                                        within this category.
                                                    </p>
                                                    <Button onClick={handleAddSubcategory}>
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Add Subcategory
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ) : (
                                            <div className="grid gap-4">
                                                {category.subcategories.map((subcategory) => (
                                                    <Card
                                                        key={subcategory._id}
                                                        className="hover:shadow-md transition-shadow"
                                                    >
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-4">
                                                                {subcategory.img_url ? (
                                                                    <img
                                                                        src={
                                                                            subcategory.img_url || "/placeholder.svg"
                                                                        }
                                                                        alt={subcategory.display_name}
                                                                        className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                                                                    />
                                                                ) : (
                                                                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                                                        <Tag className="h-6 w-6 text-muted-foreground" />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <h4 className="font-medium truncate">
                                                                            {subcategory.display_name}
                                                                        </h4>
                                                                        <Badge
                                                                            variant={
                                                                                subcategory.is_active
                                                                                    ? "default"
                                                                                    : "secondary"
                                                                            }
                                                                        >
                                                                            {subcategory.is_active
                                                                                ? "Active"
                                                                                : "Inactive"}
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                                                                        {subcategory.description ||
                                                                            "No description"}
                                                                    </p>
                                                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                                        <span>
                                                                            {subcategory.products_count || 0} products
                                                                        </span>
                                                                        <span>
                                                                            Created:{" "}
                                                                            {new Date(
                                                                                subcategory.created_at,
                                                                            ).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="configuration" className="space-y-6 mt-4">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <Filter className="h-5 w-5" />
                                                        Category Filters
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    {category.config?.filters &&
                                                        category.config.filters.length > 0 ? (
                                                        <div className="space-y-4">
                                                            {category.config.filters.map((filter, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="border rounded-lg p-4"
                                                                >
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <h4 className="font-medium">
                                                                            {filter.name}
                                                                        </h4>
                                                                        <div className="flex items-center space-x-2">
                                                                            <Badge variant="outline">
                                                                                {filter.type}
                                                                            </Badge>
                                                                            {filter.is_required && (
                                                                                <Badge variant="secondary">
                                                                                    Required
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {filter.options &&
                                                                        filter.options.length > 0 && (
                                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                                {filter.options.map(
                                                                                    (option, optIndex) => (
                                                                                        <Badge
                                                                                            key={optIndex}
                                                                                            variant="outline"
                                                                                        >
                                                                                            {option}
                                                                                        </Badge>
                                                                                    ),
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-muted-foreground">
                                                            No filters configured for this category.
                                                        </p>
                                                    )}
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <Settings className="h-5 w-5" />
                                                        Category Attributes
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    {category.config?.attributes &&
                                                        category.config.attributes.length > 0 ? (
                                                        <div className="space-y-4">
                                                            {category.config.attributes.map(
                                                                (attribute, index) => (
                                                                    <div
                                                                        key={index}
                                                                        className="border rounded-lg p-4"
                                                                    >
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <h4 className="font-medium">
                                                                                {attribute.name}
                                                                            </h4>
                                                                            <div className="flex items-center space-x-2">
                                                                                <Badge variant="outline">
                                                                                    {attribute.type}
                                                                                </Badge>
                                                                                {attribute.is_required && (
                                                                                    <Badge variant="secondary">
                                                                                        Required
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        {attribute.default_value && (
                                                                            <p className="text-sm text-muted-foreground">
                                                                                Default: {attribute.default_value}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-muted-foreground">
                                                            No attributes configured for this category.
                                                        </p>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </TabsContent>
                                </div>
                            </ScrollArea>
                        </div>
                    </Tabs>
                </DialogContent>
            </Dialog>

            {/* <AddProductDialog
                open={isAddProductDialogOpen}
                onOpenChange={setIsAddProductDialogOpen}
                categoryId={category._id}
                categoryName={category.display_name}
                onProductAdded={() => {
                    fetchProducts({ category: category._id, limit: 100 }, true);
                }}
            /> */}
        </>
    );
}
