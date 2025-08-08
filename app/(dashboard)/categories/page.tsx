"use client";

import { CategoriesTable } from "@/components/dashboard/category/categories-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCategoryStore } from "@/store/categoryStore";
import { useUserStore } from "@/store/userStore";
import {
  Package,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Filter,
  X,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CreateCategoryDialog } from "@/components/dashboard/category/create-category-dialog";
import { AddProductsToCategoryDialog } from "@/components/dashboard/category/add-product-to-category";

type FilterType = "all" | "active" | "inactive" | "primary" | "subcategory";
type SortType = "name-asc" | "name-desc" | "created-asc" | "created-desc";

export default function Page() {
  const { user } = useUserStore();
  const { categories, fetchCategories, loading } = useCategoryStore();

  // State management
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortType, setSortType] = useState<SortType>("name-asc");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignProductDialogOpen, setAssignProductDialogOpen] = useState(false)
  useEffect(() => {
    fetchCategories(true);
  }, [fetchCategories]);

  console.log(categories);

  // Enhanced filtering and sorting logic
  const filteredAndSortedCategories = useMemo(() => {
    let filtered = categories.filter((category) => {
      // Search filter
      const matchesSearch =
        category!.display_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (category.description &&
          category.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      // Type filter
      let matchesFilter = true;
      switch (filterType) {
        case "active":
          matchesFilter = category.is_active !== false;
          break;
        case "inactive":
          matchesFilter = category.is_active === false;
          break;
        case "primary":
          matchesFilter = category.is_primary || !category.parent_id;
          break;
        case "subcategory":
          matchesFilter = category.subcategories.length > 0;
          break;
        default:
          matchesFilter = true;
      }

      return matchesSearch && matchesFilter;
    });

    // Sort filtered results
    filtered.sort((a, b) => {
      switch (sortType) {
        case "name-desc":
          return b.display_name.localeCompare(a.display_name);
        case "created-asc":
          return (
            new Date(a.created_at || 0).getTime() -
            new Date(b.created_at || 0).getTime()
          );
        case "created-desc":
          return (
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
          );
        default: // name-asc
          return a.display_name.localeCompare(b.display_name);
      }
    });

    return filtered;
  }, [categories, searchTerm, filterType, sortType]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setSortType("name-asc");
    toast.success("Filters cleared");
  };

  // Calculate stats
  const stats = useMemo(
    () => ({
      total: categories.length,
      active: categories.filter((cat) => cat.is_active !== false).length,
      primary: categories.filter((cat) => cat.is_primary || !cat.parent_id)
        .length,
      inactive: categories.filter((cat) => cat.is_active === false).length,
      subcategories: categories.filter(
        (cat) => !cat.is_primary && cat.parent_id
      ).length,
    }),
    [categories]
  );

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm || filterType !== "all" || sortType !== "name-asc";

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await fetchCategories(true);
      toast.success("Categories refreshed successfully", {
        description: `${categories.length} categories loaded`,
      });
    } catch (error) {
      toast.error("Failed to refresh categories", {
        description: "Please try again or check your connection",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setIsCreateDialogOpen(true);
  };
  const handleEditCategory = (category: any) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };
  const handleAssignProducts = (category: any) => {
    setSelectedCategory(category)
    setAssignProductDialogOpen(true)
  }
  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedCategory(null);
    setAssignProductDialogOpen(false)
  };



  return (
    <div className="space-y-6 bg-background">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Category Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Organize your products with categories and manage your inventory
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="transition-all duration-200"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            onClick={handleCreateCategory}
            className="bg-primary hover:bg-primary/90 transition-colors duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="hover:shadow-md transition-shadow duration-200 bg-background">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Categories
                        </CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.active} active • {stats.inactive} inactive
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow duration-200 bg-background">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Primary Categories
                        </CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.primary}</div>
                        <p className="text-xs text-muted-foreground">
                            Main category groups
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow duration-200 bg-background">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Subcategories
                        </CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.subcategories}</div>
                        <p className="text-xs text-muted-foreground">
                            Child categories
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow duration-200 bg-background">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Products
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Across all categories
                        </p>
                    </CardContent>
                </Card>
            </div> */}

      {/* Main Content Card with Enhanced Filters */}
      <Card className="border-0 shadow-md bg-background">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Categories</CardTitle>
              <CardDescription className="mt-1">
                Manage product categories for your store
                {filteredAndSortedCategories.length !== categories.length && (
                  <span className="ml-2 text-sm">
                    • Showing {filteredAndSortedCategories.length} of{" "}
                    {categories.length}
                  </span>
                )}
              </CardDescription>
            </div>

            <div className="space-y-2 flex justify-center text-center space-x-8">
              <div className="flex items-center">
                {/* <label className="text-sm font-medium">Search</label> */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground  w-4" />
                  <Input
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="default"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full sm:w-auto"
              >
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? "Hide Filters" : "Show Filters"}
                {showFilters ? (
                  <EyeOff className="ml-2 h-4 w-4" />
                ) : (
                  <Eye className="ml-2 h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Enhanced Filter Section */}
          {showFilters && (
            <div className="mt-4 p-4 bg-muted/30 rounded-lg border space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filter Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filter by Type</label>
                  <Select
                    value={filterType}
                    onValueChange={(value: FilterType) => setFilterType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="active">Active Only</SelectItem>
                      <SelectItem value="inactive">Inactive Only</SelectItem>
                      <SelectItem value="primary">
                        Primary Categories
                      </SelectItem>
                      <SelectItem value="subcategory">Subcategories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort by</label>
                  <Select
                    value={sortType}
                    onValueChange={(value: SortType) => setSortType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name-asc">
                        <div className="flex items-center">
                          <SortAsc className="mr-2 h-4 w-4" />
                          Name A-Z
                        </div>
                      </SelectItem>
                      <SelectItem value="name-desc">
                        <div className="flex items-center">
                          <SortDesc className="mr-2 h-4 w-4" />
                          Name Z-A
                        </div>
                      </SelectItem>
                      <SelectItem value="created-desc">Newest First</SelectItem>
                      <SelectItem value="created-asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters & Clear */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                  <span className="text-sm text-muted-foreground">
                    Active filters:
                  </span>

                  {searchTerm && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      Search: "{searchTerm}"
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => setSearchTerm("")}
                      />
                    </Badge>
                  )}

                  {filterType !== "all" && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      Type: {filterType}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => setFilterType("all")}
                      />
                    </Badge>
                  )}

                  {sortType !== "name-asc" && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      Sort: {sortType}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => setSortType("name-asc")}
                      />
                    </Badge>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-6 px-2 text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Results Summary */}
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <div>
              {filteredAndSortedCategories.length === 0 ? (
                <span>No categories found</span>
              ) : (
                <span>
                  Showing {filteredAndSortedCategories.length}
                  {filteredAndSortedCategories.length !== categories.length &&
                    ` of ${categories.length}`}{" "}
                  categories
                </span>
              )}
            </div>

            {filteredAndSortedCategories.length === 0 && hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>

          <CategoriesTable
            categories={filteredAndSortedCategories}
            isLoading={loading}
            onEdit={handleEditCategory}
            onAddProduct={handleAssignProducts}
          // onAddSubcategory={handleAddSubcategory}
          />
        </CardContent>
      </Card>
      <CreateCategoryDialog
        open={isCreateDialogOpen}
        onOpenChange={handleDialogClose}
      />

      <CreateCategoryDialog
        open={isEditDialogOpen}
        onOpenChange={handleDialogClose}
        category={selectedCategory}
      />
      <AddProductsToCategoryDialog
        open={isAssignProductDialogOpen}
        onOpenChange={handleDialogClose}
        category={selectedCategory}
      />
    </div>
  );
}
