// "use client"

// import { useState, useEffect } from "react"
// import { useStoreAdminStore } from "@/store/storeAdminStore"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Badge } from "@/components/ui/badge"
// import { Skeleton } from "@/components/ui/skeleton"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import {
//   Search,
//   RefreshCw,
//   ShoppingCart,
//   DollarSign,
//   Clock,
//   CheckCircle,
//   MoreHorizontal,
//   Eye,
//   Edit,
//   Package,
//   Truck,
// } from "lucide-react"
// import { toast } from "sonner"

// const ORDER_STATUSES = [
//   { value: "pending", label: "Pending", color: "bg-yellow-500" },
//   { value: "confirmed", label: "Confirmed", color: "bg-blue-500" },
//   { value: "processing", label: "Processing", color: "bg-purple-500" },
//   { value: "shipped", label: "Shipped", color: "bg-orange-500" },
//   { value: "delivered", label: "Delivered", color: "bg-green-500" },
//   { value: "cancelled", label: "Cancelled", color: "bg-red-500" },
//   { value: "refunded", label: "Refunded", color: "bg-gray-500" },
// ]

// const PAYMENT_STATUSES = [
//   { value: "pending", label: "Pending", color: "bg-yellow-500" },
//   { value: "paid", label: "Paid", color: "bg-green-500" },
//   { value: "failed", label: "Failed", color: "bg-red-500" },
//   { value: "refunded", label: "Refunded", color: "bg-gray-500" },
// ]

// export default function OrdersPage() {
//   const { ordersInfo, ordersLoading, fetchOrders, updateOrderStatus, error, clearError } = useStoreAdminStore()

//   const [searchTerm, setSearchTerm] = useState("")
//   const [selectedStatus, setSelectedStatus] = useState<string>("all")
//   const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("all")
//   const [currentPage, setCurrentPage] = useState(1)

//   const orders = ordersInfo?.orders || []
//   const pagination = ordersInfo?.pagination

//   useEffect(() => {
//     fetchOrders({
//       page: currentPage,
//       limit: 20,
//       search: searchTerm,
//       status: selectedStatus,
//       payment_status: selectedPaymentStatus,
//     })
//   }, [currentPage, searchTerm, selectedStatus, selectedPaymentStatus])

//   useEffect(() => {
//     if (error) {
//       toast.error(error)
//       clearError()
//     }
//   }, [error, clearError])

//   const handleRefresh = async () => {
//     try {
//       await fetchOrders({
//         page: currentPage,
//         limit: 20,
//         search: searchTerm,
//         status: selectedStatus,
//         payment_status: selectedPaymentStatus,
//       })
//       toast.success("Orders refreshed successfully")
//     } catch (error) {
//       toast.error("Failed to refresh orders")
//     }
//   }

//   const handleSearch = (value: string) => {
//     setSearchTerm(value)
//     setCurrentPage(1)
//   }

//   const handleStatusFilter = (value: string) => {
//     setSelectedStatus(value)
//     setCurrentPage(1)
//   }

//   const handlePaymentStatusFilter = (value: string) => {
//     setSelectedPaymentStatus(value)
//     setCurrentPage(1)
//   }

//   const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
//     try {
//       await updateOrderStatus(orderId, newStatus)
//       toast.success("Order status updated successfully")
//     } catch (error: any) {
//       toast.error(error.message || "Failed to update order status")
//     }
//   }

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "USD",
//     }).format(amount)
//   }

//   const getStatusColor = (status: string, type: "order" | "payment") => {
//     const statuses = type === "order" ? ORDER_STATUSES : PAYMENT_STATUSES
//     return statuses.find((s) => s.value === status)?.color || "bg-gray-500"
//   }

//   const getStatusLabel = (status: string, type: "order" | "payment") => {
//     const statuses = type === "order" ? ORDER_STATUSES : PAYMENT_STATUSES
//     return statuses.find((s) => s.value === status)?.label || status
//   }

//   // Calculate stats
//   const totalOrders = orders.length
//   const pendingOrders = orders.filter((o) => o.status === "pending").length
//   const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0)
//   const paidOrders = orders.filter((o) => o.payment_status === "paid").length

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
//             Order Management
//           </h1>
//           <p className="text-muted-foreground mt-1">Track and manage customer orders</p>
//         </div>

//         <div className="flex gap-2">
//           <Button variant="outline" onClick={handleRefresh} disabled={ordersLoading}>
//             <RefreshCw className={`mr-2 h-4 w-4 ${ordersLoading ? "animate-spin" : ""}`} />
//             Refresh
//           </Button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
//             <ShoppingCart className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{pagination?.total || totalOrders}</div>
//             <p className="text-xs text-muted-foreground">{pendingOrders} pending</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
//             <DollarSign className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
//             <p className="text-xs text-muted-foreground">From current page</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
//             <Clock className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-orange-600">{pendingOrders}</div>
//             <p className="text-xs text-muted-foreground">Need attention</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Paid Orders</CardTitle>
//             <CheckCircle className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-green-600">{paidOrders}</div>
//             <p className="text-xs text-muted-foreground">Payment received</p>
//           </CardContent>
//         </Card>
//       </div>

//       <Card className="border-0 shadow-md">
//         <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3">
//           <div>
//             <CardTitle>Orders</CardTitle>
//             <CardDescription className="mt-1">Manage customer orders and fulfillment</CardDescription>
//           </div>

//           <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
//               <Input
//                 placeholder="Search orders..."
//                 value={searchTerm}
//                 onChange={(e) => handleSearch(e.target.value)}
//                 className="pl-10 w-full sm:w-[300px]"
//               />
//             </div>
//             <Select value={selectedStatus} onValueChange={handleStatusFilter}>
//               <SelectTrigger className="w-full sm:w-[150px]">
//                 <SelectValue placeholder="All Statuses" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Statuses</SelectItem>
//                 {ORDER_STATUSES.map((status) => (
//                   <SelectItem key={status.value} value={status.value}>
//                     {status.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Select value={selectedPaymentStatus} onValueChange={handlePaymentStatusFilter}>
//               <SelectTrigger className="w-full sm:w-[150px]">
//                 <SelectValue placeholder="Payment Status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Payments</SelectItem>
//                 {PAYMENT_STATUSES.map((status) => (
//                   <SelectItem key={status.value} value={status.value}>
//                     {status.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </CardHeader>

//         <CardContent>
//           {ordersLoading ? (
//             <div className="space-y-4">
//               {[...Array(5)].map((_, i) => (
//                 <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
//                   <Skeleton className="h-12 w-12 rounded" />
//                   <div className="space-y-2 flex-1">
//                     <Skeleton className="h-4 w-[200px]" />
//                     <Skeleton className="h-4 w-[150px]" />
//                     <Skeleton className="h-3 w-[100px]" />
//                   </div>
//                   <Skeleton className="h-8 w-20" />
//                   <Skeleton className="h-8 w-8 rounded-md" />
//                 </div>
//               ))}
//             </div>
//           ) : orders.length > 0 ? (
//             <div className="rounded-md border">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Order</TableHead>
//                     <TableHead>Customer</TableHead>
//                     <TableHead>Items</TableHead>
//                     <TableHead>Total</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Payment</TableHead>
//                     <TableHead>Date</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {orders.map((order) => (
//                     <TableRow key={order._id}>
//                       <TableCell>
//                         <div>
//                           <div className="font-medium">#{order.order_number}</div>
//                           {order.tracking_number && (
//                             <div className="text-sm text-muted-foreground flex items-center">
//                               <Truck className="h-3 w-3 mr-1" />
//                               {order.tracking_number}
//                             </div>
//                           )}
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div>
//                           <div className="font-medium">{order.user_id.name}</div>
//                           <div className="text-sm text-muted-foreground">{order.user_id.email}</div>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex items-center space-x-2">
//                           <Package className="h-4 w-4 text-muted-foreground" />
//                           <span className="text-sm">{order.items.length} items</span>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div className="font-medium">{formatCurrency(order.total_amount)}</div>
//                         {order.subtotal && order.subtotal !== order.total_amount && (
//                           <div className="text-sm text-muted-foreground">
//                             Subtotal: {formatCurrency(order.subtotal)}
//                           </div>
//                         )}
//                       </TableCell>
//                       <TableCell>
//                         <Badge variant="secondary" className={`${getStatusColor(order.status, "order")} text-white`}>
//                           {getStatusLabel(order.status, "order")}
//                         </Badge>
//                       </TableCell>
//                       <TableCell>
//                         <Badge
//                           variant="secondary"
//                           className={`${getStatusColor(order.payment_status, "payment")} text-white`}
//                         >
//                           {getStatusLabel(order.payment_status, "payment")}
//                         </Badge>
//                       </TableCell>
//                       <TableCell>
//                         <span className="text-sm text-muted-foreground">
//                           {new Date(order.created_at).toLocaleDateString()}
//                         </span>
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" className="h-8 w-8 p-0">
//                               <MoreHorizontal className="h-4 w-4" />
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end">
//                             <DropdownMenuItem>
//                               <Eye className="mr-2 h-4 w-4" />
//                               View Details
//                             </DropdownMenuItem>
//                             <DropdownMenuItem>
//                               <Edit className="mr-2 h-4 w-4" />
//                               Edit Order
//                             </DropdownMenuItem>
//                             <DropdownMenuSeparator />
//                             {ORDER_STATUSES.map((status) => (
//                               <DropdownMenuItem
//                                 key={status.value}
//                                 onClick={() => handleUpdateOrderStatus(order._id, status.value)}
//                                 disabled={order.status === status.value}
//                               >
//                                 Mark as {status.label}
//                               </DropdownMenuItem>
//                             ))}
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </div>
//           ) : (
//             <div className="flex flex-col items-center justify-center py-12 text-center">
//               <div className="bg-muted rounded-full p-4 mb-4">
//                 <ShoppingCart className="h-10 w-10 text-muted-foreground" />
//               </div>
//               <h3 className="text-lg font-medium mb-1">
//                 {searchTerm || selectedStatus !== "all" || selectedPaymentStatus !== "all"
//                   ? "No matching orders"
//                   : "No orders found"}
//               </h3>
//               <p className="text-muted-foreground max-w-md">
//                 {searchTerm || selectedStatus !== "all" || selectedPaymentStatus !== "all"
//                   ? "Try adjusting your search or filters"
//                   : "Orders will appear here when customers make purchases"}
//               </p>
//             </div>
//           )}

//           {/* Pagination */}
//           {pagination && pagination.totalPages > 1 && (
//             <div className="flex items-center justify-between mt-4">
//               <div className="text-sm text-muted-foreground">
//                 Showing {(currentPage - 1) * (pagination.limit || 20) + 1} to{" "}
//                 {Math.min(currentPage * (pagination.limit || 20), pagination.total)} of {pagination.total} orders
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
//     </div>
//   )
// }
