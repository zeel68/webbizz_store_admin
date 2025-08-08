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
  Percent,
  AlertCircle,
  Sparkles,
  PlusIcon,
} from "lucide-react";
import { CreateCouponDialog } from "@/components/dashboard/coupon/create-coupon-dialog";
import { CouponsTable } from "@/components/dashboard/coupon/coupon-table";
import { useCouponStore } from "@/store/couponStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface CouponFilterState {
  search: string;
  status: string;
  type: string;
  date_from: string;
  date_to: string;
  sort: string;
  order: string;
}

const initialFilters: CouponFilterState = {
  search: "",
  status: "all",
  type: "all",
  date_from: "",
  date_to: "",
  sort: "created_at",
  order: "desc",
};

export default function CouponsPage() {
  const { couponInfo, loading, fetchCoupons, error, clearError } = useCouponStore();

  // keep a stable reference to fetchCoupons to avoid effect churn
  const fetchCouponsRef = useRef(fetchCoupons);
  useEffect(() => {
    fetchCouponsRef.current = fetchCoupons;
  }, [fetchCoupons]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [filters, setFilters] = useState<CouponFilterState>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<CouponFilterState>(initialFilters);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce ONLY the search input. Non-search filters apply immediately for better UX.
  useEffect(() => {
    // debounce search field only
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      // only update appliedFilters.search — other filters are updated immediately
      setAppliedFilters(prev => ({ ...prev, search: filters.search }));
      setCurrentPage(1);
    }, 500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  // Whenever appliedFilters, pagination or page size change -> fetch
  useEffect(() => {
    // build query params
    const queryParams: Record<string, any> = {
      page: currentPage,
      limit: itemsPerPage,
      ...appliedFilters,
    };

    // remove empty or "all" values
    Object.keys(queryParams).forEach((key) => {
      const val = queryParams[key];
      if (val === "" || val === "all" || val === undefined || val === null) {
        delete queryParams[key];
      }
    });

    // call the latest fetchCoupons
    fetchCouponsRef.current(queryParams);
  }, [appliedFilters, currentPage, itemsPerPage]);

  const updateFilter = (key: keyof CouponFilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));

    // if it's not the search field, apply immediately
    if (key !== "search") {
      setAppliedFilters((prev) => {
        const next = { ...prev, [key]: value };
        // normalize "all" into empty so backend doesn't get "all"
        if (value === "all" || value === "") {
          delete next[key];
        }
        return next as CouponFilterState;
      });
      setCurrentPage(1);
    }
  };

  const clearFilters = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return Object.keys(appliedFilters).some((key) => {
      const k = key as keyof CouponFilterState;
      return (
        appliedFilters[k] !== initialFilters[k] &&
        appliedFilters[k] !== "" &&
        appliedFilters[k] !== "all"
      );
    });
  };

  const getActiveFiltersCount = () => {
    return Object.keys(appliedFilters).filter((key) => {
      const k = key as keyof CouponFilterState;
      return (
        appliedFilters[k] !== initialFilters[k] &&
        appliedFilters[k] !== "" &&
        appliedFilters[k] !== "all"
      );
    }).length;
  };

  const removeAppliedFilter = (key: keyof CouponFilterState) => {
    setFilters((prev) => ({ ...prev, [key]: initialFilters[key] }));
    setAppliedFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next as CouponFilterState;
    });
    setCurrentPage(1);
  };

  const totalItems = couponInfo?.pagination?.total ?? 0;
  const totalPages = couponInfo?.pagination?.pages ?? 0;
  const hasPrev = couponInfo?.pagination?.hasPrev ?? false;
  const hasNext = couponInfo?.pagination?.hasNext ?? false;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= Math.max(1, totalPages)) {
      setCurrentPage(page);
    }
  };

  const getPaginationNumbers = () => {
    if (totalPages <= 1) return [1];

    const delta = 2;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];

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
    } else {
      if (!rangeWithDots.includes(totalPages)) rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const exportCoupons = () => {
    const coupons = couponInfo?.coupons ?? [];
    if (!coupons.length) return;

    const headers = Object.keys(coupons[0]);
    const rows = coupons.map((c: Record<string, any>) =>
      headers
        .map((h) => {
          const cell = c[h] ?? "";
          // escape quotes
          return `"${String(cell).replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "coupons.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleOpen = (state: boolean) => {
    console.log("open", state);

    setIsCreateDialogOpen(state)
  }

  return (
    <div className="space-y-6 bg-background min-h-screen p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Percent className="h-8 w-8" />
            Coupons & Discounts
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage discount codes for your store
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
            {hasActiveFilters() && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 w-5 p-0 text-xs transition-transform duration-150 ease-in-out"
              >
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={exportCoupons}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => { handleOpen(true) }}>
            <PlusIcon className="h-5 w-5 " />

            Create Coupon
          </Button>
          <CreateCouponDialog open={isCreateDialogOpen} onOpenChange={handleOpen} />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between w-full">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={clearError}>
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Manage Coupons</span>
            {hasActiveFilters() && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear All Filters
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            {totalItems > 0 ? (
              <>
                {hasActiveFilters()
                  ? `Showing ${totalItems} filtered results`
                  : `Manage your ${totalItems} discount codes and promotional offers`}
              </>
            ) : (
              "Create your first coupon to start offering discounts"
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by coupon code or description..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Select
                value={filters.sort}
                onValueChange={(value) => updateFilter("sort", value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="code">Coupon Code</SelectItem>
                  <SelectItem value="value">Discount Value</SelectItem>
                  <SelectItem value="usage_count">Usage Count</SelectItem>
                  <SelectItem value="end_date">End Date</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.order}
                onValueChange={(value) => updateFilter("order", value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => updateFilter("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Discount Type</label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => updateFilter("type", value)}
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

              {/* <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Calendar className="mr-1 h-4 w-4" /> Date From
                </label>
                <Input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => updateFilter("date_from", e.target.value)}
                />
              </div> */}

              {/* <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Calendar className="mr-1 h-4 w-4" /> Date To
                </label>
                <Input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => updateFilter("date_to", e.target.value)}
                />
              </div> */}
            </div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters() && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Active filters:</span>
              {Object.entries(appliedFilters).map(([key, value]) => {
                if (
                  value &&
                  value !== "all" &&
                  value !== initialFilters[key as keyof CouponFilterState]
                ) {
                  return (
                    <Badge
                      key={key}
                      variant="secondary"
                      className="flex items-center gap-2 px-2 py-1"
                    >
                      <span className="text-xs">
                        {key.replace(/_/g, " ")}: {value}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-transparent"
                        onClick={() => removeAppliedFilter(key as keyof CouponFilterState)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                }
                return null;
              })}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <CouponsTable coupons={couponInfo?.coupons || []} isLoading={loading} />
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-
                  {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} coupons
                </p>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
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

              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center gap-1 border rounded-md p-1 bg-background">
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

                    <div className="flex items-center space-x-1 px-2">
                      {getPaginationNumbers().map((num, idx) =>
                        num === "..." ? (
                          <span key={idx} className="px-2 text-sm text-muted-foreground">
                            ...
                          </span>
                        ) : (
                          <Button
                            key={String(num)}
                            size="sm"
                            variant={currentPage === num ? "default" : "outline"}
                            onClick={() => handlePageChange(Number(num))}
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
            </div>
          )}

          {/* Empty State */}
          {/* {totalItems === 0 && !loading && (
            <div className="text-center py-12">
              <Percent className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {hasActiveFilters() ? "No coupons found" : "No coupons yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters()
                  ? "Try adjusting your filters to find what you're looking for"
                  : "Create your first coupon to start offering discounts to your customers"}
              </p>
              {!hasActiveFilters() && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Coupon
                </Button>
              )}
            </div>
          )} */}
        </CardContent>
      </Card>
    </div>
  );
}
