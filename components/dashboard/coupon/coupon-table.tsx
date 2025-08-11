"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  Calendar,
  Percent,
  DollarSign,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { formatCurrency, formatRelativeTime } from "@/lib/utils"

interface Coupon {
  _id: string
  code: string
  description: string
  type: "percentage" | "fixed" | "free_shipping"
  value: number
  minimum_order_amount?: number
  maximum_discount_amount?: number
  usage_limit?: number
  usage_count: number
  start_date: string
  end_date?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface CouponsTableProps {
  coupons: Coupon[]
  isLoading: boolean
  onView?: (coupon: Coupon) => void
  onEdit?: (coupon: Coupon) => void
  onDelete?: (coupon: Coupon) => void
  onDuplicate?: (coupon: Coupon) => void
  onToggleStatus?: (couponId: string, isActive: boolean) => void
}

export function CouponsTable({
  coupons,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
}: CouponsTableProps) {
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCoupons(coupons.map((coupon) => coupon._id))
    } else {
      setSelectedCoupons([])
    }
  }

  const handleSelectCoupon = (couponId: string, checked: boolean) => {
    if (checked) {
      setSelectedCoupons((prev) => [...prev, couponId])
    } else {
      setSelectedCoupons((prev) => prev.filter((id) => id !== couponId))
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "percentage":
        return <Percent className="h-4 w-4" />
      case "fixed":
        return <DollarSign className="h-4 w-4" />
      case "free_shipping":
        return <Truck className="h-4 w-4" />
      default:
        return <Percent className="h-4 w-4" />
    }
  }

  const getTypeBadge = (type: string, value: number) => {
    const icon = getTypeIcon(type)
    let displayValue = ""
    let colorClass = ""

    switch (type) {
      case "percentage":
        displayValue = `${value}% OFF`
        colorClass = "bg-blue-50 text-blue-700"
        break
      case "fixed":
        displayValue = `${formatCurrency(value)} OFF`
        colorClass = "bg-green-50 text-green-700"
        break
      case "free_shipping":
        displayValue = "FREE SHIPPING"
        colorClass = "bg-purple-50 text-purple-700"
        break
    }

    return (
      <Badge variant="secondary" className={`${colorClass} border-0 font-medium flex items-center gap-1`}>
        {icon}
        {displayValue}
      </Badge>
    )
  }

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date()
    const startDate = new Date(coupon.start_date)
    const endDate = coupon.end_date ? new Date(coupon.end_date) : null

    if (!coupon.is_active) {
      return (
        <Badge variant="secondary" className="text-gray-600 bg-gray-50 border-0 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Inactive
        </Badge>
      )
    }

    if (startDate > now) {
      return (
        <Badge variant="secondary" className="text-blue-600 bg-blue-50 border-0 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Scheduled
        </Badge>
      )
    }

    if (endDate && endDate < now) {
      return (
        <Badge variant="secondary" className="text-red-600 bg-red-50 border-0 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Expired
        </Badge>
      )
    }

    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return (
        <Badge variant="secondary" className="text-orange-600 bg-orange-50 border-0 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Limit Reached
        </Badge>
      )
    }

    return (
      <Badge variant="secondary" className="text-green-600 bg-green-50 border-0 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Active
      </Badge>
    )
  }

  const getUsageProgress = (coupon: Coupon) => {
    if (!coupon.usage_limit) {
      return <div className="text-sm text-muted-foreground">{coupon.usage_count} uses (unlimited)</div>
    }

    const percentage = (coupon.usage_count / coupon.usage_limit) * 100
    console.log("per", percentage);

    return (
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>
            {coupon.usage_count} / {coupon.usage_limit} uses
          </span>
          <span className="text-muted-foreground">{percentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${percentage >= 100 ? "bg-red-500" : percentage >= 80 ? "bg-orange-500" : "bg-green-500"
              }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Skeleton className="h-4 w-4" />
              </TableHead>
              <TableHead>Coupon</TableHead>
              <TableHead>Type & Value</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valid Period</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (coupons.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Coupon</TableHead>
              <TableHead>Type & Value</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valid Period</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <div className="flex flex-col items-center space-y-2">
                  <Percent className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No coupons found</p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <input
                type="checkbox"
                checked={selectedCoupons.length === coupons.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300"
              />
            </TableHead>
            <TableHead>Coupon</TableHead>
            <TableHead>Type & Value</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Valid Period</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon) => (
            <TableRow key={coupon._id} className="hover:bg-muted/50">
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedCoupons.includes(coupon._id)}
                  onChange={(e) => handleSelectCoupon(coupon._id, e.target.checked)}
                  className="rounded border-gray-300"
                />
              </TableCell>

              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm font-semibold bg-muted px-2 py-1 rounded">{coupon.code}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => navigator.clipboard.writeText(coupon.code)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{coupon.description}</p>
                  {coupon.minimum_order_amount && (
                    <p className="text-xs text-muted-foreground">
                      Min order: {formatCurrency(coupon.minimum_order_amount)}
                    </p>
                  )}
                </div>
              </TableCell>

              <TableCell>
                {getTypeBadge(coupon.type, coupon.value)}
                {coupon.maximum_discount_amount && coupon.type === "percentage" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Max: {formatCurrency(coupon.maximum_discount_amount)}
                  </p>
                )}
              </TableCell>

              <TableCell>
                <div className="min-w-[120px]">{getUsageProgress(coupon)}</div>
              </TableCell>

              <TableCell>{getStatusBadge(coupon)}</TableCell>

              <TableCell>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>From: {new Date(coupon.start_date).toLocaleDateString()}</span>
                  </div>
                  {coupon.end_date ? (
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>To: {new Date(coupon.end_date).toLocaleDateString()}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No expiry</span>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-2" />
                  <span>{formatRelativeTime(coupon.created_at)}</span>
                </div>
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {onView && (
                      <DropdownMenuItem onClick={() => onView(coupon)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                    )}

                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(coupon)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Coupon
                      </DropdownMenuItem>
                    )}

                    {onDuplicate && (
                      <DropdownMenuItem onClick={() => onDuplicate(coupon)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate Coupon
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    {onToggleStatus && (
                      <DropdownMenuItem
                        onClick={() => onToggleStatus(coupon._id, !coupon.is_active)}
                        className={coupon.is_active ? "text-orange-600" : "text-green-600"}
                      >
                        {coupon.is_active ? (
                          <>
                            <XCircle className="mr-2 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(coupon)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Coupon
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Bulk Actions */}
      {selectedCoupons.length > 0 && (
        <div className="border-t bg-muted/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedCoupons.length} coupon{selectedCoupons.length > 1 ? "s" : ""} selected
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Export Selected
              </Button>
              <Button variant="outline" size="sm">
                <CheckCircle className="mr-2 h-4 w-4" />
                Activate Selected
              </Button>
              <Button variant="outline" size="sm">
                <XCircle className="mr-2 h-4 w-4" />
                Deactivate Selected
              </Button>
              <Button variant="destructive" size="sm">
                Delete Selected
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
