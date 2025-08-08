"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Eye, Edit, Truck, Search, X, CheckCircle, AlertCircle, Package, CreditCard, Clock, XCircle } from 'lucide-react';
import { formatDate, formatCurrency } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrderStore } from "@/store/orderStore";
import { toast } from "sonner";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  returned: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

const paymentStatusColors = {
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  refunded: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  partially_refunded: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

const statusIcons = {
  pending: <Clock className="h-4 w-4" />,
  processing: <AlertCircle className="h-4 w-4" />,
  shipped: <Truck className="h-4 w-4" />,
  delivered: <CheckCircle className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
  returned: <X className="h-4 w-4" />,
  paid: <CreditCard className="h-4 w-4" />,
  failed: <X className="h-4 w-4" />,
  refunded: <CreditCard className="h-4 w-4" />,
  partially_refunded: <CreditCard className="h-4 w-4" />,
};

interface OrderTableProps {
  orders: any[];
  isLoading: boolean;
}

export function OrdersTable({ orders, isLoading }: OrderTableProps) {
  const { updateOrderStatus, loading: storeLoading } = useOrderStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingOrder, setViewingOrder] = useState<any | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const filteredOrders = orders.filter(
    (order) =>
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_id?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStatus = async () => {
    if (!updatingOrder || !newStatus) return;

    try {
      await updateOrderStatus(updatingOrder._id, newStatus, trackingNumber || undefined);
      toast.success("Order status updated successfully");
      setUpdatingOrder(null);
      setNewStatus("");
      setTrackingNumber("");
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const openStatusDialog = (order: any) => {
    setUpdatingOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.tracking_number || "");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {[...Array(8)].map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(8)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <Package className="h-16 w-16 text-gray-400" />
        <div className="text-center">
          <h3 className="text-lg font-medium">No orders found</h3>
          <p className="text-muted-foreground">
            Orders will appear here once customers start placing them
          </p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* <div className="flex items-center space-x-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search orders by number, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div> */}

        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No orders match your search criteria
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order._id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-mono">{order.order_number || order._id.slice(-8)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.user_id?.name || "Unknown Customer"}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.user_id?.email || "No email"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(order.total_amount || order.total || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`flex items-center gap-1 w-fit ${paymentStatusColors[order.payment_status as keyof typeof paymentStatusColors] ||
                          "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {statusIcons[order.payment_status as keyof typeof statusIcons] ||
                          <AlertCircle className="h-4 w-4" />}
                        <span className="capitalize">{order.payment_status || "unknown"}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`flex items-center gap-1 w-fit ${statusColors[order.status as keyof typeof statusColors] ||
                          "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {statusIcons[order.status as keyof typeof statusIcons] ||
                          <AlertCircle className="h-4 w-4" />}
                        <span className="capitalize">{order.status || "pending"}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(order.created_at || order.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setViewingOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Details</TooltipContent>
                        </Tooltip>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openStatusDialog(order)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Update Status
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setViewingOrder(order)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* View Order Dialog */}
        <Dialog open={!!viewingOrder} onOpenChange={() => setViewingOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Order Details: {viewingOrder?.order_number || viewingOrder?._id?.slice(-8)}
              </DialogTitle>
              <DialogDescription>
                Complete order information and status
              </DialogDescription>
            </DialogHeader>

            {viewingOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Customer Information</h3>
                    <div className="space-y-1 text-sm">
                      <div><strong>Name:</strong> {viewingOrder.user_id?.name || "Unknown"}</div>
                      <div><strong>Email:</strong> {viewingOrder.user_id?.email || "No email"}</div>
                      <div><strong>Phone:</strong> {viewingOrder.user_id?.phone || "No phone"}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Order Summary</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(viewingOrder.subtotal || viewingOrder.total_amount || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>{formatCurrency(viewingOrder.shipping_cost || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatCurrency(viewingOrder.tax_amount || 0)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Total:</span>
                        <span>{formatCurrency(viewingOrder.total_amount || viewingOrder.total || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Status Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Order Status:</strong>
                      <Badge className={`ml-2 ${statusColors[viewingOrder.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}`}>
                        {viewingOrder.status || "pending"}
                      </Badge>
                    </div>
                    <div>
                      <strong>Payment Status:</strong>
                      <Badge className={`ml-2 ${paymentStatusColors[viewingOrder.payment_status as keyof typeof paymentStatusColors] || "bg-gray-100 text-gray-800"}`}>
                        {viewingOrder.payment_status || "pending"}
                      </Badge>
                    </div>
                  </div>
                  {viewingOrder.tracking_number && (
                    <div className="mt-2 text-sm">
                      <strong>Tracking Number:</strong> {viewingOrder.tracking_number}
                    </div>
                  )}
                </div>

                {viewingOrder.items && viewingOrder.items.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Order Items</h3>
                    <div className="space-y-2">
                      {viewingOrder.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <div className="font-medium">{item.product_name || item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × {formatCurrency(item.price)}
                            </div>
                          </div>
                          <div className="font-medium">
                            {formatCurrency(item.quantity * item.price)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewingOrder.shipping_address && (
                  <div>
                    <h3 className="font-medium mb-2">Shipping Address</h3>
                    <div className="text-sm bg-muted p-3 rounded">
                      {typeof viewingOrder.shipping_address === 'string'
                        ? viewingOrder.shipping_address
                        : JSON.stringify(viewingOrder.shipping_address, null, 2)}
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button onClick={() => setViewingOrder(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Status Dialog */}
        <Dialog open={!!updatingOrder} onOpenChange={() => setUpdatingOrder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Order Status</DialogTitle>
              <DialogDescription>
                Update the status for order: {updatingOrder?.order_number || updatingOrder?._id?.slice(-8)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Order Status</Label>
                <select
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned</option>
                </select>
              </div>

              {(newStatus === "shipped" || newStatus === "delivered") && (
                <div>
                  <Label htmlFor="tracking">Tracking Number (Optional)</Label>
                  <Input
                    id="tracking"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setUpdatingOrder(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStatus}
                disabled={storeLoading || !newStatus}
              >
                {storeLoading ? "Updating..." : "Update Status"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
