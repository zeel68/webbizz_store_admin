"use client";

import { useState } from "react";
import { useStoreAdminStore } from "@/store/storeAdminStore";
import { CategoryDetailsDialog } from "./category-details-dialog";
import { SubcategoryDetailsDialog } from "./subCategoryDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Plus,
  Package,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

interface Subcategory {
  _id: string;
  name: string;
  display_name: string;
  description?: string;
  is_active?: boolean;
  image_url?: string;
  created_at: string;
}

interface Category {
  _id: string;
  name: string;
  display_name: string;
  description?: string;
  image?: string;
  image_url?: string;
  global_category_id?: string;
  parent_id?: string;
  sort_order?: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  products?: string[];
  subcategories?: Subcategory[]; // Ensure this is populated
}

interface CategoriesTableProps {
  categories: Category[];
  isLoading: boolean;
  onEdit?: (category: Category) => void;
  onDelete?: (id: string) => void;
  onView?: (category: Category) => void;
  onAddProduct?: (categoryId: string) => void;
  onAddSubcategory?: (categoryId: string) => void;
}

export function CategoriesTable({
  categories,
  isLoading,
  onEdit,
  onDelete,
  onView,
  onAddProduct,
  onAddSubcategory,
}: CategoriesTableProps) {
  const { deleteCategory } = useStoreAdminStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const [subcatModalOpen, setSubcatModalOpen] = useState(false);
  const [subcatModalCategory, setSubcatModalCategory] =
    useState<Category | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the category "${name}"?`)) {
      setDeletingId(id);
      try {
        await deleteCategory(id);
        toast.success("Category deleted successfully");
        if (onDelete) onDelete(id);
      } catch (error: any) {
        toast.error(error.message || "Failed to delete category");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleEdit = (category: Category) => {
    if (onEdit) onEdit(category);
  };

  const handleView = (category: Category) => {
    setSelectedCategory(category);
    setIsDetailsDialogOpen(true);
  };

  const handleAddProduct = (categoryId: string) => {
    if (onAddProduct) onAddProduct(categoryId);
  };

  const handleAddSubcategory = (categoryId: string) => {
    if (onAddSubcategory) onAddSubcategory(categoryId);
  };

  const handleViewSubcategories = (category: Category) => {
    setSubcatModalCategory(category);
    setSubcatModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center space-x-4 p-4 border rounded"
          >
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-muted rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Tag className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No categories found</h3>
        <p className="text-muted-foreground">
          Create your first category to organize your products
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Subcategory</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category._id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {category.img_url ? (
                      <img
                        src={category.img_url}
                        alt={category.display_name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <Tag className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{category.display_name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {category.description || "No description"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {category.product_count || 0}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {category.subcategories?.length || 0}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      category.is_active !== false ? "default" : "secondary"
                    }
                  >
                    {category.is_active !== false ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {new Date(category.created_at).toLocaleDateString()}
                  </span>
                </TableCell>
                {/*<TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(category)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(category)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Category
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleViewSubcategories(category)}
                      >
                        <Tag className="mr-2 h-4 w-4" />
                        View Subcategories
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleAddProduct(category._id)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAddSubcategory(category._id)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Subcategory
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() =>
                          handleDelete(category._id, category.display_name)
                        }
                        disabled={deletingId === category._id}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>*/}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(category)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => handleAddProduct(category._id)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Product
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAddSubcategory(category._id)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Subcategory
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() =>
                            handleDelete(category._id, category.display_name)
                          }
                          disabled={deletingId === category._id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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

      <CategoryDetailsDialog
        category={selectedCategory}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        onEdit={handleEdit}
        onAddProduct={handleAddProduct}
        onAddSubcategory={handleAddSubcategory}
      />

      <SubcategoryDetailsDialog
        open={subcatModalOpen}
        onOpenChange={setSubcatModalOpen}
        subcategories={subcatModalCategory?.subcategories}
        categoryName={subcatModalCategory?.display_name || ""}
      />
    </>
  );
}
