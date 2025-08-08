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
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Edit, Plus, Package, Settings, Eye, Star, DollarSign, Tag, Filter, Grid3X3, BarChart3, Calendar, Search, TrendingUp, TrendingDown, Users, ShoppingCart, AlertTriangle, CheckCircle, XCircle, Clock, ImageIcon, ExternalLink } from 'lucide-react';
import { toast } from "sonner";
import { useProductStore } from "@/store/productStore";

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
    const { productInfo, loading: productsLoading } = useProductStore();

    const [categoryProducts, setCategoryProducts] = useState<iProduct[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [stats, setStats] = useState({
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        featuredProducts: 0,
        totalValue: 0,
        avgPrice: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        totalStock: 0,
    });

    // Load category products when dialog opens
    useEffect(() => {
        if (category && open) {
            loadCategoryProducts();
        }
    }, [category, open]);

    const loadCategoryProducts = async () => {
        if (!category) return;

        try {
            // await fetchProductsByCategory(category._id);
            // Filter products for this category
            const filteredProducts = productInfo?.products.filter(p => p.store_category_id === category._id);
            setCategoryProducts(filteredProducts ?? []);
        } catch (error) {
            console.error("Failed to load category products:", error);
            toast.error("Failed to load category products");
        }
    };

    // Calculate stats when products change
    useEffect(() => {
        if (categoryProducts.length === 0) {
            setStats({
                totalProducts: 0,
                activeProducts: 0,
                inactiveProducts: 0,
                featuredProducts: 0,
                totalValue: 0,
                avgPrice: 0,
                lowStockProducts: 0,
                outOfStockProducts: 0,
                totalStock: 0,
            });
            return;
        }

        const totalProducts = categoryProducts.length;
        const activeProducts = categoryProducts.filter(p => p.is_active).length;
        const inactiveProducts = totalProducts - activeProducts;
        const featuredProducts = categoryProducts.filter(p => p.is_featured).length;

        const totalValue = categoryProducts.reduce((sum, p) => {
            const stock = p.stock?.quantity || 0;
            return sum + (p.price * stock);
        }, 0);

        const avgPrice = totalProducts > 0 ? categoryProducts.reduce((sum, p) => sum + p.price, 0) / totalProducts : 0;

        const lowStockProducts = categoryProducts.filter(p => {
            const stock = p.stock?.quantity || 0;
            const threshold = p.stock?.low_stock_threshold || 10;
            return stock > 0 && stock <= threshold;
        }).length;

        const outOfStockProducts = categoryProducts.filter(p => (p.stock?.quantity || 0) === 0).length;
        const totalStock = categoryProducts.reduce((sum, p) => sum + (p.stock?.quantity || 0), 0);

        setStats({
            totalProducts,
            activeProducts,
            inactiveProducts,
            featuredProducts,
            totalValue,
            avgPrice,
            lowStockProducts,
            outOfStockProducts,
            totalStock,
        });
    }, [categoryProducts]);

    // Filter products based on search
    const filteredProducts = categoryProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!category) return null;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleEdit = () => onEdit?.(category);
    const handleAddProduct = () => onAddProduct?.(category._id);
    const handleAddSubcategory = () => onAddSubcategory?.(category._id);

    const getStatusIcon = (isActive: boolean) => {
        return isActive ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
            <XCircle className="h-4 w-4 text-red-500" />
        );
    };

    const getStockStatus = (product: iProduct) => {
        const stock = product.stock?.quantity || 0;
        const threshold = product.stock?.low_stock_threshold || 10;

        if (stock === 0) {
            return { status: "Out of Stock", color: "text-red-500", icon: XCircle };
        } else if (stock <= threshold) {
            return { status: "Low Stock", color: "text-orange-500", icon: AlertTriangle };
        } else {
            return { status: "In Stock", color: "text-green-500", icon: CheckCircle };
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0 pb-4">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex items-start space-x-4">
                            {category.img_url || category.image_url ? (
                                <img
                                    src={category.img_url || category.image_url || "/placeholder.svg"}
                                    alt={category.display_name}
                                    className="h-20 w-20 rounded-lg object-cover flex-shrink-0 border shadow-sm"
                                />
                            ) : (
                                <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 border">
                                    <Tag className="h-10 w-10 text-muted-foreground" />
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <DialogTitle className="text-2xl font-bold truncate flex items-center gap-2">
                                    {category.display_name}
                                    {getStatusIcon(category.is_active)}
                                </DialogTitle>
                                <p className="text-muted-foreground mt-1 line-clamp-2">
                                    {category.description || "No description provided"}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                    <Badge
                                        variant={category.is_active ? "default" : "secondary"}
                                        className="px-2 py-0.5"
                                    >
                                        {category.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                    {category.is_primary && (
                                        <Badge
                                            variant="outline"
                                            className="flex items-center gap-1 px-2 py-0.5"
                                        >
                                            <Star className="h-3 w-3" />
                                            Primary
                                        </Badge>
                                    )}
                                    <Badge variant="outline" className="px-2 py-0.5">
                                        Sort: {category.sort_order}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="flex items-center gap-1 px-2 py-0.5"
                                    >
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(category.created_at)}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={handleEdit}
                                size="sm"
                                className="gap-1"
                            >
                                <Edit className="h-4 w-4" />
                                Edit
                            </Button>
                            <Button
                                onClick={handleAddProduct}
                                size="sm"
                                className="gap-1"
                            >
                                <Plus className="h-4 w-4" />
                                Add Product
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleAddSubcategory}
                                size="sm"
                                className="gap-1"
                            >
                                <Plus className="h-4 w-4" />
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
                            Products ({stats.totalProducts})
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
                                                    Total Products
                                                </CardTitle>
                                                <Package className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                                                <p className="text-xs text-muted-foreground">
                                                    {stats.activeProducts} active • {stats.inactiveProducts} inactive
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card className="hover:shadow-md transition-shadow">
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">
                                                    Inventory Value
                                                </CardTitle>
                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">
                                                    {formatPrice(stats.totalValue)}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {stats.totalStock} units in stock
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card className="hover:shadow-md transition-shadow">
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">
                                                    Average Price
                                                </CardTitle>
                                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">
                                                    {formatPrice(stats.avgPrice)}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {stats.featuredProducts} featured products
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card className="hover:shadow-md transition-shadow">
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">
                                                    Stock Alerts
                                                </CardTitle>
                                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-orange-500">
                                                    {stats.lowStockProducts + stats.outOfStockProducts}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {stats.lowStockProducts} low • {stats.outOfStockProducts} out
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Category Information */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-lg">
                                                    <Eye className="h-5 w-5" />
                                                    Category Information
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label className="text-sm font-medium text-muted-foreground">
                                                                Category ID
                                                            </Label>
                                                            <p className="text-sm font-mono text-xs break-all mt-1">
                                                                {category._id}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-medium text-muted-foreground">
                                                                Display Name
                                                            </Label>
                                                            <p className="text-sm font-medium mt-1">
                                                                {category.display_name}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label className="text-sm font-medium text-muted-foreground">
                                                                Created Date
                                                            </Label>
                                                            <p className="text-sm font-medium mt-1">
                                                                {formatDate(category.created_at)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-medium text-muted-foreground">
                                                                Last Updated
                                                            </Label>
                                                            <p className="text-sm font-medium mt-1">
                                                                {formatDate(category.updated_at)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label className="text-sm font-medium text-muted-foreground">
                                                                Parent Category
                                                            </Label>
                                                            <p className="text-sm font-medium mt-1">
                                                                {category.parent_id ? "Has parent" : "Root category"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-medium text-muted-foreground">
                                                                Sort Order
                                                            </Label>
                                                            <p className="text-sm font-medium mt-1">
                                                                {category.sort_order}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-lg">
                                                    <Settings className="h-5 w-5" />
                                                    Configuration Summary
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Filters</span>
                                                        <Badge variant="outline">
                                                            {category.config?.filters?.length || 0} configured
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Attributes</span>
                                                        <Badge variant="outline">
                                                            {category.config?.attributes?.length || 0} configured
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Primary Category</span>
                                                        <Badge variant={category.is_primary ? "default" : "secondary"}>
                                                            {category.is_primary ? "Yes" : "No"}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Status</span>
                                                        <Badge variant={category.is_active ? "default" : "secondary"}>
                                                            {category.is_active ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="products" className="space-y-4 mt-4">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <h3 className="text-lg font-medium">Products in this category</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {filteredProducts.length} of {stats.totalProducts} products
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <div className="relative flex-1 sm:w-64">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                                <Input
                                                    placeholder="Search products..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10"
                                                />
                                            </div>
                                            <Button onClick={handleAddProduct} size="sm" className="gap-1 whitespace-nowrap">
                                                <Plus className="h-4 w-4" />
                                                Add Product
                                            </Button>
                                        </div>
                                    </div>

                                    {productsLoading ? (
                                        <div className="grid gap-4">
                                            {[1, 2, 3].map((i) => (
                                                <Card key={i}>
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center space-x-4">
                                                            <Skeleton className="h-16 w-16 rounded-lg" />
                                                            <div className="flex-1 min-w-0 space-y-2">
                                                                <Skeleton className="h-5 w-3/4" />
                                                                <Skeleton className="h-4 w-full" />
                                                                <Skeleton className="h-4 w-1/2" />
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : filteredProducts.length === 0 ? (
                                        <Card>
                                            <CardContent className="flex flex-col items-center justify-center py-12">
                                                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                                <h3 className="text-lg font-medium mb-2">
                                                    {searchTerm ? "No products found" : "No products in this category"}
                                                </h3>
                                                <p className="text-muted-foreground text-center mb-4">
                                                    {searchTerm
                                                        ? "Try adjusting your search terms"
                                                        : "Start building your catalog by adding products to this category."
                                                    }
                                                </p>
                                                {!searchTerm && (
                                                    <Button onClick={handleAddProduct} className="gap-1">
                                                        <Plus className="h-4 w-4" />
                                                        Add First Product
                                                    </Button>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <div className="grid gap-4">
                                            {filteredProducts.map((product) => {
                                                const stockStatus = getStockStatus(product);
                                                const StockIcon = stockStatus.icon;

                                                return (
                                                    <Card
                                                        key={product._id}
                                                        className="hover:shadow-md transition-shadow cursor-pointer"
                                                    >
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-4">
                                                                {product.images?.[0] ? (
                                                                    <img
                                                                        src={product.images[0] || "/placeholder.svg"}
                                                                        alt={product.name}
                                                                        className="h-16 w-16 rounded-lg object-cover flex-shrink-0 border"
                                                                    />
                                                                ) : (
                                                                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 border">
                                                                        <Package className="h-6 w-6 text-muted-foreground" />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-start justify-between mb-1">
                                                                        <h4 className="font-medium truncate pr-2">
                                                                            {product.name}
                                                                        </h4>
                                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                                            <Badge
                                                                                variant={product.is_active ? "default" : "secondary"}
                                                                                className="px-2 py-0.5"
                                                                            >
                                                                                {product.is_active ? "Active" : "Inactive"}
                                                                            </Badge>
                                                                            {product.is_featured && (
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className="flex items-center gap-1 px-2 py-0.5"
                                                                                >
                                                                                    <Star className="h-3 w-3" />
                                                                                    Featured
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                                                        {product.description || "No description"}
                                                                    </p>
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center space-x-4 text-sm">
                                                                            <span className="font-medium">
                                                                                {formatPrice(product.price)}
                                                                            </span>
                                                                            <span className="text-muted-foreground">
                                                                                SKU: {product.sku || "N/A"}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className={`flex items-center gap-1 text-sm ₹{stockStatus.color}`}>
                                                                                <StockIcon className="h-4 w-4" />
                                                                                <span>{product.stock?.quantity || 0}</span>
                                                                            </div>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-8 w-8 p-0"
                                                                                onClick={() => {
                                                                                    // Navigate to product details
                                                                                    window.open(`/products/₹{product._id}`, '_blank');
                                                                                }}
                                                                            >
                                                                                <ExternalLink className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="subcategories" className="space-y-4 mt-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-medium">Subcategories</h3>
                                        <Button onClick={handleAddSubcategory} size="sm" className="gap-1">
                                            <Plus className="h-4 w-4" />
                                            Add Subcategory
                                        </Button>
                                    </div>

                                    {!category.subcategories || category.subcategories.length === 0 ? (
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
                                                <Button onClick={handleAddSubcategory} className="gap-1">
                                                    <Plus className="h-4 w-4" />
                                                    Add Subcategory
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <div className="grid gap-4">
                                            {category.subcategories.map((subcategory) => (
                                                <Card
                                                    key={subcategory._id}
                                                    className="hover:shadow-md transition-shadow cursor-pointer"
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center space-x-4">
                                                            {subcategory.img_url ? (
                                                                <img
                                                                    src={subcategory.img_url || "/placeholder.svg"}
                                                                    alt={subcategory.display_name}
                                                                    className="h-12 w-12 rounded-lg object-cover flex-shrink-0 border"
                                                                />
                                                            ) : (
                                                                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 border">
                                                                    <Tag className="h-6 w-6 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <h4 className="font-medium truncate">
                                                                        {subcategory.display_name}
                                                                    </h4>
                                                                    <Badge
                                                                        variant={subcategory.is_active ? "default" : "secondary"}
                                                                        className="px-2 py-0.5"
                                                                    >
                                                                        {subcategory.is_active ? "Active" : "Inactive"}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                                                                    {subcategory.description || "No description"}
                                                                </p>
                                                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                                    <span>
                                                                        {subcategory.products?.length || 0} products
                                                                    </span>
                                                                    <span>
                                                                        Created: {formatDate(subcategory.created_at)}
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
                                                <CardTitle className="flex items-center gap-2 text-lg">
                                                    <Filter className="h-5 w-5" />
                                                    Category Filters
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {category.config?.filters && category.config.filters.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {category.config.filters.map((filter: any, index: number) => (
                                                            <div
                                                                key={index}
                                                                className="border rounded-lg p-4 bg-muted/10"
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
                                                                {filter.options && filter.options.length > 0 && (
                                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                                        {filter.options.map(
                                                                            (option: string, optIndex: number) => (
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
                                                    <div className="text-center py-8">
                                                        <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                        <p className="text-muted-foreground">
                                                            No filters configured for this category.
                                                        </p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="mt-2"
                                                            onClick={handleEdit}
                                                        >
                                                            Configure Filters
                                                        </Button>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-lg">
                                                    <Settings className="h-5 w-5" />
                                                    Category Attributes
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {category.config?.attributes && category.config.attributes.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {category.config.attributes.map(
                                                            (attribute: any, index: number) => (
                                                                <div
                                                                    key={index}
                                                                    className="border rounded-lg p-4 bg-muted/10"
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
                                                    <div className="text-center py-8">
                                                        <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                        <p className="text-muted-foreground">
                                                            No attributes configured for this category.
                                                        </p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="mt-2"
                                                            onClick={handleEdit}
                                                        >
                                                            Configure Attributes
                                                        </Button>
                                                    </div>
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
    );
}
