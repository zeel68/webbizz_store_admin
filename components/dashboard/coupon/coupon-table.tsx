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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/lib/utils";
import { MoreHorizontal, Trash2, Copy, ToggleLeft, ToggleRight, Percent, DollarSign, Truck, Calendar, Users, TrendingUp } from 'lucide-react';
import { toast } from "sonner";
import { useCouponStore } from "@/store/couponStore";
import { Skeleton } from "@/components/ui/skeleton";

interface CouponTableProps {
  coupons: iCoupon[];
  isLoading: boolean;
}

export function CouponsTable({ coupons, isLoading }: CouponTableProps) {
  const {
    updateCoupon,
    deleteCoupon,
    duplicateCoupon,
    deactivateCoupon,
    loading: storeLoading,
  } = useCouponStore();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);

  const handleToggleStatus = async (coupon: any) => {
    try {
      await updateCoupon(coupon._id, { is_active: !coupon.is_active });
      toast.success(
        `Coupon ${coupon.is_active ? "deactivated" : "activated"} successfully`
      );
    } catch (error) {
      toast.error(`Failed to update coupon status`);
    }
  };

  const handleDeleteCoupon = async () => {
    if (!selectedCoupon) return;

    try {
      await deleteCoupon(selectedCoupon._id);
      toast.success("Coupon deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedCoupon(null);
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  const handleDeactivateCoupon = async (id: string) => {
    try {
      await deactivateCoupon(id);
      toast.success("Coupon deactivated successfully");
    } catch (error) {
      toast.error("Failed to deactivate coupon");
    }
  };

  const handleDuplicateCoupon = async (coupon: any) => {
    const newCode = `${coupon.code}_COPY_${Date.now().toString().slice(-4)}`;
    try {
      await duplicateCoupon(coupon._id, newCode);
      toast.success("Coupon duplicated successfully");
    } catch (error) {
      toast.error("Failed to duplicate coupon");
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied to clipboard");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "percentage":
        return <Percent className="h-4 w-4" />;
      case "fixed":
        return <DollarSign className="h-4 w-4" />;
      case "free_shipping":
        return <Truck className="h-4 w-4" />;
      default:
        return <Percent className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "percentage":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <Percent className="h-3 w-3 mr-1" />
            Percentage
          </Badge>
        );
      case "fixed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <DollarSign className="h-3 w-3 mr-1" />
            Fixed Amount
          </Badge>
        );
      case "free_shipping":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
            <Truck className="h-3 w-3 mr-1" />
            Free Shipping
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (coupon: any) => {
    const isExpired = coupon.end_date && new Date(coupon.end_date) < new Date();
    const isActive = coupon.is_active !== false;

    if (isExpired) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Expired
        </Badge>
      );
    }

    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1">
        <ToggleLeft className="h-3 w-3" />
        Inactive
      </Badge>
    );
  };

  const formatDiscountValue = (coupon: any) => {
    switch (coupon.type) {
      case "percentage":
        return `${coupon.value}%`;
      case "fixed":
        return formatCurrency(coupon.value);
      case "free_shipping":
        return "Free Shipping";
      default:
        return coupon.value?.toString() || "N/A";
    }
  };

  const getUsageProgress = (coupon: any) => {
    if (!coupon.usage_limit) return 0;
    return Math.min((coupon.usage_count / coupon.usage_limit) * 100, 100);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {[...Array(7)].map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(7)].map((_, j) => (
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

  return (
    <>
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Percent className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No coupons found</p>
                    <p className="text-sm text-muted-foreground">
                      Create your first coupon to start offering discounts
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon._id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium font-mono">{coupon.code}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCopyCode(coupon.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {coupon.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getTypeBadge(coupon.type)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {formatDiscountValue(coupon)}
                      </p>
                      {coupon.minimum_order_amount && (
                        <p className="text-sm text-muted-foreground">
                          Min: {formatCurrency(coupon.minimum_order_amount)}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {coupon.usage_count || 0}
                        </span>
                        <span>{coupon.usage_limit || "∞"}</span>
                      </div>
                      {coupon.usage_limit && (
                        <Progress
                          value={getUsageProgress(coupon)}
                          className="h-2"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {coupon.end_date ? (
                      <div>
                        <p className="text-sm flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(coupon.end_date).toLocaleDateString()}
                        </p>
                        {new Date(coupon.end_date) < new Date() && (
                          <p className="text-xs text-red-600">Expired</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No expiry</p>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(coupon)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleCopyCode(coupon.code)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Code
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(coupon)}
                          disabled={storeLoading}
                        >
                          {coupon.is_active ? (
                            <>
                              <ToggleLeft className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <ToggleRight className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicateCoupon(coupon)}
                          disabled={storeLoading}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedCoupon(coupon);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              coupon "{selectedCoupon?.code}" and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCoupon}
              className="bg-red-600 hover:bg-red-700"
              disabled={storeLoading}
            >
              {storeLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
