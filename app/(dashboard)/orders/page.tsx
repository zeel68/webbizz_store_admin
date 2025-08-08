"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Calendar,
} from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import { OrdersTable } from "@/components/dashboard/orders/orders-table";

interface Order {
  _id: string;
  order_number: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  user_id: {
    name: string;
    email: string;
    phone: string;
  };
}

interface FilterState {
  search: string;
  status: string;
  payment_status: string;
  date_from: string;
  date_to: string;
  sort: string;
  order: string;
}

export default function OrdersPage() {
  const { ordersInfo, loading, error, fetchOrders } = useOrderStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    payment_status: "all",
    date_from: "",
    date_to: "",
    sort: "created_at",
    order: "desc",
  });

  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    search: "",
    status: "all",
    payment_status: "all",
    date_from: "",
    date_to: "",
    sort: "created_at",
    order: "desc",
  });

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.search !== appliedFilters.search) {
        setAppliedFilters((prev) => ({ ...prev, search: filters.search }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.search, appliedFilters.search]);

  // Apply filters immediately for non-search fields
  useEffect(() => {
    const nonSearchFilters = {
      status: filters.status,
      payment_status: filters.payment_status,
      date_from: filters.date_from,
      date_to: filters.date_to,
      sort: filters.sort,
      order: filters.order,
    };

    const nonSearchApplied = {
      status: appliedFilters.status,
      payment_status: appliedFilters.payment_status,
      date_from: appliedFilters.date_from,
      date_to: appliedFilters.date_to,
      sort: appliedFilters.sort,
      order: appliedFilters.order,
    };

    if (JSON.stringify(nonSearchFilters) !== JSON.stringify(nonSearchApplied)) {
      setAppliedFilters((prev) => ({ ...prev, ...nonSearchFilters }));
    }
  }, [
    filters.status,
    filters.payment_status,
    filters.date_from,
    filters.date_to,
    filters.sort,
    filters.order,
  ]);

  // Fetch orders when applied filters or pagination changes
  useEffect(() => {
    const queryParams = {
      page: currentPage,
      limit: itemsPerPage,
      ...appliedFilters,
    };
    fetchOrders(queryParams);
  }, [appliedFilters, currentPage, itemsPerPage, fetchOrders]);

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    const defaultFilters = {
      search: "",
      status: "all",
      payment_status: "all",
      date_from: "",
      date_to: "",
      sort: "created_at",
      order: "desc",
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const hasActiveFilters = () => {
    return (
      appliedFilters.search ||
      appliedFilters.status !== "all" ||
      appliedFilters.payment_status !== "all" ||
      appliedFilters.date_from ||
      appliedFilters.date_to ||
      appliedFilters.sort !== "created_at" ||
      appliedFilters.order !== "desc"
    );
  };

  const totalItems = ordersInfo?.pagination?.total ?? 0;
  const totalPages = ordersInfo?.pagination?.totalPages ?? 0;
  const hasNext = ordersInfo?.pagination?.hasNext ?? false;
  const hasPrev = ordersInfo?.pagination?.hasPrev ?? false;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPaginationNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all your store orders
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Orders</span>
            {hasActiveFilters() && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            View and manage all orders from your store
            {hasActiveFilters() && ` (₹{totalItems} filtered results)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Basic Search and Sort */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by order number, customer name, or email..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.sort}
              onValueChange={(value) => updateFilter("sort", value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="updated_at">Date Updated</SelectItem>
                <SelectItem value="total_amount">Amount</SelectItem>
                <SelectItem value="order_number">Order Number</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="payment_status">Payment Status</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.order}
              onValueChange={(value) => updateFilter("order", value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="mb-6 border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">Advanced Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Order Status</label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) => updateFilter("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="returned">Returned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Payment Status
                    </label>
                    <Select
                      value={filters.payment_status}
                      onValueChange={(value) =>
                        updateFilter("payment_status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Payment Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          All Payment Statuses
                        </SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                        <SelectItem value="partially_refunded">
                          Partially Refunded
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      Date From
                    </label>
                    <Input
                      type="date"
                      value={filters.date_from}
                      onChange={(e) =>
                        updateFilter("date_from", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      Date To
                    </label>
                    <Input
                      type="date"
                      value={filters.date_to}
                      onChange={(e) => updateFilter("date_to", e.target.value)}
                    />
                  </div>
                </div>

                {/* Applied Filters Indicator */}
                {hasActiveFilters() && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      Active Filters:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {appliedFilters.search && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs">
                          Search: "{appliedFilters.search}"
                        </span>
                      )}
                      {appliedFilters.status !== "all" && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs">
                          Status: {appliedFilters.status}
                        </span>
                      )}
                      {appliedFilters.payment_status !== "all" && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-yellow-50 text-yellow-700 text-xs">
                          Payment: {appliedFilters.payment_status}
                        </span>
                      )}
                      {appliedFilters.date_from && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs">
                          From: {appliedFilters.date_from}
                        </span>
                      )}
                      {appliedFilters.date_to && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs">
                          To: {appliedFilters.date_to}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <OrdersTable orders={ordersInfo?.orders || []} isLoading={loading} />

          {totalItems > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                  {totalItems} orders
                </p>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => setItemsPerPage(Number(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPrev}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center space-x-1">
                    {getPaginationNumbers().map((pageNum, index) =>
                      pageNum === "..." ? (
                        <span
                          key={index}
                          className="px-2 py-1 text-sm text-muted-foreground"
                        >
                          ...
                        </span>
                      ) : (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNum as number)}
                        >
                          {pageNum}
                        </Button>
                      )
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNext}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {totalItems === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {hasActiveFilters()
                  ? "No orders found matching your criteria"
                  : "No orders available"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
