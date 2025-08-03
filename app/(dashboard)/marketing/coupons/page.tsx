"use client";

import { useEffect, useState, useRef } from "react";
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
  Plus,
  Download,
  Search,
  Filter,
  X,
  Calendar,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CreateCouponDialog } from "@/components/dashboard/coupon/create-coupon-dialog";
import { CouponsTable } from "@/components/dashboard/coupon/coupon-table";
import { useCouponStore } from "@/store/couponStore";

interface CouponFilterState {
  search: string;
  status: string;
  discount_type: string;
  date_from: string;
  date_to: string;
  sort: string;
  order: string;
}

const initialFilters: CouponFilterState = {
  search: "",
  status: "all",
  discount_type: "all",
  date_from: "",
  date_to: "",
  sort: "created_at",
  order: "desc",
};

export default function CouponsPage() {
  const { couponInfo, loading, fetchCoupons, error } = useCouponStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [filters, setFilters] = useState<CouponFilterState>(initialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<CouponFilterState>(initialFilters);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  // Debounce all filter changes
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setAppliedFilters(filters);
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [filters]);

  // Fetch coupons when applied filters change
  useEffect(() => {
    fetchCoupons({
      page: currentPage,
      limit: itemsPerPage,
      ...appliedFilters,
    });
  }, [appliedFilters, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters]);

  const updateFilter = (key: keyof CouponFilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  const hasActiveFilters = () =>
    appliedFilters.search !== initialFilters.search ||
    appliedFilters.status !== initialFilters.status ||
    appliedFilters.discount_type !== initialFilters.discount_type ||
    appliedFilters.date_from !== initialFilters.date_from ||
    appliedFilters.date_to !== initialFilters.date_to ||
    appliedFilters.sort !== initialFilters.sort ||
    appliedFilters.order !== initialFilters.order;

  const totalItems = couponInfo?.pagination?.total ?? 0;
  const totalPages = couponInfo?.pagination?.pages ?? 0;
  const hasPrev = couponInfo?.pagination?.hasPrev ?? false;
  const hasNext = couponInfo?.pagination?.hasNext ?? false;

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
    <div className="space-y-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Coupons & Discounts
          </h1>
          <p className="text-muted-foreground">
            Create and manage discount codes for your store
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
          <CreateCouponDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          />
        </div>
      </div>

      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Active Coupons</span>
            {hasActiveFilters() && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            Manage your discount codes and promotional offers
            {hasActiveFilters() && ` (${totalItems} filtered results)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Sort */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by coupon code or description..."
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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="code">Coupon Code</SelectItem>
                <SelectItem value="discount_value">Discount Value</SelectItem>
                <SelectItem value="usage_count">Usage Count</SelectItem>
                <SelectItem value="end_date">End Date</SelectItem>
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

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => updateFilter("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Discount Type</label>
                <Select
                  value={filters.discount_type}
                  onValueChange={(value) =>
                    updateFilter("discount_type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium flex items-center">
                  <Calendar className="mr-1 h-4 w-4" /> Date From
                </label>
                <Input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => updateFilter("date_from", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium flex items-center">
                  <Calendar className="mr-1 h-4 w-4" /> Date To
                </label>
                <Input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => updateFilter("date_to", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Table */}
          <CouponsTable
            coupons={couponInfo?.coupons || []}
            isLoading={loading}
          />

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                  {totalItems} coupons
                </p>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => setItemsPerPage(Number(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                  {getPaginationNumbers().map((num, idx) =>
                    num === "..." ? (
                      <span
                        key={idx}
                        className="px-2 text-sm text-muted-foreground"
                      >
                        ...
                      </span>
                    ) : (
                      <Button
                        key={num}
                        size="sm"
                        variant={currentPage === num ? "default" : "outline"}
                        onClick={() => handlePageChange(num as number)}
                      >
                        {num}
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
            </div>
          )}

          {totalItems === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              {hasActiveFilters()
                ? "No coupons found matching your criteria"
                : "No coupons available"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
