"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2, Percent, DollarSign, Truck, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import { useCouponStore } from "@/store/couponStore";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateCouponsDialogProps {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

interface FormData {
  code: string;
  description: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: string;
  minimum_order_amount: string;
  maximum_discount_amount: string;
  usage_limit: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export function CreateCouponDialog({
  onOpenChange,
  open,
}: CreateCouponsDialogProps) {
  const { createCoupon, loading } = useCouponStore();

  const [formData, setFormData] = useState<FormData>({
    code: "",
    description: "",
    type: "percentage",
    value: "",
    minimum_order_amount: "",
    maximum_discount_amount: "",
    usage_limit: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Code validation
    if (!formData.code.trim()) {
      newErrors.code = "Coupon code is required";
    } else if (formData.code.length < 3) {
      newErrors.code = "Coupon code must be at least 3 characters";
    } else if (!/^[A-Z0-9_-]+$/.test(formData.code)) {
      newErrors.code = "Coupon code can only contain uppercase letters, numbers, hyphens, and underscores";
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    // Value validation
    if ((!formData.value || Number(formData.value) <= 0)) {
      if (formData.type != "free_shipping") {
        newErrors.value = "Valid discount value is required";
      }
    } else if (formData.type === "percentage" && Number(formData.value) > 100) {
      newErrors.value = "Percentage cannot exceed 100%";
    } else if (formData.type === "fixed" && Number(formData.value) > 10000) {
      newErrors.value = "Fixed amount cannot exceed $10,000";
    }

    // Minimum order amount validation
    if (formData.minimum_order_amount && Number(formData.minimum_order_amount) < 0) {
      newErrors.minimum_order_amount = "Minimum order amount cannot be negative";
    }

    // Maximum discount amount validation (only for percentage type)
    if (formData.type === "percentage" && formData.maximum_discount_amount) {
      if (Number(formData.maximum_discount_amount) <= 0) {
        newErrors.maximum_discount_amount = "Maximum discount amount must be greater than 0";
      }
    }

    // Usage limit validation
    if (formData.usage_limit && Number(formData.usage_limit) <= 0) {
      newErrors.usage_limit = "Usage limit must be greater than 0";
    }

    // Date validation
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (startDate >= endDate) {
        newErrors.end_date = "End date must be after start date";
      }
    }

    // Check if end date is in the past
    if (formData.end_date && new Date(formData.end_date) < new Date()) {
      newErrors.end_date = "End date cannot be in the past";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const couponData = {
        code: formData.code.toUpperCase().trim(),
        description: formData.description.trim(),
        type: formData.type,
        value: parseFloat(formData.value),
        minimum_order_amount: formData.minimum_order_amount
          ? parseFloat(formData.minimum_order_amount)
          : undefined,
        maximum_discount_amount: formData.maximum_discount_amount
          ? parseFloat(formData.maximum_discount_amount)
          : undefined,
        usage_limit: formData.usage_limit
          ? parseInt(formData.usage_limit)
          : undefined,
        start_date: formData.start_date || new Date().toISOString(),
        end_date: formData.end_date || undefined,
        is_active: formData.is_active,
      };

      await createCoupon(couponData);

      toast.success("Coupon created successfully!", {
        description: `Coupon ${couponData.code} is now available for use`,
      });

      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast.error("Failed to create coupon", {
        description: error.message || "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      type: "percentage",
      value: "",
      minimum_order_amount: "",
      maximum_discount_amount: "",
      usage_limit: "",
      start_date: "",
      end_date: "",
      is_active: true,
    });
    setErrors({});
  };

  const generateCouponCode = () => {
    const prefixes = ["SAVE", "DEAL", "OFFER", "DISC", "PROMO"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 900) + 100;
    const generatedCode = `${prefix}${number}`;

    setFormData({ ...formData, code: generatedCode });
    if (errors.code) {
      setErrors({ ...errors, code: "" });
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
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

  const handleClose = () => {
    if (!loading && !isSubmitting) {
      onOpenChange(false);
      resetForm();
    } else {

    }
  };

  const isFormDisabled = loading || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {/* <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Create Coupon
        </Button>
      </DialogTrigger> */}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create New Coupon
          </DialogTitle>
          <DialogDescription>
            Create a new discount coupon to offer to your customers. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Coupon Code */}
          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm font-medium">
              Coupon Code <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                placeholder="SAVE20"
                className={`flex-1 font-mono ${errors.code ? "border-red-500" : ""}`}
                disabled={isFormDisabled}
                maxLength={20}
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateCouponCode}
                disabled={isFormDisabled}
                className="shrink-0"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Generate
              </Button>
            </div>
            {errors.code && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.code}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="20% off on all items - Limited time offer"
              className={errors.description ? "border-red-500" : ""}
              disabled={isFormDisabled}
              rows={3}
              maxLength={200}
            />
            <div className="flex justify-between items-center">
              {errors.description && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {formData.description.length}/200
              </p>
            </div>
          </div>

          {/* Discount Type and Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Discount Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: "percentage" | "fixed" | "free_shipping") =>
                  handleInputChange("type", value)
                }
                disabled={isFormDisabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Percentage Discount
                    </div>
                  </SelectItem>
                  <SelectItem value="fixed">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Fixed Amount
                    </div>
                  </SelectItem>
                  <SelectItem value="free_shipping">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Free Shipping
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value" className="text-sm font-medium">
                {formData.type === "percentage"
                  ? "Percentage (%)"
                  : formData.type === "fixed"
                    ? "Amount ($)"
                    : "Value"} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => handleInputChange("value", e.target.value)}
                  placeholder={
                    formData.type === "percentage"
                      ? "20"
                      : formData.type === "fixed"
                        ? "10.00"
                        : "0"
                  }
                  className={`${errors.value ? "border-red-500" : ""} ${formData.type === "percentage" ? "pr-8" : ""
                    }`}

                  step={formData.type === "percentage" ? "1" : "0.01"}
                  max={formData.type === "percentage" ? "100" : "10000"}
                  disabled={isFormDisabled || formData.type === "free_shipping"}
                />
                {formData.type === "percentage" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                )}
              </div>
              {errors.value && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.value}
                </p>
              )}
            </div>
          </div>

          {/* Order Constraints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimum_order" className="text-sm font-medium">
                Minimum Order Amount ($)
              </Label>
              <Input
                id="minimum_order"
                type="number"
                value={formData.minimum_order_amount}
                onChange={(e) => handleInputChange("minimum_order_amount", e.target.value)}
                placeholder="50.00"
                className={errors.minimum_order_amount ? "border-red-500" : ""}

                step="0.01"
                disabled={isFormDisabled}
              />
              {errors.minimum_order_amount && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.minimum_order_amount}
                </p>
              )}
            </div>

            {formData.type === "percentage" && (
              <div className="space-y-2">
                <Label htmlFor="maximum_discount" className="text-sm font-medium">
                  Maximum Discount Amount ($)
                </Label>
                <Input
                  id="maximum_discount"
                  type="number"
                  value={formData.maximum_discount_amount}
                  onChange={(e) => handleInputChange("maximum_discount_amount", e.target.value)}
                  placeholder="100.00"
                  className={errors.maximum_discount_amount ? "border-red-500" : ""}

                  step="0.01"
                  disabled={isFormDisabled}
                />
                {errors.maximum_discount_amount && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.maximum_discount_amount}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Cap the maximum discount for percentage-based coupons
                </p>
              </div>
            )}
          </div>

          {/* Usage and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="usage_limit" className="text-sm font-medium">
                Usage Limit
              </Label>
              <Input
                id="usage_limit"
                type="number"
                value={formData.usage_limit}
                onChange={(e) => handleInputChange("usage_limit", e.target.value)}
                placeholder="100"
                className={errors.usage_limit ? "border-red-500" : ""}
                min="1"
                disabled={isFormDisabled}
              />
              {errors.usage_limit && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.usage_limit}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Leave empty for unlimited usage
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-sm font-medium">
                Start Date
              </Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange("start_date", e.target.value)}
                disabled={isFormDisabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-sm font-medium">
                End Date
              </Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange("end_date", e.target.value)}
                className={errors.end_date ? "border-red-500" : ""}
                disabled={isFormDisabled}
              />
              {errors.end_date && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.end_date}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Leave empty for no expiration
              </p>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="is_active" className="text-sm font-medium">
                Activate Coupon
              </Label>
              <p className="text-xs text-muted-foreground">
                {formData.is_active
                  ? "Coupon will be immediately available for use"
                  : "Coupon will be created but not active"
                }
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange("is_active", checked)}
              disabled={isFormDisabled}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isFormDisabled}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isFormDisabled}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Coupon
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
