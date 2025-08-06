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
  X,
  Trash2,
  Eye,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useReviewStore } from "@/store/reviewStore";

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

  const handleStatusChange = async (reviewId: string, status: string) => {
    try {
      await updateReviewStatus(reviewId, status);
    } catch (error) {
      console.error("Failed to update review status:", error);
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
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
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
            <TableHead>Date</TableHead>
            <TableHead className="w-[50px]"></TableHead>
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
                <Badge
                  variant={
                    review.status === "approved"
                      ? "default"
                      : review.status === "pending"
                      ? "secondary"
                      : review.status === "rejected"
                      ? "destructive"
                      : "default"
                  }
                >
                  {review.status || "published"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {review.date}
                  {/*{formatDistanceToNow(new Date(review.date), { addSuffix: true })}*/}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Full Review
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(review._id, "approved")}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(review._id, "rejected")}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </DropdownMenuItem>
                    <Dialog>
                      <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Reply className="mr-2 h-4 w-4" />
                          Reply
                        </DropdownMenuItem>
                      </DialogTrigger>
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
                              onClick={() => setReplyText("")}
                            >
                              Cancel
                            </Button>
                            <Button onClick={() => handleReply(review._id)}>
                              Send Reply
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(review._id)}
                      disabled={deletingId === review._id}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deletingId === review._id ? "Deleting..." : "Delete"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
