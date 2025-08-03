// "use client"

// import { useState, useEffect } from "react"
// import { useStoreAdminStore } from "@/store/storeAdminStore"
// import { ProductsTable } from "@/components/dashboard/Product/productsTable"
// import { CreateProductDialog } from "@/components/dashboard/Product/createProductDialog"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Plus, Search, RefreshCw, Package, DollarSign, TrendingUp, AlertTriangle } from "lucide-react"
// import { toast } from "sonner"

// export default function ProductsPage() {
//   const { productsInfo, productsLoading, categories, fetchProducts, fetchCategories, error, clearError } =
//     useStoreAdminStore()

//   const [searchTerm, setSearchTerm] = useState("")
//   const [selectedCategory, setSelectedCategory] = useState<string>("all")
//   const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
//   const [editingProduct, setEditingProduct] = useState<any>(null)
//   const [currentPage, setCurrentPage] = useState(1)

//   const products = productsInfo?.products || []
//   const pagination = productsInfo?.pagination

//   useEffect(() => {
//     fetchProducts({ page: currentPage, limit: 20, search: searchTerm, category: selectedCategory })
//     if (categories.length === 0) {
//       fetchCategories()
//     }
//   }, [currentPage, searchTerm, selectedCategory])

//   useEffect(() => {
//     if (error) {
//       toast.error(error)
//       clearError()
//     }
//   }, [error, clearError])

//   const handleRefresh = async () => {
//     try {
//       await fetchProducts({ page: currentPage, limit: 20, search: searchTerm, category: selectedCategory })
//       await fetchCategories()
//       toast.success("Data refreshed successfully")
//     } catch (error) {
//       toast.error("Failed to refresh data")
//     }
//   }

//   const handleEditProduct = (product: any) => {
//     setEditingProduct(product)
//     setIsEditDialogOpen(true)
//   }

//   const handleViewProduct = (product: any) => {
//     toast.info("Product view dialog coming soon!")
//   }

//   const handleCreateProduct = () => {
//     setEditingProduct(null)
//     setIsCreateDialogOpen(true)
//   }

//   const handleDialogClose = () => {
//     setIsCreateDialogOpen(false)
//     setIsEditDialogOpen(false)
//     setEditingProduct(null)
//     // Refresh products after dialog closes
//     fetchProducts({ page: currentPage, limit: 20, search: searchTerm, category: selectedCategory })
//   }

//   const handleSearch = (value: string) => {
//     setSearchTerm(value)
//     setCurrentPage(1)
//   }

//   const handleCategoryFilter = (value: string) => {
//     setSelectedCategory(value)
//     setCurrentPage(1)
//   }

//   // Calculate stats
//   const totalProducts = products.length
//   const activeProducts = products.filter((p) => p.is_active).length
//   const totalValue = products.reduce((sum, p) => sum + p.price * p.stock.quantity, 0)
//   const lowStockProducts = products.filter(
//     (p) => p.stock.low_stock_threshold && p.stock.quantity <= p.stock.low_stock_threshold,
//   ).length

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
//             Product Management
//           </h1>
//           <p className="text-muted-foreground mt-1">Manage your product inventory and catalog</p>
//         </div>

//         <div className="flex gap-2">
//           <Button variant="outline" onClick={handleRefresh} disabled={productsLoading}>
//             <RefreshCw className={`mr-2 h-4 w-4 ${productsLoading ? "animate-spin" : ""}`} />
//             Refresh
//           </Button>
//           <Button onClick={handleCreateProduct}>
//             <Plus className="mr-2 h-4 w-4" />
//             Add Product
//           </Button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Products</CardTitle>
//             <Package className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{pagination?.total || totalProducts}</div>
//             <p className="text-xs text-muted-foreground">{activeProducts} active</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
//             <DollarSign className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//             </div>
//             <p className="text-xs text-muted-foreground">Total stock value</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Categories</CardTitle>
//             <TrendingUp className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{categories.length}</div>
//             <p className="text-xs text-muted-foreground">Product categories</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
//             <AlertTriangle className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-orange-600">{lowStockProducts}</div>
//             <p className="text-xs text-muted-foreground">Products need restocking</p>
//           </CardContent>
//         </Card>
//       </div>

//       <Card className="border-0 shadow-md">
//         <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3">
//           <div>
//             <CardTitle>Products</CardTitle>
//             <CardDescription className="mt-1">Manage your product catalog and inventory</CardDescription>
//           </div>

//           <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
//               <Input
//                 placeholder="Search products..."
//                 value={searchTerm}
//                 onChange={(e) => handleSearch(e.target.value)}
//                 className="pl-10 w-full sm:w-[300px]"
//               />
//             </div>
//             <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
//               <SelectTrigger className="w-full sm:w-[180px]">
//                 <SelectValue placeholder="All Categories" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Categories</SelectItem>
//                 {categories.map((category) => (
//                   <SelectItem key={category._id} value={category._id}>
//                     {category.display_name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </CardHeader>

//         <CardContent>
//           <ProductsTable
//             products={products}
//             isLoading={productsLoading}
//             onEdit={handleEditProduct}
//             onView={handleViewProduct}
//           />

//           {!productsLoading && products.length === 0 && (
//             <div className="flex flex-col items-center justify-center py-12 text-center">
//               <div className="bg-muted rounded-full p-4 mb-4">
//                 <Package className="h-10 w-10 text-muted-foreground" />
//               </div>
//               <h3 className="text-lg font-medium mb-1">
//                 {searchTerm || selectedCategory !== "all" ? "No matching products" : "No products found"}
//               </h3>
//               <p className="text-muted-foreground max-w-md">
//                 {searchTerm || selectedCategory !== "all"
//                   ? "Try adjusting your search or filters"
//                   : "Create your first product to start building your catalog"}
//               </p>
//               <Button className="mt-4" onClick={handleCreateProduct}>
//                 <Plus className="mr-2 h-4 w-4" />
//                 Add Product
//               </Button>
//             </div>
//           )}

//           {/* Pagination */}
//           {pagination && pagination.totalPages > 1 && (
//             <div className="flex items-center justify-between mt-4">
//               <div className="text-sm text-muted-foreground">
//                 Showing {(currentPage - 1) * (pagination.limit || 20) + 1} to{" "}
//                 {Math.min(currentPage * (pagination.limit || 20), pagination.total)} of {pagination.total} products
//               </div>
//               <div className="flex gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setCurrentPage(currentPage - 1)}
//                   disabled={currentPage === 1}
//                 >
//                   Previous
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setCurrentPage(currentPage + 1)}
//                   disabled={currentPage === pagination.totalPages}
//                 >
//                   Next
//                 </Button>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       <CreateProductDialog open={isCreateDialogOpen} onOpenChange={handleDialogClose} />

//       <CreateProductDialog open={isEditDialogOpen} onOpenChange={handleDialogClose} editingProduct={editingProduct} />
//     </div>
//   )
// }
