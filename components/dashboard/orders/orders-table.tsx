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
import { MoreHorizontal, Eye, Edit, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

// Mock data - replace with actual API call
// const orders = [
//     {
//         id: "ORD-001",
//         customer: "John Doe",
//         email: "john@example.com",
//         total: 299.99,
//         status: "pending",
//         date: "2024-01-15",
//         items: 3,
//     },
//     {
//         id: "ORD-002",
//         customer: "Jane Smith",
//         email: "jane@example.com",
//         total: 149.5,
//         status: "shipped",
//         date: "2024-01-14",
//         items: 2,
//     },
//     {
//         id: "ORD-003",
//         customer: "Bob Johnson",
//         email: "bob@example.com",
//         total: 89.99,
//         status: "delivered",
//         date: "2024-01-13",
//         items: 1,
//     },
//     {
//         id: "ORD-004",
//         customer: "Alice Brown",
//         email: "alice@example.com",
//         total: 199.99,
//         status: "cancelled",
//         date: "2024-01-12",
//         items: 2,
//     },
// ]

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};
interface OrderTableProps {
  orders: iOrder[];
  isLoading: boolean;
}
export function OrdersTable({ orders, isLoading }: OrderTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_id.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_id.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log(orders[0]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Shipping Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order: iOrder) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.user_id.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.user_id.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{order.items.length}</TableCell>
                <TableCell>${order.total_amount}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      statusColors[
                        order.payment_status as keyof typeof statusColors
                      ]
                    }
                  >
                    {order.payment_status}
                  </Badge>
                </TableCell>
                <TableCell>{order.shipping_method}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      statusColors[order.status as keyof typeof statusColors]
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(order.created_at)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Order
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Truck className="mr-2 h-4 w-4" />
                        Update Status
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
