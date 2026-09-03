"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import api from "@/lib/api-client";
import { useThemeStore } from "@/store/theme-store";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DefaultAvatar } from "@/components/ui/default-avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Users,
  MapPin,
  CheckCircle,
  Zap,
  SlidersHorizontal,
  Star,
  Briefcase,
  X,
  ArrowUpDown,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

interface Candidate {
  id: number;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  current_position?: string;
  city?: string;
  skills?: string[];
  location?: string;
  trust_score?: number;
  is_boosted?: boolean;
  is_premium?: boolean;
}

function TrustRating({ score }: { score?: number }) {
  if (!score && score !== 0) return null;
  const stars = Math.round(score / 20);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i <= stars
                ? "fill-amber-400 text-amber-400"
                : "fill-muted/40 text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
      <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
        {score}
      </span>
    </div>
  );
}

function CandidateCard({ candidate: c }: { candidate: Candidate }) {
  return (
    <Link href={`/profile/${c.username}`} className="group block">
      <Card className="relative overflow-hidden border-border/60 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.12)] h-full">
        {c.is_boosted && (
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-emerald-400 to-primary" />
        )}
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <DefaultAvatar src={c.avatar} name={c.name} className="h-14 w-14 ring-2 ring-background shadow-sm" fallback={<span className="bg-primary/10 text-primary font-semibold text-sm">{getInitials(c.name)}</span>} />
              {c.is_premium && (
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                  <Zap className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {c.name}
                </h3>
                {c.is_premium && (
                  <Badge className="text-[9px] px-1.5 py-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-semibold shrink-0">
                    PRO
                  </Badge>
                )}
                {c.trust_score && c.trust_score >= 90 && (
                  <Badge
                    variant="success"
                    className="text-[9px] px-1.5 py-0 shrink-0"
                  >
                    <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                    Verified
                  </Badge>
                )}
              </div>

              {c.current_position && (
                <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5">
                  <Briefcase className="h-3 w-3 shrink-0 opacity-50" />
                  {c.current_position}
                </p>
              )}

              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground/70">
                  @{c.username}
                </span>
                {(c.city || c.location) && (
                  <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {c.city || c.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {c.trust_score !== undefined && c.trust_score !== null && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Trust Score
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Progress
                  value={c.trust_score}
                  className="h-1.5 flex-1 bg-primary/10"
                />
                <TrustRating score={c.trust_score} />
              </div>
            </div>
          )}

          {c.skills && c.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {c.skills.slice(0, 5).map((s, i) => (
                <span
                  key={`${s}-${i}`}
                  className="inline-flex items-center rounded-md bg-primary/8 text-primary px-2 py-0.5 text-[11px] font-medium"
                >
                  {s}
                </span>
              ))}
              {c.skills.length > 5 && (
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  +{c.skills.length - 5}
                </span>
              )}
            </div>
          )}

          {c.bio && (
            <p className="text-xs text-muted-foreground/80 mt-3 line-clamp-2 leading-relaxed">
              {c.bio}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function CandidatesClient() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [skillFilter, setSkillFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {
    api
      .get("/candidates/public")
      .then((res) => {
        const raw = res.data;
        const list = raw?.data?.data ?? raw?.data ?? [];
        setCandidates(Array.isArray(list) ? list : []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const allSkills = useMemo(() => {
    const skillSet = new Set<string>();
    candidates.forEach((c) => c.skills?.forEach((s) => skillSet.add(s)));
    return Array.from(skillSet).sort();
  }, [candidates]);

  const allLocations = useMemo(() => {
    const locSet = new Set<string>();
    candidates.forEach((c) => {
      if (c.city) locSet.add(c.city);
      if (c.location) locSet.add(c.location);
    });
    return Array.from(locSet).sort();
  }, [candidates]);

  const filtered = useMemo(() => {
    let result = candidates.filter((c) => {
      const matchesSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.current_position?.toLowerCase().includes(search.toLowerCase()) ||
        c.skills?.some((s) => s.toLowerCase().includes(search.toLowerCase()));
      const matchesSkill =
        !skillFilter ||
        c.skills?.some((s) => s.toLowerCase() === skillFilter.toLowerCase());
      const matchesLocation =
        !locationFilter ||
        c.city?.toLowerCase() === locationFilter.toLowerCase() ||
        c.location?.toLowerCase() === locationFilter.toLowerCase();
      return matchesSearch && matchesSkill && matchesLocation;
    });

    if (sortBy === "rating") {
      result.sort((a, b) => (b.trust_score ?? 0) - (a.trust_score ?? 0));
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "premium") {
      result.sort(
        (a, b) => (b.is_premium ? 1 : 0) - (a.is_premium ? 1 : 0)
      );
    }

    return result;
  }, [candidates, search, skillFilter, locationFilter, sortBy]);

  const activeFilterCount =
    (skillFilter ? 1 : 0) + (locationFilter ? 1 : 0) + (sortBy !== "default" ? 1 : 0);

  const clearFilters = () => {
    setSkillFilter("");
    setLocationFilter("");
    setSortBy("default");
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-surface-page">
        <div className="bg-gradient-to-b from-primary/[0.04] to-transparent border-b border-border/50">
          <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-10">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold tracking-tight mb-1.5">
                {isBn ? "প্রার্থী খুঁজুন" : "Browse Candidates"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {isBn
                  ? "দক্ষ প্রার্থীদের খুঁজে নিন"
                  : "Discover talented professionals ready for their next opportunity"}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-6 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={
                    isBn
                      ? "নাম, পজিশন বা দক্ষতা দিয়ে খুঁজুন..."
                      : "Search by name, position, or skill..."
                  }
                  className="pl-10 h-11 bg-background border-border/70 focus:border-primary/50 focus:ring-primary/20"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                variant={filterOpen ? "default" : "outline"}
                size="icon"
                className="h-11 w-11 shrink-0 relative"
                onClick={() => setFilterOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>

            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2 mt-3 max-w-xl">
                <span className="text-xs text-muted-foreground">
                  {isBn ? "সক্রিয় ফিল্টার:" : "Active filters:"}
                </span>
                {skillFilter && (
                  <Badge
                    variant="secondary"
                    className="gap-1 text-[11px] cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => setSkillFilter("")}
                  >
                    {skillFilter}
                    <X className="h-3 w-3" />
                  </Badge>
                )}
                {locationFilter && (
                  <Badge
                    variant="secondary"
                    className="gap-1 text-[11px] cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => setLocationFilter("")}
                  >
                    {locationFilter}
                    <X className="h-3 w-3" />
                  </Badge>
                )}
                {sortBy !== "default" && (
                  <Badge
                    variant="secondary"
                    className="gap-1 text-[11px] cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => setSortBy("default")}
                  >
                    {sortBy === "rating"
                      ? isBn
                        ? "রেটিং অনুযায়ী"
                        : "By Rating"
                      : sortBy === "name"
                      ? isBn
                        ? "নাম অনুযায়ী"
                        : "By Name"
                      : isBn
                      ? "প্রিমিয়াম"
                      : "Premium"}
                    <X className="h-3 w-3" />
                  </Badge>
                )}
                <button
                  className="text-xs text-primary hover:underline font-medium"
                  onClick={clearFilters}
                >
                  {isBn ? "সব মুছুন" : "Clear all"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-14 w-14 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mt-4" />
                    <div className="flex gap-1.5 mt-3">
                      <Skeleton className="h-5 w-16 rounded" />
                      <Skeleton className="h-5 w-20 rounded" />
                      <Skeleton className="h-5 w-14 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-1.5">
                {isBn ? "প্রার্থী লোড করতে ব্যর্থ" : "Failed to load candidates"}
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                {isBn
                  ? "পরে আবার চেষ্টা করুন"
                  : "Something went wrong while fetching candidates. Please try again later."}
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1.5">
                {isBn ? "কোনো প্রার্থী পাওয়া যায়নি" : "No candidates found"}
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                {isBn
                  ? "আপনার অনুসন্ধান ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন"
                  : "Try adjusting your search or filters to find what you're looking for."}
              </p>
              {activeFilterCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={clearFilters}
                >
                  {isBn ? "ফিল্টার মুছুন" : "Clear Filters"}
                </Button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-5">
                {isBn
                  ? `${filtered.length} জন প্রার্থী পাওয়া গেছে`
                  : `${filtered.length} candidate${filtered.length !== 1 ? "s" : ""} found`}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((c) => (
                  <CandidateCard key={c.id} candidate={c} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent className="w-[340px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              {isBn ? "ফিল্টার" : "Filters"}
            </SheetTitle>
            <SheetDescription>
              {isBn
                ? "প্রার্থীদের ফিল্টার করতে অপশন বেছে নিন"
                : "Refine your search to find the right candidates"}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {isBn ? "দক্ষতা" : "Skill"}
              </label>
              <Select
                value={skillFilter}
                onValueChange={setSkillFilter}
              >
                <SelectTrigger className="h-10">
                  <SelectValue
                    placeholder={isBn ? "দক্ষতা বাছাই করুন" : "Select a skill"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {allSkills.map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {isBn ? "লোকেশন" : "Location"}
              </label>
              <Select
                value={locationFilter}
                onValueChange={setLocationFilter}
              >
                <SelectTrigger className="h-10">
                  <SelectValue
                    placeholder={
                      isBn ? "লোকেশন বাছাই করুন" : "Select a location"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {allLocations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5" />
                {isBn ? "সাজানো" : "Sort by"}
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">
                    {isBn ? "ডিফল্ট" : "Default"}
                  </SelectItem>
                  <SelectItem value="rating">
                    {isBn ? "রেটিং (উচ্চ থেকে কম)" : "Rating (High to Low)"}
                  </SelectItem>
                  <SelectItem value="name">
                    {isBn ? "নাম (ক্রমানুসারে)" : "Name (A-Z)"}
                  </SelectItem>
                  <SelectItem value="premium">
                    {isBn ? "প্রিমিয়াম আগে" : "Premium First"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={clearFilters}
              >
                {isBn ? "সব ফিল্টার মুছুন" : "Clear All Filters"}
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </PublicLayout>
  );
}
