"use client";

import React, { useState, useEffect, useCallback } from "react";
import api from "@/lib/api-client";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { DefaultAvatar } from "@/components/ui/default-avatar";
import { toast } from "sonner";
import {
  Star, MessageSquare, Briefcase, Clock, Shield, Send, ChevronRight,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Rating {
  id: number;
  skill_rating: number;
  communication_rating: number;
  delivery_rating: number;
  professionalism_rating: number;
  overall_rating: number;
  comment: string | null;
  rater_role: string;
  created_at: string;
  rater: { id: number; name: string; avatar: string | null; username: string };
  job: { id: number; title: string };
}

interface Averages {
  skill: number;
  communication: number;
  delivery: number;
  professionalism: number;
  overall: number;
  total: number;
}

function StarRating({ value, onChange, readonly = false, size = "w-5 h-5" }: {
  value: number; onChange?: (v: number) => void; readonly?: boolean; size?: string;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" disabled={readonly}
          className={`${readonly ? "cursor-default" : "cursor-pointer"}`}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}>
          <Star className={`${size} ${
            star <= (hover || value) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`} />
        </button>
      ))}
    </div>
  );
}

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-32">{label}</span>
      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div className="bg-yellow-400 h-2 rounded-full transition-all" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
      <span className="text-xs font-medium w-8 text-right">{value.toFixed(1)}</span>
    </div>
  );
}

export default function RatingsPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isDark = mounted && resolvedTheme === "dark";
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [averages, setAverages] = useState<Averages | null>(null);
  const [loading, setLoading] = useState(true);
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [eligibleJobId, setEligibleJobId] = useState<number | null>(null);
  const [eligibleRatedId, setEligibleRatedId] = useState<number | null>(null);
  const [form, setForm] = useState({
    skill: 0, communication: 0, delivery: 0, professionalism: 0, comment: "",
  });

  const fetchRatings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/ratings/user/me");
      setRatings(res.data.data?.ratings?.data || []);
      setAverages(res.data.data?.averages || null);
    } catch {
      toast.error("Failed to load ratings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRatings(); }, [fetchRatings]);

  const handleSubmit = async () => {
    if (!eligibleJobId || !eligibleRatedId) return;
    if (form.skill === 0 || form.communication === 0 || form.delivery === 0 || form.professionalism === 0) {
      toast.error("Please rate all dimensions");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/ratings", {
        job_id: eligibleJobId,
        rated_id: eligibleRatedId,
        skill_rating: form.skill,
        communication_rating: form.communication,
        delivery_rating: form.delivery,
        professionalism_rating: form.professionalism,
        comment: form.comment || undefined,
      });
      toast.success("Rating submitted!");
      setRateDialogOpen(false);
      setForm({ skill: 0, communication: 0, delivery: 0, professionalism: 0, comment: "" });
      fetchRatings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  const avgLabel = (v: number) => v >= 4.5 ? "Excellent" : v >= 3.5 ? "Good" : v >= 2.5 ? "Average" : v >= 1 ? "Poor" : "-";

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Ratings & Reviews</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>See how others rate your work</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <Skeleton key={i} className={`h-40 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-100"}`} />)}
          </div>
        ) : (
          <>
            {/* Summary Card */}
            {averages && averages.total > 0 && (
              <Card className={`mb-6 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{averages.overall.toFixed(1)}</div>
                      <div className="text-sm text-yellow-500 mt-1">{avgLabel(averages.overall)}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{averages.total} reviews</div>
                    </div>
                    <div className="flex-1 min-w-[200px] space-y-2">
                      <RatingBar label="Skill" value={averages.skill} />
                      <RatingBar label="Communication" value={averages.communication} />
                      <RatingBar label="Delivery" value={averages.delivery} />
                      <RatingBar label="Professionalism" value={averages.professionalism} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Individual Reviews */}
            {ratings.length === 0 ? (
              <Card className={isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Star className={`w-12 h-12 mb-3 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                  <p className={`text-lg font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>No reviews yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {ratings.map((r) => (
                  <Card key={r.id} className={isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <DefaultAvatar src={r.rater.avatar} name={r.rater.name} className="w-10 h-10" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-medium text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{r.rater.name}</span>
                            <Badge variant="outline" className="text-[10px]">{r.rater_role}</Badge>
                            <span className="text-xs text-gray-500">{formatDate(r.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <StarRating value={Math.round(r.overall_rating)} readonly size="w-4 h-4" />
                            <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{r.overall_rating.toFixed(1)}</span>
                          </div>
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>Skill: {r.skill_rating}/5</span>
                            <span>Communication: {r.communication_rating}/5</span>
                            <span>Delivery: {r.delivery_rating}/5</span>
                            <span>Professionalism: {r.professionalism_rating}/5</span>
                          </div>
                          {r.comment && <p className={`text-sm mt-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>{r.comment}</p>}
                          <p className="text-xs text-gray-500 mt-1">Project: {r.job.title}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Rate Dialog */}
      <Dialog open={rateDialogOpen} onOpenChange={setRateDialogOpen}>
        <DialogContent className={`max-w-md ${isDark ? "bg-gray-800" : "bg-white"}`}>
          <DialogHeader>
            <DialogTitle>Rate This User</DialogTitle>
            <DialogDescription>Rate skill, communication, delivery, and professionalism.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {[
              { key: "skill", label: "Skill" },
              { key: "communication", label: "Communication" },
              { key: "delivery", label: "Delivery Quality" },
              { key: "professionalism", label: "Professionalism" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <Label className="text-sm">{label}</Label>
                <StarRating
                  value={(form as Record<string, number | string>)[key] as number}
                  onChange={(v) => setForm((prev) => ({ ...prev, [key]: v }))}
                />
              </div>
            ))}
            <Textarea
              placeholder="Optional comment..."
              value={form.comment}
              onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
              rows={3}
            />
            <Button onClick={handleSubmit} disabled={submitting} className="w-full">
              <Send className="w-4 h-4 mr-1" />{submitting ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
