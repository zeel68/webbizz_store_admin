"use client";

import type React from "react";

import { useState } from "react";

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
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCouponStore } from "@/store/couponStore";

interface CreateCouponsDialogProps {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
}
export function CreateCouponDialog({
  onOpenChange,
  open,
}: CreateCouponsDialogProps) {
  const { createCoupon, loading } = useCouponStore();
  // const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type: "percentage",
    value: "",
    minimum_order_amount: "",
    usage_limit: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.description || !formData.value) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const couponData = {
        ...formData,
        value: Number.parseFloat(formData.value),
        minimum_order_amount: formData.minimum_order_amount
          ? Number.parseFloat(formData.minimum_order_amount)
          : undefined,
        usage_limit: formData.usage_limit
          ? Number.parseInt(formData.usage_limit)
          : undefined,
        start_date: formData.start_date || new Date().toISOString(),
        end_date: formData.end_date || undefined,
      };
      console.log(couponData);

      await createCoupon(couponData);
      toast({
        title: "Success",
        description: "Coupon created successfully",
      });
      onOpenChange(false);
      // setOpen(false);
      setFormData({
        code: "",
        description: "",
        type: "percentage",
        value: "",
        minimum_order_amount: "",
        usage_limit: "",
        start_date: "",
        end_date: "",
        is_active: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create coupon",
        variant: "destructive",
      });
    }
  };

  const generateCouponCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code: result });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Coupon
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Coupon</DialogTitle>
          <DialogDescription>
            Create a new discount coupon for your customers
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Code *
            </Label>
            <div className="col-span-3 flex gap-2">
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                placeholder="SAVE20"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateCouponCode}
              >
                Generate
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="20% off on all items"
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type *
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage Discount</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
                <SelectItem value="free_shipping">Free Shipping</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">
              {formData.type === "percentage"
                ? "Percentage *"
                : formData.type === "fixed"
                ? "Amount *"
                : "Value *"}
            </Label>
            <Input
              id="value"
              type="number"
              value={formData.value}
              onChange={(e) =>
                setFormData({ ...formData, value: e.target.value })
              }
              placeholder={
                formData.type === "percentage"
                  ? "20"
                  : formData.type === "fixed"
                  ? "10.00"
                  : "0"
              }
              className="col-span-3"
              min="0"
              step={formData.type === "percentage" ? "1" : "0.01"}
              max={formData.type === "percentage" ? "100" : undefined}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="minimum_order" className="text-right">
              Min Order
            </Label>
            <Input
              id="minimum_order"
              type="number"
              value={formData.minimum_order_amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minimum_order_amount: e.target.value,
                })
              }
              placeholder="50.00"
              className="col-span-3"
              min="0"
              step="0.01"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="usage_limit" className="text-right">
              Usage Limit
            </Label>
            <Input
              id="usage_limit"
              type="number"
              value={formData.usage_limit}
              onChange={(e) =>
                setFormData({ ...formData, usage_limit: e.target.value })
              }
              placeholder="100"
              className="col-span-3"
              min="1"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start_date" className="text-right">
              Start Date
            </Label>
            <Input
              id="start_date"
              type="datetime-local"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end_date" className="text-right">
              End Date
            </Label>
            <Input
              id="end_date"
              type="datetime-local"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="is_active" className="text-right">
              Active
            </Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Coupon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
