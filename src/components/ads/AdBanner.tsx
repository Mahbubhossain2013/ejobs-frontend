"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";

interface Ad {
  id: number;
  title: string;
  description?: string;
  media_type: "image" | "text";
  media_path?: string;
  cta_text?: string;
  cta_url?: string;
  slot: string;
}

interface AdBannerProps {
  slot: string;
  className?: string;
}

export default function AdBanner({ slot, className }: AdBannerProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/ads/serve?slot=${slot}`)
      .then((res) => {
        const data = res.data.data || res.data;
        if (data && data.id) {
          setAd(data);
        }
      })
      .catch(() => { /* handled */ })
      .finally(() => setLoading(false));
  }, [slot]);

  useEffect(() => {
    if (ad?.id) {
      api.post(`/ads/${ad.id}/impression`).catch(() => { /* handled */ });
    }
  }, [ad?.id]);

  const handleClick = () => {
    if (ad?.id) {
      api.post(`/ads/${ad.id}/click`).catch(() => { /* handled */ });
    }
    if (ad?.cta_url) {
      window.open(ad.cta_url, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div className={className}>
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    );
  }

  if (!ad) return null;

  return (
    <Card className={`overflow-hidden border border-border/50 ${className || ""}`}>
      {ad.media_type === "image" && ad.media_path && (
        <div className="relative">
          <img
            src={ad.media_path}
            alt={ad.title}
            className="w-full h-40 object-cover"
          />
        </div>
      )}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-sm">{ad.title}</h3>
        {ad.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{ad.description}</p>
        )}
        <div className="flex items-center gap-2 pt-1">
          {ad.cta_text && (
            <Button size="sm" onClick={handleClick} className="h-7 text-xs">
              {ad.cta_text}
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          )}
          <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
            Ad
          </span>
        </div>
      </div>
    </Card>
  );
}
