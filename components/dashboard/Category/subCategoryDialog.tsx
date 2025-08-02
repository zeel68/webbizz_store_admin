"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tag, Edit, Plus, Package, Calendar, Eye } from "lucide-react";

interface Subcategory {
  _id: string;
  display_name: string;
  description?: string;
  is_active?: boolean;
  img_url?: string;
  createdAt: string;
  product_count: number;
  config?: {
    filters: any[];
    attributes: any[];
  };
}

interface SubcategoryDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subcategories: Subcategory[] | undefined;
  categoryName: string;
  onEdit?: (subcategory: Subcategory) => void;
  onAddProduct?: (subcategoryId: string) => void;
}

export function SubcategoryDetailsDialog({
  open,
  onOpenChange,
  subcategories,
  categoryName,
  onEdit,
  onAddProduct,
}: SubcategoryDetailsDialogProps) {
  const handleEdit = (subcategory: Subcategory) => {
    if (onEdit) onEdit(subcategory);
  };

  const handleAddProduct = (subcategoryId: string) => {
    if (onAddProduct) onAddProduct(subcategoryId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Subcategories of {categoryName}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {!subcategories || subcategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted rounded-full p-4 mb-4">
                <Tag className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">
                No subcategories found
              </h3>
              <p className="text-muted-foreground max-w-md">
                This category doesn't have any subcategories yet. Create
                subcategories to better organize your products.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              {subcategories.map((sub) => (
                <Card
                  key={sub._id}
                  className="group hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {sub.img_url ? (
                        <img
                          src={sub.img_url || "/placeholder.svg"}
                          alt={sub.display_name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                          <Tag className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-lg truncate">
                            {sub.display_name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                sub.is_active !== false
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {sub.is_active !== false ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {sub.description || "No description"}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Package className="h-4 w-4" />
                              <span>{sub.product_count || 0} products</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(sub.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {sub.config && (
                              <div className="flex items-center space-x-1">
                                <Eye className="h-4 w-4" />
                                <span>
                                  {(sub.config.filters?.length || 0) +
                                    (sub.config.attributes?.length || 0)}{" "}
                                  configs
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(sub)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddProduct(sub._id)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Product
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
