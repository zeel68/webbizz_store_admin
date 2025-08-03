// "use client"

// import { useEffect, useState } from "react"
// import { useStoreAdminStore } from "@/store/storeAdminStore"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Skeleton } from "@/components/ui/skeleton"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import {
//   ShoppingCart,
//   Package,
//   Users,
//   DollarSign,
//   TrendingUp,
//   AlertTriangle,
//   Star,
//   RefreshCw,
//   ArrowUpRight,
//   ArrowDownRight,
// } from "lucide-react"
// import { toast } from "sonner"

// export default function DashboardPage() {
//   const {
//     storeStats,
//     statsLoading,
//     productsInfo,
//     ordersInfo,
//     customersInfo,
//     analytics,
//     fetchStoreStats,
//     fetchProducts,
//     fetchOrders,
//     fetchCustomers,
//     fetchAnalytics,
//     error,
//     clearError,
//   } = useStoreAdminStore()

//   const [refreshing, setRefreshing] = useState(false)

//   useEffect(() => {
//     // Fetch dashboard data on mount
//     const loadDashboardData = async () => {
//       try {
//         await Promise.all([
//           fetchStoreStats(),
//           fetchProducts({ limit: 10 }), // Recent products
//           fetchOrders({ limit: 10 }), // Recent orders
//           fetchCustomers({ limit: 10 }), // Recent customers
//           fetchAnalytics(),
//         ])
//       } catch (error) {
//         console.error("Failed to load dashboard data:", error)
//       }
//     }

//     loadDashboardData()
//   }, [fetchStoreStats, fetchProducts, fetchOrders, fetchCustomers, fetchAnalytics])

//   useEffect(() => {
//     if (error) {
//       toast.error(error)
//       clearError()
//     }
//   }, [error, clearError])

//   const handleRefresh = async () => {
//     setRefreshing(true)
//     try {
//       await Promise.all([
//         fetchStoreStats(true),
//         fetchProducts({ limit: 10 }, true),
//         fetchOrders({ limit: 10 }, true),
//         fetchCustomers({ limit: 10 }, true),
//         fetchAnalytics(true),
//       ])
//       toast.success("Dashboard refreshed successfully")
//     } catch (error) {
//       toast.error("Failed to refresh dashboard")
//     } finally {
//       setRefreshing(false)
//     }
//   }

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "USD",
//     }).format(amount)
//   }

//   const formatPercentage = (value: number) => {
//     return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`
//   }

//   // Calculate growth percentages (mock data for demo)
//   const getGrowthData = (current: number, previous: number) => {
//     const growth = previous > 0 ? ((current - previous) / previous) * 100 : 0
//     return {
//       value: growth,
//       isPositive: growth >= 0,
//     }
//   }

//   const revenueGrowth = getGrowthData(storeStats?.totalRevenue || 0, (storeStats?.totalRevenue || 0) * 0.85)
//   const ordersGrowth = getGrowthData(storeStats?.totalOrders || 0, (storeStats?.totalOrders || 0) * 0.92)
//   const customersGrowth = getGrowthData(storeStats?.totalCustomers || 0, (storeStats?.totalCustomers || 0) * 0.88)
//   const productsGrowth = getGrowthData(storeStats?.totalProducts || 0, (storeStats?.totalProducts || 0) * 0.95)

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
//             Dashboard Overview
//           </h1>
//           <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening with your store.</p>
//         </div>

//         <Button variant="outline" onClick={handleRefresh} disabled={refreshing || statsLoading}>
//           <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
//           Refresh
//         </Button>
//       </div>

//       {/* Main Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <Card className="relative overflow-hidden">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
//             <DollarSign className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             {statsLoading ? (
//               <div className="space-y-2">
//                 <Skeleton className="h-8 w-24" />
//                 <Skeleton className="h-4 w-16" />
//               </div>
//             ) : (
//               <>
//                 <div className="text-2xl font-bold">{formatCurrency(storeStats?.totalRevenue || 0)}</div>
//                 <div className="flex items-center text-xs text-muted-foreground">
//                   {revenueGrowth.isPositive ? (
//                     <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
//                   ) : (
//                     <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
//                   )}
//                   <span className={revenueGrowth.isPositive ? "text-green-500" : "text-red-500"}>
//                     {formatPercentage(revenueGrowth.value)}
//                   </span>
//                   <span className="ml-1">from last month</span>
//                 </div>
//               </>
//             )}
//           </CardContent>
//         </Card>

//         <Card className="relative overflow-hidden">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
//             <ShoppingCart className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             {statsLoading ? (
//               <div className="space-y-2">
//                 <Skeleton className="h-8 w-16" />
//                 <Skeleton className="h-4 w-20" />
//               </div>
//             ) : (
//               <>
//                 <div className="text-2xl font-bold">{storeStats?.totalOrders || 0}</div>
//                 <div className="flex items-center text-xs text-muted-foreground">
//                   {ordersGrowth.isPositive ? (
//                     <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
//                   ) : (
//                     <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
//                   )}
//                   <span className={ordersGrowth.isPositive ? "text-green-500" : "text-red-500"}>
//                     {formatPercentage(ordersGrowth.value)}
//                   </span>
//                   <span className="ml-1">from last month</span>
//                 </div>
//               </>
//             )}
//           </CardContent>
//         </Card>

//         <Card className="relative overflow-hidden">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Products</CardTitle>
//             <Package className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             {statsLoading ? (
//               <div className="space-y-2">
//                 <Skeleton className="h-8 w-16" />
//                 <Skeleton className="h-4 w-24" />
//               </div>
//             ) : (
//               <>
//                 <div className="text-2xl font-bold">{storeStats?.totalProducts || 0}</div>
//                 <div className="flex items-center text-xs text-muted-foreground">
//                   <span>{storeStats?.activeProducts || 0} active products</span>
//                 </div>
//               </>
//             )}
//           </CardContent>
//         </Card>

//         <Card className="relative overflow-hidden">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
//             <Users className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             {statsLoading ? (
//               <div className="space-y-2">
//                 <Skeleton className="h-8 w-16" />
//                 <Skeleton className="h-4 w-20" />
//               </div>
//             ) : (
//               <>
//                 <div className="text-2xl font-bold">{storeStats?.totalCustomers || 0}</div>
//                 <div className="flex items-center text-xs text-muted-foreground">
//                   {customersGrowth.isPositive ? (
//                     <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
//                   ) : (
//                     <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
//                   )}
//                   <span className={customersGrowth.isPositive ? "text-green-500" : "text-red-500"}>
//                     {formatPercentage(customersGrowth.value)}
//                   </span>
//                   <span className="ml-1">from last month</span>
//                 </div>
//               </>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       {/* Alert Cards */}
//       {storeStats && (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <Card className="border-orange-200 bg-orange-50">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-orange-800">Low Stock Alert</CardTitle>
//               <AlertTriangle className="h-4 w-4 text-orange-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-orange-900">{storeStats.lowStockProducts}</div>
//               <p className="text-xs text-orange-700">Products need restocking</p>
//             </CardContent>
//           </Card>

//           <Card className="border-blue-200 bg-blue-50">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-blue-800">Pending Orders</CardTitle>
//               <ShoppingCart className="h-4 w-4 text-blue-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-blue-900">{storeStats.pendingOrders}</div>
//               <p className="text-xs text-blue-700">Orders awaiting processing</p>
//             </CardContent>
//           </Card>

//           <Card className="border-green-200 bg-green-50">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-green-800">Monthly Revenue</CardTitle>
//               <TrendingUp className="h-4 w-4 text-green-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-green-900">{formatCurrency(storeStats.monthlyRevenue || 0)}</div>
//               <p className="text-xs text-green-700">This month's earnings</p>
//             </CardContent>
//           </Card>
//         </div>
//       )}

//       {/* Recent Activity Tabs */}
//       <Tabs defaultValue="products" className="space-y-4">
//         <TabsList>
//           <TabsTrigger value="products">Recent Products</TabsTrigger>
//           <TabsTrigger value="orders">Recent Orders</TabsTrigger>
//           <TabsTrigger value="customers">Recent Customers</TabsTrigger>
//         </TabsList>

//         <TabsContent value="products" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Recent Products</CardTitle>
//               <CardDescription>Latest products added to your store</CardDescription>
//             </CardHeader>
//             <CardContent>
//               {productsInfo?.products && productsInfo.products.length > 0 ? (
//                 <div className="space-y-4">
//                   {productsInfo.products.slice(0, 5).map((product) => (
//                     <div key={product._id} className="flex items-center space-x-4">
//                       {product.images && product.images.length > 0 ? (
//                         <img
//                           src={product.images[0] || "/placeholder.svg"}
//                           alt={product.name}
//                           className="h-12 w-12 rounded object-cover"
//                         />
//                       ) : (
//                         <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
//                           <Package className="h-6 w-6 text-muted-foreground" />
//                         </div>
//                       )}
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-medium truncate">{product.name}</p>
//                         <p className="text-sm text-muted-foreground">
//                           {formatCurrency(product.price)} • Stock: {product.stock.quantity}
//                         </p>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <Badge variant={product.is_active ? "default" : "secondary"}>
//                           {product.is_active ? "Active" : "Inactive"}
//                         </Badge>
//                         {product.is_featured && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-6">
//                   <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//                   <p className="text-muted-foreground">No products found</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="orders" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Recent Orders</CardTitle>
//               <CardDescription>Latest orders from your customers</CardDescription>
//             </CardHeader>
//             <CardContent>
//               {ordersInfo?.orders && ordersInfo.orders.length > 0 ? (
//                 <div className="space-y-4">
//                   {ordersInfo.orders.slice(0, 5).map((order) => (
//                     <div key={order._id} className="flex items-center justify-between">
//                       <div className="flex items-center space-x-4">
//                         <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
//                           <ShoppingCart className="h-6 w-6 text-muted-foreground" />
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium">#{order.order_number}</p>
//                           <p className="text-sm text-muted-foreground">
//                             {typeof order.user_id === "object" ? order.user_id.name : "Unknown Customer"}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-sm font-medium">{formatCurrency(order.total || order.total_amount)}</p>
//                         <Badge
//                           variant={
//                             order.status === "delivered"
//                               ? "default"
//                               : order.status === "pending"
//                                 ? "secondary"
//                                 : order.status === "cancelled"
//                                   ? "destructive"
//                                   : "outline"
//                           }
//                         >
//                           {order.status}
//                         </Badge>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-6">
//                   <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//                   <p className="text-muted-foreground">No orders found</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="customers" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Recent Customers</CardTitle>
//               <CardDescription>Latest customers who joined your store</CardDescription>
//             </CardHeader>
//             <CardContent>
//               {customersInfo?.customers && customersInfo.customers.length > 0 ? (
//                 <div className="space-y-4">
//                   {customersInfo.customers.slice(0, 5).map((customer) => (
//                     <div key={customer._id} className="flex items-center justify-between">
//                       <div className="flex items-center space-x-4">
//                         {customer.profile_url ? (
//                           <img
//                             src={customer.profile_url || "/placeholder.svg"}
//                             alt={customer.name}
//                             className="h-12 w-12 rounded-full object-cover"
//                           />
//                         ) : (
//                           <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
//                             <Users className="h-6 w-6 text-muted-foreground" />
//                           </div>
//                         )}
//                         <div>
//                           <p className="text-sm font-medium">{customer.name}</p>
//                           <p className="text-sm text-muted-foreground">{customer.email}</p>
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <Badge variant={customer.is_active ? "default" : "secondary"}>
//                           {customer.is_active ? "Active" : "Inactive"}
//                         </Badge>
//                         <p className="text-xs text-muted-foreground mt-1">
//                           {new Date(customer.created_at).toLocaleDateString()}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-6">
//                   <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//                   <p className="text-muted-foreground">No customers found</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }


import React from 'react'

export default function Page() {
  return (
    <div>hello Dashboard</div>
  )
}
