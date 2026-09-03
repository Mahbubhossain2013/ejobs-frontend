"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import type { CompanyReview } from "@/types";

function StarIcon({ filled }: { filled: boolean }) {
  return <span className={`h-3 w-3 ${filled ? "fill-yellow-400 text-yellow-400" : "fill-yellow-400/30 text-yellow-400/30"}`}>&#9733;</span>;
}

interface Props {
  company: any;
  avgReview: string;
  totalReviews: string;
  ratingBreakdown: { stars: number; count: number; percent: number }[];
  reviews: CompanyReview[];
  reviewsLoading: boolean;
  isAuthenticated: boolean;
  userHasReviewed: boolean;
  reviewRating: number;
  reviewHoverRating: number;
  reviewComment: string;
  reviewAnonymous: boolean;
  reviewSubmitting: boolean;
  categoryRatings: Record<string, number>;
  onRate: (r: number) => void;
  onHoverRate: (r: number) => void;
  onCategoryRate: (key: string, val: number) => void;
  onCommentChange: (v: string) => void;
  onAnonymousChange: (v: boolean) => void;
  onSubmit: () => void;
  isBn: boolean;
}

export default function ReviewsTab({
  company, avgReview, totalReviews, ratingBreakdown, reviews, reviewsLoading,
  isAuthenticated, userHasReviewed, reviewRating, reviewHoverRating, reviewComment,
  reviewAnonymous, reviewSubmitting, categoryRatings,
  onRate, onHoverRate, onCategoryRate, onCommentChange, onAnonymousChange, onSubmit, isBn,
}: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Company Reviews</h2>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-4xl font-bold">{avgReview}</span>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => <StarIcon key={s} filled={s <= Math.round(Number(avgReview))} />)}
        </div>
        <span className="text-sm text-muted-foreground">({totalReviews} reviews)</span>
      </div>

      {ratingBreakdown.length > 0 && (
        <div className="space-y-2 max-w-md">
          {ratingBreakdown.map((r) => (
            <div key={r.stars} className="flex items-center gap-2 text-sm">
              <span className="w-3 text-right">{r.stars}</span>
              <StarIcon filled />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${r.percent}%` }} />
              </div>
              <span className="w-10 text-right text-muted-foreground">{r.percent}%</span>
            </div>
          ))}
        </div>
      )}

      {isAuthenticated && !userHasReviewed && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="font-bold text-sm">Write a Review</h3>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onClick={() => onRate(s)}
                  onMouseEnter={() => onHoverRate(s)} onMouseLeave={() => onHoverRate(0)}>
                  <span className={`h-6 w-6 ${(reviewHoverRating || reviewRating) >= s ? "fill-yellow-400 text-yellow-400" : "fill-yellow-400/30 text-yellow-400/30"}`}>&#9733;</span>
                </button>
              ))}
              <span className="text-sm text-muted-foreground ml-2">{reviewRating > 0 ? `${reviewRating}/5` : "Select rating"}</span>
            </div>
            <textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Share your experience working here..." value={reviewComment} onChange={(e) => onCommentChange(e.target.value)} />
            <div className="flex items-center gap-2">
              <input type="checkbox" id="anonymous" checked={reviewAnonymous} onChange={(e) => onAnonymousChange(e.target.checked)} className="rounded" />
              <label htmlFor="anonymous" className="text-sm text-muted-foreground">Post anonymously</label>
            </div>
            <Button size="sm" onClick={onSubmit} disabled={reviewSubmitting || reviewRating === 0}>
              {reviewSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : <>Submit Review</>}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {reviews.length > 0 ? reviews.map((t) => (
          <Card key={t.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{(t.user?.name || "A")[0]}</div>
                <div>
                  <p className="text-sm font-medium">{t.user?.name || "Anonymous"}</p>
                  <p className="text-[10px] text-muted-foreground">{t.is_current_employee ? "Current Employee" : "Former Employee"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((s) => <StarIcon key={s} filled={s <= Math.floor(Number(t.overall_rating || t.rating))} />)}
                <span className="text-xs font-medium ml-1">{Number(t.overall_rating || t.rating).toFixed(1)}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{t.pros || t.cons || t.comment || "No comment"}</p>
            </CardContent>
          </Card>
        )) : <p className="text-center py-8 text-muted-foreground">No reviews yet</p>}
      </div>
    </div>
  );
}