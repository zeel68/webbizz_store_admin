"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Star,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
} from "lucide-react"
import { formatRelativeTime, getInitials, getStatusColor, truncateText } from "@/lib/utils"

interface Review {
  _id: string
  user_id: {
    name: string
    email: string
    profile_image?: string
  }
  product_id: {
    name: string
    images?: string[]
  }
  rating: number
  comment: string
  status: "pending" | "approved" | "rejected"
  helpful_count: number
  verified_purchase?: boolean
  created_at: string
}

interface ReviewsTableProps {
  reviews: Review[]
  isLoading: boolean
  onView?: (review: Review) => void
  onEdit?: (review: Review) => void
  onDelete?: (review: Review) => void
  onApprove?: (reviewId: string) => void
  onReject?: (reviewId: string) => void
}

export function ReviewsTable({ reviews, isLoading, onView, onEdit, onDelete, onApprove, onReject }: ReviewsTableProps) {
  const [selectedReviews, setSelectedReviews] = useState<string[]>([])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReviews(reviews.map((review) => review._id))
    } else {
      setSelectedReviews([])
    }
  }

  const handleSelectReview = (reviewId: string, checked: boolean) => {
    if (checked) {
      setSelectedReviews((prev) => [...prev, reviewId])
    } else {
      setSelectedReviews((prev) => prev.filter((id) => id !== reviewId))
    }
  }

  const getStatusBadge = (status: string) => {
    const colorClass = getStatusColor(status)
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
    }

    const Icon = icons[status as keyof typeof icons] || Clock

    return (
      <Badge variant="secondary" className={`${colorClass} border-0 font-medium flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`h-4 w-4 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}</span>
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
              <TableHead>Review</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
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
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
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

  if (reviews.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Review</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <div className="flex flex-col items-center space-y-2">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No reviews found</p>
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
                checked={selectedReviews.length === reviews.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300"
              />
            </TableHead>
            <TableHead>Review</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review._id} className="hover:bg-muted/50">
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedReviews.includes(review._id)}
                  onChange={(e) => handleSelectReview(review._id, e.target.checked)}
                  className="rounded border-gray-300"
                />
              </TableCell>

              <TableCell className="max-w-xs">
                <div className="space-y-1">
                  <p className="text-sm leading-relaxed">{truncateText(review.comment, 100)}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {review.verified_purchase && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {review.helpful_count && review.helpful_count > 0 && <span>{review.helpful_count} helpful</span>}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                    {review.product_id.images && review.product_id.images[0] ? (
                      <img
                        src={review.product_id.images[0] || "/placeholder.svg"}
                        alt={review.product_id.name}
                        className="h-10 w-10 object-cover"
                      />
                    ) : (
                      <Package className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-sm leading-none">{truncateText(review.product_id.name, 30)}</p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={review.user_id.profile_image || "/placeholder.svg"} alt={review.user_id.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                      {getInitials(review.user_id.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="font-medium leading-none text-sm">{review.user_id.name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[120px]">{review.user_id.email}</p>
                  </div>
                </div>
              </TableCell>

              <TableCell>{renderStars(review.rating)}</TableCell>

              <TableCell>{getStatusBadge(review.status)}</TableCell>

              <TableCell>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-2" />
                  <span>{formatRelativeTime(review.created_at)}</span>
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
                      <DropdownMenuItem onClick={() => onView(review)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                    )}

                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(review)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Review
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Moderation</DropdownMenuLabel>

                    {onApprove && review.status !== "approved" && (
                      <DropdownMenuItem
                        onClick={() => onApprove(review._id)}
                        className="text-green-600 focus:text-green-600"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve Review
                      </DropdownMenuItem>
                    )}

                    {onReject && review.status !== "rejected" && (
                      <DropdownMenuItem
                        onClick={() => onReject(review._id)}
                        className="text-orange-600 focus:text-orange-600"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject Review
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(review)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Review
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
      {selectedReviews.length > 0 && (
        <div className="border-t bg-muted/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedReviews.length} review{selectedReviews.length > 1 ? "s" : ""} selected
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Export Selected
              </Button>
              {onApprove && (
                <Button variant="outline" size="sm" className="text-green-600 bg-transparent">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Selected
                </Button>
              )}
              {onReject && (
                <Button variant="outline" size="sm" className="text-orange-600 bg-transparent">
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Selected
                </Button>
              )}
              {onDelete && (
                <Button variant="destructive" size="sm">
                  Delete Selected
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
