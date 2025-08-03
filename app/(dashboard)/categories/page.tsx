// "use client";

// import { useState, useEffect, useMemo } from "react";
// import { CategoriesTable } from "@/components/dashboard/Category/categories-table";
// import { CreateCategoryDialog } from "@/components/dashboard/Category/create-category-dialog";
// import { useStoreAdminStore } from "@/store/storeAdminStore";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Plus, Search, RefreshCw, Package, Tag } from "lucide-react";
// import { Skeleton } from "@/components/ui/skeleton";
// import { toast } from "sonner";

// export default function CategoriesPage() {
//   const {
//     categories,
//     categoriesLoading,
//     productsInfo,
//     fetchCategories,
//     fetchProducts,
//     error,
//     clearError,
//     dataVersion,
//   } = useStoreAdminStore();

//   const [searchTerm, setSearchTerm] = useState("");
//   const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState<any>(null);
//   const [lastDataVersion, setLastDataVersion] = useState(
//     dataVersion.categories,
//   );

//   // Memoized filtered categories to prevent unnecessary re-renders
//   const filteredCategories = useMemo(() => {
//     return categories.filter(
//       (category) =>
//         category.display_name
//           .toLowerCase()
//           .includes(searchTerm.toLowerCase()) ||
//         (category.description &&
//           category.description
//             .toLowerCase()
//             .includes(searchTerm.toLowerCase())),
//     );
//   }, [categories, searchTerm]);

//   // Only fetch data when necessary
//   useEffect(() => {
//     const shouldFetchCategories =
//       categories.length === 0 || dataVersion.categories !== lastDataVersion;
//     const shouldFetchProducts =
//       !productsInfo || productsInfo.products.length === 0;

//     if (shouldFetchCategories) {
//       fetchCategories();
//       setLastDataVersion(dataVersion.categories);
//     }

//     if (shouldFetchProducts) {
//       fetchProducts({ limit: 1000 }); // Fetch all products to get counts
//     }
//   }, [
//     categories.length,
//     productsInfo,
//     dataVersion.categories,
//     lastDataVersion,
//     fetchCategories,
//     fetchProducts,
//   ]);

//   useEffect(() => {
//     if (error) {
//       toast.error(error);
//       clearError();
//     }
//   }, [error, clearError]);

//   const handleRefresh = async () => {
//     try {
//       await fetchCategories(true); // Force refresh
//       await fetchProducts({ limit: 1000 }, true); // Force refresh
//       toast.success("Data refreshed successfully");
//     } catch (error) {
//       toast.error("Failed to refresh data");
//     }
//   };

//   const handleCreateCategory = () => {
//     setSelectedCategory(null);
//     setIsCreateDialogOpen(true);
//   };

//   const handleEditCategory = (category: any) => {
//     setSelectedCategory(category);
//     setIsEditDialogOpen(true);
//   };

//   const handleDialogClose = () => {
//     setIsCreateDialogOpen(false);
//     setIsEditDialogOpen(false);
//     setSelectedCategory(null);
//     // Data will be automatically updated through the store
//   };

//   const handleAddProduct = (categoryId: string) => {
//     toast.info("Add product functionality integrated with category table");
//   };

//   const handleAddSubcategory = (categoryId: string) => {
//     const category = categories.find((cat) => cat._id === categoryId);
//     if (category) {
//       toast.info(
//         `Add subcategory feature for ${category.display_name} coming soon!`,
//       );
//     }
//   };

//   // Calculate stats with product data
//   const getCategoryProductCount = (categoryId: string) => {
//     if (!productsInfo?.products) return 0;
//     return productsInfo.products.filter(
//       (product) => product.category === categoryId,
//     ).length;
//   };

//   const totalProductsInCategories = categories.reduce(
//     (total, cat) => total + getCategoryProductCount(cat._id),
//     0,
//   );

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
//             Category Management
//           </h1>
//           <p className="text-muted-foreground mt-1">
//             Organize your products with categories and manage your inventory
//           </p>
//         </div>

//         <div className="flex gap-2">
//           <Button
//             variant="outline"
//             onClick={handleRefresh}
//             disabled={categoriesLoading}
//           >
//             <RefreshCw
//               className={`mr-2 h-4 w-4 ${categoriesLoading ? "animate-spin" : ""}`}
//             />
//             Refresh
//           </Button>
//           <Button onClick={handleCreateCategory}>
//             <Plus className="mr-2 h-4 w-4" />
//             Add Category
//           </Button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Total Categories
//             </CardTitle>
//             <Tag className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{categories.length}</div>
//             <p className="text-xs text-muted-foreground">
//               {categories.filter((cat) => cat.is_active !== false).length}{" "}
//               active
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Primary Categories
//             </CardTitle>
//             <Tag className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {
//                 categories.filter((cat) => cat.is_primary || !cat.parent_id)
//                   .length
//               }
//             </div>
//             <p className="text-xs text-muted-foreground">
//               Main category groups
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Total Products
//             </CardTitle>
//             <Package className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {totalProductsInCategories}
//             </div>
//             <p className="text-xs text-muted-foreground">
//               Across all categories
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       <Card className="border-0 shadow-md">
//         <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3">
//           <div>
//             <CardTitle>Categories</CardTitle>
//             <CardDescription className="mt-1">
//               Manage product categories for your store
//             </CardDescription>
//           </div>

//           <div className="relative w-full sm:w-auto">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
//             <Input
//               placeholder="Search categories..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10 w-full sm:w-[300px]"
//             />
//           </div>
//         </CardHeader>

//         <CardContent>
//           {categoriesLoading ? (
//             <div className="space-y-4">
//               {[...Array(5)].map((_, i) => (
//                 <div
//                   key={i}
//                   className="flex items-center space-x-4 p-4 border rounded-lg"
//                 >
//                   <Skeleton className="h-12 w-12 rounded-full" />
//                   <div className="space-y-2 flex-1">
//                     <Skeleton className="h-4 w-[200px]" />
//                     <Skeleton className="h-4 w-[150px]" />
//                   </div>
//                   <Skeleton className="h-8 w-8 rounded-md" />
//                   <Skeleton className="h-8 w-8 rounded-md" />
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <CategoriesTable
//               categories={filteredCategories.map((cat) => ({
//                 ...cat,
//                 products: Array(getCategoryProductCount(cat._id)).fill(""),
//               }))}
//               isLoading={categoriesLoading}
//               onEdit={handleEditCategory}
//               onAddProduct={handleAddProduct}
//               onAddSubcategory={handleAddSubcategory}
//             />
//           )}

//           {!categoriesLoading && filteredCategories.length === 0 && (
//             <div className="flex flex-col items-center justify-center py-12 text-center">
//               <div className="bg-muted rounded-full p-4 mb-4">
//                 <Search className="h-10 w-10 text-muted-foreground" />
//               </div>
//               <h3 className="text-lg font-medium mb-1">
//                 {searchTerm ? "No matching categories" : "No categories found"}
//               </h3>
//               <p className="text-muted-foreground max-w-md">
//                 {searchTerm
//                   ? "Try adjusting your search or create a new category"
//                   : "Create your first category to organize your products"}
//               </p>
//               <Button className="mt-4" onClick={handleCreateCategory}>
//                 <Plus className="mr-2 h-4 w-4" />
//                 Add Category
//               </Button>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       <CreateCategoryDialog
//         open={isCreateDialogOpen}
//         onOpenChange={handleDialogClose}
//       />

//       <CreateCategoryDialog
//         open={isEditDialogOpen}
//         onOpenChange={handleDialogClose}
//         category={selectedCategory}
//       />
//     </div>
//   );
// }
import React from 'react'

export default function page() {
  return (
    <div>page</div>
  )
}

