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
  Star,
  Search,
  X,
  Calendar,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useReviewStore } from "@/store/reviewStore";
import { ReviewsTable } from "@/components/dashboard/review/reviews-table";

interface ReviewFilterState {
  search: string;
  status: string;
  rating: string;
  date_from: string;
  date_to: string;
  sort: string;
  order: string;
}

export default function ReviewsPage() {
  const { reviewInfo, loading, fetchReviews, error } = useReviewStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<ReviewFilterState>({
    search: "",
    status: "all",
    rating: "all",
    date_from: "",
    date_to: "",
    sort: "created_at",
    order: "desc",
  });

  const [appliedFilters, setAppliedFilters] = useState<ReviewFilterState>({
    ...filters,
  });

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (filters.search !== appliedFilters.search) {
        setAppliedFilters((prev) => ({ ...prev, search: filters.search }));
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [filters.search, appliedFilters.search]);

  // Apply other filters
  useEffect(() => {
    const nonSearchFilters = { ...filters, search: appliedFilters.search };
    if (JSON.stringify(nonSearchFilters) !== JSON.stringify(appliedFilters)) {
      setAppliedFilters(nonSearchFilters);
    }
  }, [
    filters.status,
    filters.rating,
    filters.date_from,
    filters.date_to,
    filters.sort,
    filters.order,
  ]);

  // Fetch reviews
  useEffect(() => {
    fetchReviews({
      page: currentPage,
      limit: itemsPerPage,
      ...appliedFilters,
    });
  }, [appliedFilters, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters]);

  const updateFilter = (key: keyof ReviewFilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    const reset = {
      search: "",
      status: "all",
      rating: "all",
      date_from: "",
      date_to: "",
      sort: "created_at",
      order: "desc",
    };
    setFilters(reset);
    setAppliedFilters(reset);
  };

  const hasActiveFilters = () =>
    appliedFilters.search ||
    appliedFilters.status !== "all" ||
    appliedFilters.rating !== "all" ||
    appliedFilters.date_from ||
    appliedFilters.date_to ||
    appliedFilters.sort !== "created_at" ||
    appliedFilters.order !== "desc";

  const totalItems = reviewInfo?.pagination?.total ?? 0;
  const totalPages = reviewInfo?.pagination?.pages ?? 0;
  const hasPrev = reviewInfo?.pagination?.hasPrev ?? false;
  const hasNext = reviewInfo?.pagination?.hasNext ?? false;

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reviews & Ratings
          </h1>
          <p className="text-muted-foreground">
            Monitor and respond to customer reviews
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

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.6</div>
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ₹{
                    star <= 4 ? "text-yellow-400 fill-current" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Star className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <Badge variant="secondary" className="mt-1">
              +12% this month
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Reviews
            </CardTitle>
            <Star className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviewInfo?.reviews.filter((r) => r.status === "pending")
                .length || 0}
            </div>
            <Badge variant="destructive" className="mt-1">
              Needs Response
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              5-Star Reviews
            </CardTitle>
            <Star className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviewInfo?.reviews.filter((r) => r.rating === 5).length || 0}
            </div>
            <Badge variant="secondary" className="mt-1">
              72% of total
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Reviews</span>
            {hasActiveFilters() && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            Latest customer feedback and ratings
            {hasActiveFilters() && ` (₹{totalItems} filtered results)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Sort */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by customer name, product, or review content..."
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
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="status">Status</SelectItem>
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Rating</label>
                <Select
                  value={filters.rating}
                  onValueChange={(value) => updateFilter("rating", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Ratings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
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
          <ReviewsTable
            reviews={reviewInfo?.reviews || []}
            isLoading={loading}
          />

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                  {totalItems} reviews
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
                ? "No reviews found matching your criteria"
                : "No reviews available"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
