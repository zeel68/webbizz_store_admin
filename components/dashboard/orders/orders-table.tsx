"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MoreHorizontal, Eye, Edit, Truck, Search, X, CheckCircle,
  AlertCircle, Package, CreditCard, Clock, XCircle, Loader2,
  MapPin,
  Phone
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrderStore } from "@/store/orderStore";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

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
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  const [viewingOrder, setViewingOrder] = useState<any | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user_id?.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter ? order.status === statusFilter : true;
      const matchesPayment = paymentFilter ? order.payment_status === paymentFilter : true;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  const handleUpdateStatus = async () => {
    if (!updatingOrder || !newStatus) return;
    if ((newStatus === "shipped" || newStatus === "delivered") && !trackingNumber.trim()) {
      toast.error("Tracking number is required for shipped or delivered orders");
      return;
    }
    try {
      await updateOrderStatus(updatingOrder._id, newStatus, trackingNumber || undefined);
      toast.success("Order status updated successfully");
      setUpdatingOrder(null);
      setNewStatus("");
      setTrackingNumber("");
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const openStatusDialog = (order: any) => {
    setUpdatingOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.tracking_number || "");
  };

  const formatDate = (date: string) => {
    return date ? format(new Date(date), "MMM dd, yyyy hh:mm a") : "—";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {[...Array(7)].map((_, i) => (
                  <TableHead key={i}><Skeleton className="h-4 w-24" /></TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(7)].map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
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
        <h3 className="text-lg font-medium">No orders found</h3>
        <p className="text-muted-foreground">
          Orders will appear here once customers start placing them
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div> */}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-md p-2">
            <option value="">All Statuses</option>
            {Object.keys(statusColors).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="border rounded-md p-2">
            <option value="">All Payments</option>
            {Object.keys(paymentStatusColors).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {(searchTerm || statusFilter || paymentFilter) && (
            <Button variant="ghost" onClick={() => { setSearchTerm(""); setStatusFilter(""); setPaymentFilter(""); }}>
              Clear Filters
            </Button>
          )}
        </div>

        {/* Table */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No orders match your criteria</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order._id} className="hover:bg-muted/50">
                    <TableCell className="font-mono flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {order.order_number || order._id.slice(-8)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.user_id?.name || "Unknown"}</div>
                      <div className="text-sm text-muted-foreground">{order.user_id?.email || "—"}</div>
                    </TableCell>
                    <TableCell>{formatCurrency(order.total_amount || order.total || 0)}</TableCell>
                    <TableCell>
                      <Badge className={`gap-1 px-3 py-1 ${paymentStatusColors[order.payment_status] || "bg-gray-100"}`}>
                        {statusIcons[order.payment_status] || <AlertCircle className="h-4 w-4" />}
                        <span className="capitalize">{order.payment_status || "unknown"}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`gap-1 px-3 py-1 ${statusColors[order.status] || "bg-gray-100"}`}>
                        {statusIcons[order.status] || <AlertCircle className="h-4 w-4" />}
                        <span className="capitalize">{order.status || "pending"}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell className="text-right flex justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => setViewingOrder(order)}>
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
                            <Edit className="mr-2 h-4 w-4" /> Update Status
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* View Order Dialog */}
        <Dialog open={!!viewingOrder} onOpenChange={() => setViewingOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order #{viewingOrder?.order_number || viewingOrder?._id?.slice(-8)}</DialogTitle>
              <DialogDescription>Placed on {formatDate(viewingOrder?.created_at)}</DialogDescription>
            </DialogHeader>
            {viewingOrder && (
              <div className="space-y-6">
                <div className="border p-4 rounded">
                  <h3 className="font-medium mb-2">Customer</h3>
                  <p>{viewingOrder.user_id?.name || "Unknown"}</p>
                  <p>{viewingOrder.user_id?.email || "—"}</p>
                  <p>{viewingOrder.user_id?.phone || "—"}</p>
                </div>
                <div className="border p-4 rounded">
                  <h3 className="font-medium mb-2">Items</h3>
                  {viewingOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between border-b py-2">
                      <span>{item.product_name || item.name} × {item.quantity}</span>
                      <span>{formatCurrency(item.quantity * item.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="border p-4 rounded">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(viewingOrder.subtotal || 0)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>{formatCurrency(viewingOrder.shipping_cost || 0)}</span></div>
                  <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(viewingOrder.tax_amount || 0)}</span></div>
                  <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span>{formatCurrency(viewingOrder.total || 0)}</span></div>
                </div>
                {viewingOrder.shipping_address && (
                  <div className="mt-6 rounded-lg border bg-muted/30 p-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      Shipping Address
                    </h3>
                    {typeof viewingOrder.shipping_address === "string" ? (
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {viewingOrder.shipping_address}
                      </p>
                    ) : (
                      <div className="text-sm text-muted-foreground space-y-1">
                        {viewingOrder.shipping_address.name && <p className="font-medium">{viewingOrder.shipping_address.name}</p>}
                        {viewingOrder.shipping_address.street && <p>{viewingOrder.shipping_address.street}</p>}
                        {(viewingOrder.shipping_address.city || viewingOrder.shipping_address.state || viewingOrder.shipping_address.zip) && (
                          <p>
                            {viewingOrder.shipping_address.city}, {viewingOrder.shipping_address.state} {viewingOrder.shipping_address.zip}
                          </p>
                        )}
                        {viewingOrder.shipping_address.country && <p>{viewingOrder.shipping_address.country}</p>}
                        {viewingOrder.shipping_address.phone && (
                          <p className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-muted-foreground" /> {viewingOrder.shipping_address.phone}
                          </p>
                        )}
                      </div>
                    )}
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
                Order #{updatingOrder?.order_number || updatingOrder?._id?.slice(-8)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Order Status</Label>
                <select id="status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full mt-1 p-2 border rounded-md">
                  {Object.keys(statusColors).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {(newStatus === "shipped" || newStatus === "delivered") && (
                <div>
                  <Label htmlFor="tracking">Tracking Number</Label>
                  <Input id="tracking" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Enter tracking number" />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUpdatingOrder(null)}>Cancel</Button>
              <Button onClick={handleUpdateStatus} disabled={storeLoading || !newStatus}>
                {storeLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
