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
import { Progress } from "@/components/ui/progress";
import {
    Edit, Plus, Package, Settings, Eye, Star, DollarSign, Tag, Filter,
    BarChart3, Calendar, Search, AlertTriangle, CheckCircle, XCircle,
    ExternalLink, ChevronRight, List, LayoutGrid, ArrowRight, Grip, Info
} from 'lucide-react';
import { toast } from "sonner";
import { useProductStore } from "@/store/productStore";
import { cn } from "@/lib/utils";

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
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");

    // Load category products when dialog opens
    useEffect(() => {
        if (category && open) {
            loadCategoryProducts();
        }
    }, [category, open]);

    const loadCategoryProducts = async () => {
        if (!category) return;

        try {
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
            return { status: "Out of Stock", color: "text-red-500", bgColor: "bg-red-500/10", icon: XCircle };
        } else if (stock <= threshold) {
            return { status: "Low Stock", color: "text-orange-500", bgColor: "bg-orange-500/10", icon: AlertTriangle };
        } else {
            return { status: "In Stock", color: "text-green-500", bgColor: "bg-green-500/10", icon: CheckCircle };
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] w-full max-h-[90vh] h-full flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
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
                                <div className="flex items-center gap-2">
                                    <DialogTitle className="text-2xl font-bold truncate">
                                        {category.display_name}
                                    </DialogTitle>
                                    {getStatusIcon(category.is_active)}
                                </div>
                                <p className="text-muted-foreground mt-1 line-clamp-2">
                                    {category.description || "No description provided"}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
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
                                        {formatDate(category.createdAt)}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 justify-end">
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
                    <TabsList className="rounded-none px-6 py-3 bg-background border-b">
                        <TabsTrigger value="overview" className="py-1 px-3">Overview</TabsTrigger>
                        <TabsTrigger value="products" className="py-1 px-3">
                            Products {stats.totalProducts > 0 && `(${stats.totalProducts})`}
                        </TabsTrigger>
                        <TabsTrigger value="subcategories" className="py-1 px-3">
                            Subcategories {category.subcategories?.length > 0 && `(${category.subcategories.length})`}
                        </TabsTrigger>
                        <TabsTrigger value="configuration" className="py-1 px-3">Configuration</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full">
                            <div className="p-6">
                                <TabsContent value="overview" className="space-y-6 mt-0">
                                    {/* Stats Cards - Improved layout */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <Card className="hover:shadow transition-shadow">
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                                    Total Products
                                                </CardTitle>
                                                <Package className="h-5 w-5 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="flex items-center gap-1 text-sm text-green-500">
                                                        <CheckCircle className="h-4 w-4" />
                                                        <span>{stats.activeProducts}</span>
                                                    </div>
                                                    <Separator orientation="vertical" className="h-4" />
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <XCircle className="h-4 w-4" />
                                                        <span>{stats.inactiveProducts}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="hover:shadow transition-shadow">
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                                    Inventory Value
                                                </CardTitle>
                                                <DollarSign className="h-5 w-5 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">
                                                    {formatPrice(stats.totalValue)}
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                                                    <Package className="h-4 w-4" />
                                                    <span>{stats.totalStock} units</span>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="hover:shadow transition-shadow">
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                                    Average Price
                                                </CardTitle>
                                                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">
                                                    {formatPrice(stats.avgPrice)}
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500/20" />
                                                    <span>{stats.featuredProducts} featured</span>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="hover:shadow transition-shadow">
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                                    Stock Status
                                                </CardTitle>
                                                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center gap-4">
                                                    <div>
                                                        <div className="text-2xl font-bold text-green-500">
                                                            {stats.totalProducts - (stats.lowStockProducts + stats.outOfStockProducts)}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">Good</div>
                                                    </div>
                                                    <Separator orientation="vertical" className="h-8" />
                                                    <div>
                                                        <div className="text-2xl font-bold text-orange-500">
                                                            {stats.lowStockProducts}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">Low</div>
                                                    </div>
                                                    <Separator orientation="vertical" className="h-8" />
                                                    <div>
                                                        <div className="text-2xl font-bold text-red-500">
                                                            {stats.outOfStockProducts}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">Out</div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Category Information - Improved layout */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="flex items-center gap-2 text-base">
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                    <span>Category Information</span>
                                                </CardTitle>
                                                <Separator />
                                            </CardHeader>
                                            <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <Label className="text-sm font-medium text-muted-foreground">
                                                        Category ID
                                                    </Label>
                                                    <p className="text-sm font-mono break-all bg-muted rounded px-2 py-1">
                                                        {category._id}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-sm font-medium text-muted-foreground">
                                                        Display Name
                                                    </Label>
                                                    <p className="text-sm font-medium">
                                                        {category.display_name}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-sm font-medium text-muted-foreground">
                                                        Created Date
                                                    </Label>
                                                    <p className="text-sm">
                                                        {formatDate(category.createdAt)}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-sm font-medium text-muted-foreground">
                                                        Last Updated
                                                    </Label>
                                                    <p className="text-sm">
                                                        {formatDate(category.updatedAt)}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-sm font-medium text-muted-foreground">
                                                        Parent Category
                                                    </Label>
                                                    <p className="text-sm">
                                                        {category.parent_id ? "Has parent" : "Root category"}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-sm font-medium text-muted-foreground">
                                                        Sort Order
                                                    </Label>
                                                    <p className="text-sm">
                                                        {category.sort_order}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="flex items-center gap-2 text-base">
                                                    <Settings className="h-4 w-4 text-muted-foreground" />
                                                    <span>Configuration Summary</span>
                                                </CardTitle>
                                                <Separator />
                                            </CardHeader>
                                            <CardContent className="pt-4 space-y-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Filter className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">Filters</span>
                                                        </div>
                                                        <Badge variant="outline">
                                                            {category.config?.filters?.length || 0} configured
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Tag className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">Attributes</span>
                                                        </div>
                                                        <Badge variant="outline">
                                                            {category.config?.attributes?.length || 0} configured
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Star className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">Primary Category</span>
                                                        </div>
                                                        <Badge variant={category.is_primary ? "default" : "secondary"}>
                                                            {category.is_primary ? "Yes" : "No"}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            {category.is_active ? (
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <XCircle className="h-4 w-4 text-red-500" />
                                                            )}
                                                            <span className="text-sm">Status</span>
                                                        </div>
                                                        <Badge variant={category.is_active ? "default" : "secondary"}>
                                                            {category.is_active ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="products" className="space-y-4 mt-0">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">Products</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {filteredProducts.length} of {stats.totalProducts} products
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <div className="relative flex-1 sm:w-72">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                                <Input
                                                    placeholder="Search products by name, description, or SKU..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10"
                                                />
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant={viewMode === "list" ? "secondary" : "outline"}
                                                    size="icon"
                                                    onClick={() => setViewMode("list")}
                                                >
                                                    <List className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant={viewMode === "grid" ? "secondary" : "outline"}
                                                    size="icon"
                                                    onClick={() => setViewMode("grid")}
                                                >
                                                    <LayoutGrid className="h-4 w-4" />
                                                </Button>
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
                                        <Card className="border-dashed">
                                            <CardContent className="flex flex-col items-center justify-center py-12">
                                                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                                <h3 className="text-lg font-medium mb-2">
                                                    {searchTerm ? "No products found" : "No products in this category"}
                                                </h3>
                                                <p className="text-muted-foreground text-center mb-4 max-w-md">
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
                                    ) : viewMode === "list" ? (
                                        <div className="grid gap-2">
                                            {filteredProducts.map((product) => {
                                                const stockStatus = getStockStatus(product);
                                                const StockIcon = stockStatus.icon;
                                                const stock = product.stock?.quantity || 0;
                                                const threshold = product.stock?.low_stock_threshold || 10;
                                                const maxStock = Math.max(threshold * 2, stock + 10);

                                                return (
                                                    <Card
                                                        key={product._id}
                                                        className="hover:shadow transition-shadow cursor-pointer"
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
                                                                        <h4 className="font-semibold truncate pr-2">
                                                                            {product.name}
                                                                        </h4>
                                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                                            <Badge
                                                                                variant={product.is_active ? "default" : "secondary"}
                                                                                className="px-2 py-0.5 text-xs"
                                                                            >
                                                                                {product.is_active ? "Active" : "Inactive"}
                                                                            </Badge>
                                                                            {product.is_featured && (
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className="flex items-center gap-1 px-2 py-0.5 text-xs"
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
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${stockStatus.bgColor} ${stockStatus.color}`}>
                                                                                <StockIcon className="h-4 w-4" />
                                                                                <span className="text-xs font-medium">{stockStatus.status}</span>
                                                                            </div>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-8 w-8 p-0"
                                                                                onClick={() => {
                                                                                    window.open(`/products/${product._id}`, '_blank');
                                                                                }}
                                                                            >
                                                                                <ChevronRight className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                    {stock > 0 && (
                                                                        <div className="mt-3">
                                                                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                                                <span>Stock level</span>
                                                                                <span>{stock} / {maxStock}</span>
                                                                            </div>
                                                                            <Progress
                                                                                value={(stock / maxStock) * 100}
                                                                                className={cn(
                                                                                    "h-2",
                                                                                    stock <= threshold ? "bg-orange-500" : "bg-green-500"
                                                                                )}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {filteredProducts.map((product) => {
                                                const stockStatus = getStockStatus(product);
                                                const StockIcon = stockStatus.icon;

                                                return (
                                                    <Card
                                                        key={product._id}
                                                        className="hover:shadow transition-shadow cursor-pointer h-full"
                                                    >
                                                        <CardContent className="p-4 flex flex-col h-full">
                                                            <div className="mb-4 relative">
                                                                {product.images?.[0] ? (
                                                                    <img
                                                                        src={product.images[0] || "/placeholder.svg"}
                                                                        alt={product.name}
                                                                        className="w-full h-40 rounded-lg object-cover border"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-40 rounded-lg bg-muted flex items-center justify-center border">
                                                                        <Package className="h-10 w-10 text-muted-foreground" />
                                                                    </div>
                                                                )}
                                                                <div className="absolute top-2 right-2 flex gap-1">
                                                                    {product.is_featured && (
                                                                        <Badge className="px-2 py-0.5 bg-yellow-500 text-white">
                                                                            <Star className="h-3 w-3 mr-1" />
                                                                            Featured
                                                                        </Badge>
                                                                    )}
                                                                    <Badge
                                                                        variant={product.is_active ? "default" : "secondary"}
                                                                        className="px-2 py-0.5"
                                                                    >
                                                                        {product.is_active ? "Active" : "Inactive"}
                                                                    </Badge>
                                                                </div>
                                                            </div>

                                                            <div className="flex-1">
                                                                <h4 className="font-semibold mb-1 line-clamp-2">
                                                                    {product.name}
                                                                </h4>
                                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                                                    {product.description || "No description"}
                                                                </p>

                                                                <div className="flex justify-between items-center mb-3">
                                                                    <span className="font-medium text-lg">
                                                                        {formatPrice(product.price)}
                                                                    </span>
                                                                    <div className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${stockStatus.bgColor} ${stockStatus.color}`}>
                                                                        <StockIcon className="h-4 w-4" />
                                                                        <span className="text-xs font-medium">{stockStatus.status}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="text-xs text-muted-foreground mb-1">
                                                                    SKU: {product.sku || "N/A"}
                                                                </div>
                                                            </div>

                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="mt-auto w-full"
                                                                onClick={() => window.open(`/products/${product._id}`, '_blank')}
                                                            >
                                                                View Details
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="subcategories" className="space-y-4 mt-0">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-semibold">Subcategories</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {category.subcategories?.length || 0} subcategories
                                            </p>
                                        </div>
                                        <Button onClick={handleAddSubcategory} size="sm" className="gap-1">
                                            <Plus className="h-4 w-4" />
                                            Add Subcategory
                                        </Button>
                                    </div>

                                    {!category.subcategories || category.subcategories.length === 0 ? (
                                        <Card className="border-dashed">
                                            <CardContent className="flex flex-col items-center justify-center py-12">
                                                <Grip className="h-12 w-12 text-muted-foreground mb-4" />
                                                <h3 className="text-lg font-medium mb-2">
                                                    No subcategories
                                                </h3>
                                                <p className="text-muted-foreground text-center mb-4 max-w-md">
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
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {category.subcategories.map((subcategory) => (
                                                <Card
                                                    key={subcategory._id}
                                                    className="hover:shadow transition-shadow cursor-pointer"
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center space-x-4">
                                                            {subcategory.img_url ? (
                                                                <img
                                                                    src={subcategory.img_url || "/placeholder.svg"}
                                                                    alt={subcategory.display_name}
                                                                    className="h-16 w-16 rounded-lg object-cover flex-shrink-0 border"
                                                                />
                                                            ) : (
                                                                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 border">
                                                                    <Tag className="h-8 w-8 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <h4 className="font-semibold truncate">
                                                                        {subcategory.display_name}
                                                                    </h4>
                                                                    <Badge
                                                                        variant={subcategory.is_active ? "default" : "secondary"}
                                                                        className="px-2 py-0.5 text-xs"
                                                                    >
                                                                        {subcategory.is_active ? "Active" : "Inactive"}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                                                    {subcategory.description || "No description"}
                                                                </p>
                                                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                                    <span>
                                                                        {subcategory.products?.length || 0} products
                                                                    </span>
                                                                    <span>
                                                                        {formatDate(subcategory.createdAt)}
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

                                <TabsContent value="configuration" className="space-y-6 mt-0">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="flex items-center gap-2 text-base">
                                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                                    <span>Category Filters</span>
                                                </CardTitle>
                                                <Separator />
                                            </CardHeader>
                                            <CardContent className="pt-4">
                                                {category.config?.filters && category.config.filters.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {category.config.filters.map((filter: any, index: number) => (
                                                            <div
                                                                key={index}
                                                                className="border rounded-lg p-4 bg-muted/5 hover:bg-muted/10 transition-colors"
                                                            >
                                                                <div className="flex items-center justify-between mb-3">
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
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {filter.options.map(
                                                                            (option: string, optIndex: number) => (
                                                                                <Badge
                                                                                    key={optIndex}
                                                                                    variant="outline"
                                                                                    className="text-xs"
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
                                                        <p className="text-muted-foreground mb-4">
                                                            No filters configured for this category.
                                                        </p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={handleEdit}
                                                        >
                                                            Configure Filters
                                                        </Button>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="flex items-center gap-2 text-base">
                                                    <Settings className="h-4 w-4 text-muted-foreground" />
                                                    <span>Category Attributes</span>
                                                </CardTitle>
                                                <Separator />
                                            </CardHeader>
                                            <CardContent className="pt-4">
                                                {category.config?.attributes && category.config.attributes.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {category.config.attributes.map(
                                                            (attribute: any, index: number) => (
                                                                <div
                                                                    key={index}
                                                                    className="border rounded-lg p-4 bg-muted/5 hover:bg-muted/10 transition-colors"
                                                                >
                                                                    <div className="flex items-center justify-between mb-3">
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
                                                                        <div className="mt-2">
                                                                            <Label className="text-sm text-muted-foreground">
                                                                                Default Value:
                                                                            </Label>
                                                                            <p className="text-sm font-medium">
                                                                                {attribute.default_value}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                        <p className="text-muted-foreground mb-4">
                                                            No attributes configured for this category.
                                                        </p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
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