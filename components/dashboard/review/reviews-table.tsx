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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MoreHorizontal,
  Star,
  Reply,
  Check,
  EyeOff,
  Trash2,
  Eye,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useReviewStore } from "@/store/reviewStore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Review {
  _id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
  status?: string;
  product_name?: string;
  customer_name?: string;
  customer_avatar?: string;
}

interface ReviewsTableProps {
  reviews: Review[];
  isLoading: boolean;
}

export function ReviewsTable({ reviews, isLoading }: ReviewsTableProps) {
  const { updateReviewStatus, replyToReview, deleteReview } = useReviewStore();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (reviewId: string, status: string) => {
    setUpdatingId(reviewId);
    try {
      await updateReviewStatus(reviewId, status);
    } catch (error) {
      console.error("Failed to update review status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;

    try {
      await replyToReview(reviewId, replyText);
      setReplyingTo(null);
      setReplyText("");
    } catch (error) {
      console.error("Failed to reply to review:", error);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      setDeletingId(reviewId);
      try {
        await deleteReview(reviewId);
      } catch (error) {
        console.error("Failed to delete review:", error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
              }`}
          />
        ))}
      </div>
    );
  };

  // Get badge color based on status
  const getStatusColor = (status: string = "pending") => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400";
      case "hidden":
        return "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center space-x-4 p-4 border rounded-lg"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No reviews found
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Review</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[140px]">Date</TableHead>
            <TableHead className="w-[180px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review._id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        review.customer_avatar ||
                        `https://avatar.vercel.sh/${review.user}`
                      }
                    />
                    <AvatarFallback>
                      {(review.customer_name || review.user)
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {review.customer_name || review.user}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {review.product_name || "Product"}
                </div>
              </TableCell>
              <TableCell>{renderStars(review.rating)}</TableCell>
              <TableCell>
                <div className="max-w-xs">
                  <p className="text-sm line-clamp-2">{review.comment}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className={`${getStatusColor(review.status)} rounded-full px-3 py-1 text-xs font-medium max-w-20`}>
                  {review.status === "published" && "Approved"}
                  {review.status === "pending" && "Pending"}
                  {review.status === "hidden" && "Hidden"}
                  {!review.status && "Published"}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {/* {formatDistanceToNow(new Date(review.date), { addSuffix: true })} */}
                  {review.date}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <TooltipProvider>
                    {/* APPROVE BUTTON */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleStatusChange(review._id, "published")}
                          disabled={updatingId === review._id || review.status === "published"}
                        >
                          {updatingId === review._id ? (
                            <span className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Approve Review</TooltipContent>
                    </Tooltip>

                    {/* HIDE BUTTON */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleStatusChange(review._id, "hidden")}
                          disabled={updatingId === review._id || review.status === "hidden"}
                        >
                          {updatingId === review._id ? (
                            <span className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Hide Review</TooltipContent>
                    </Tooltip>

                    {/* REPLY BUTTON */}
                    <Dialog open={replyingTo === review._id} onOpenChange={(open) => !open && setReplyingTo(null)}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setReplyingTo(review._id);
                                setReplyText("");
                              }}
                            >
                              <Reply className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Reply to Review</TooltipContent>
                      </Tooltip>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reply to Review</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              {renderStars(review.rating)}
                            </div>
                            <p className="text-sm">{review.comment}</p>
                          </div>
                          <Textarea
                            placeholder="Write your reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={4}
                          />
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => setReplyingTo(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleReply(review._id)}
                              disabled={!replyText.trim()}
                            >
                              Send Reply
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* MORE ACTIONS DROPDOWN */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Full Review
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:bg-destructive/10"
                          onClick={() => handleDelete(review._id)}
                          disabled={deletingId === review._id}
                        >
                          {deletingId === review._id ? (
                            <span className="mr-2 h-4 w-4 rounded-full border-2 border-destructive border-t-transparent animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          {deletingId === review._id ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipProvider>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}