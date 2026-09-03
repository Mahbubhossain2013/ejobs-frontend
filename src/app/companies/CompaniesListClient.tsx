"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { companiesService } from "@/services/companies.service";
import { useThemeStore } from "@/store/theme-store";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose,
} from "@/components/ui/sheet";
import {
  Search, Building2, MapPin, Briefcase, ChevronLeft, ChevronRight,
  SlidersHorizontal, Star, Users, CheckCircle2, Sparkles, RotateCcw,
  ChevronDown, ChevronUp, X,
} from "lucide-react";
import type { Company } from "@/types";
import { getStorageUrl } from "@/lib/utils";

const INDUSTRY_COLORS: Record<string, string> = {
  technology: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  healthcare: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  finance: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  education: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  retail: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  manufacturing: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  consulting: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  "real estate": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  media: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  nonprofit: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

function getIndustryStyle(industry: string) {
  const key = industry?.toLowerCase().trim();
  for (const [k, v] of Object.entries(INDUSTRY_COLORS)) {
    if (key?.includes(k)) return v;
  }
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3 w-3 ${
            s <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-muted-foreground/20 text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export default function CompaniesListClient() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [companies, setCompanies] = useState<Company[]>([]);
  const [featured, setFeatured] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("jobs_count");

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      companiesService.getCompanies(page, search),
      companiesService.getFeaturedCompanies(),
    ])
      .then(([res, featuredRes]) => {
        if (res) {
          setCompanies(res.data || []);
          setTotalPages(res.last_page || 1);
        }
        if (featuredRes) setFeatured(featuredRes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    setLoading(true);
    companiesService.getCompanies(1, search)
      .then((res) => {
        if (res) {
          setCompanies(res.data || []);
          setTotalPages(res.last_page || 1);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const allIndustries = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((c) => {
      if (c.industry) set.add(c.industry);
    });
    return Array.from(set).sort();
  }, [companies]);

  const allLocations = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((c) => {
      if (c.location) set.add(c.location);
    });
    return Array.from(set).sort();
  }, [companies]);

  const filtered = useMemo(() => {
    let result = [...companies];
    if (selectedIndustries.length > 0) {
      result = result.filter((c) => c.industry && selectedIndustries.includes(c.industry));
    }
    if (selectedLocations.length > 0) {
      result = result.filter((c) => c.location && selectedLocations.includes(c.location));
    }
    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "jobs_count") {
      result.sort((a, b) => (b.jobs_count || 0) - (a.jobs_count || 0));
    } else if (sortBy === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return result;
  }, [companies, selectedIndustries, selectedLocations, sortBy]);

  const toggleIndustry = (ind: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind]
    );
  };

  const toggleLocation = (loc: string) => {
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  };

  const clearFilters = () => {
    setSelectedIndustries([]);
    setSelectedLocations([]);
    setSortBy("jobs_count");
  };

  const hasActiveFilters = selectedIndustries.length > 0 || selectedLocations.length > 0 || sortBy !== "jobs_count";

  const renderStars = (rating?: number) => {
    if (!rating || rating <= 0) return null;
    return (
      <div className="flex items-center gap-1">
        <StarRating rating={rating} />
        <span className="text-xs text-muted-foreground">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-surface-page">
        {/* ── Header ── */}
        <div className="bg-gradient-to-b from-primary/[0.04] to-transparent border-b border-border/50">
          <div className="px-6 sm:px-8 lg:px-12 py-10">
            <h1 className="text-3xl font-bold mb-2">
              {isBn ? "কোম্পানি খুঁজুন" : "Browse Companies"}
            </h1>
            <p className="text-muted-foreground mb-6">
              {isBn
                ? "শীর্ষ কোম্পানিগুলো খুঁজে নিন"
                : "Discover top companies hiring now"}
            </p>
            <div className="flex items-center gap-3 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isBn ? "কোম্পানি খুঁজুন..." : "Search companies..."}
                  className="pl-10 h-11"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
              </div>
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-11 w-11 shrink-0 relative">
                    <SlidersHorizontal className="h-4 w-4" />
                    {hasActiveFilters && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary text-[8px] font-bold text-primary-foreground flex items-center justify-center">
                        {(selectedIndustries.length + selectedLocations.length) || "..."}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md">
                  <SheetHeader className="mb-6">
                    <SheetTitle>{isBn ? "ফিল্টার" : "Filters"}</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 overflow-y-auto h-[calc(100vh-8rem)] pr-2">
                    {/* Sort */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">{isBn ? "সাজান" : "Sort By"}</h4>
                      <div className="space-y-1.5">
                        {[
                          { value: "jobs_count", label: isBn ? "সর্বাধিক চাকরি" : "Most Jobs" },
                          { value: "rating", label: isBn ? "সর্বোচ্চ রেটিং" : "Highest Rated" },
                          { value: "name", label: isBn ? "নাম (ক-ঝ)" : "Name (A-Z)" },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setSortBy(opt.value)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              sortBy === opt.value
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-muted text-muted-foreground"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Separator />

                    {/* Industry */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">{isBn ? "শিল্প" : "Industry"}</h4>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {allIndustries.map((ind) => (
                          <button
                            key={ind}
                            onClick={() => toggleIndustry(ind)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                              selectedIndustries.includes(ind)
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted text-muted-foreground"
                            }`}
                          >
                            <span>{ind}</span>
                            {selectedIndustries.includes(ind) && (
                              <X className="h-3.5 w-3.5" />
                            )}
                          </button>
                        ))}
                        {allIndustries.length === 0 && (
                          <p className="text-xs text-muted-foreground px-3">
                            {isBn ? "কোনো শিল্প পাওয়া যায়নি" : "No industries found"}
                          </p>
                        )}
                      </div>
                    </div>
                    <Separator />

                    {/* Location */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">{isBn ? "অবস্থান" : "Location"}</h4>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {allLocations.map((loc) => (
                          <button
                            key={loc}
                            onClick={() => toggleLocation(loc)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                              selectedLocations.includes(loc)
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted text-muted-foreground"
                            }`}
                          >
                            <span>{loc}</span>
                            {selectedLocations.includes(loc) && (
                              <X className="h-3.5 w-3.5" />
                            )}
                          </button>
                        ))}
                        {allLocations.length === 0 && (
                          <p className="text-xs text-muted-foreground px-3">
                            {isBn ? "কোনো অবস্থান পাওয়া যায়নি" : "No locations found"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={clearFilters}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        {isBn ? "ফিল্টার রিসেট" : "Reset Filters"}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Active filter pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {selectedIndustries.map((ind) => (
                  <Badge key={ind} variant="secondary" className="gap-1 cursor-pointer" onClick={() => toggleIndustry(ind)}>
                    {ind} <X className="h-3 w-3" />
                  </Badge>
                ))}
                {selectedLocations.map((loc) => (
                  <Badge key={loc} variant="secondary" className="gap-1 cursor-pointer" onClick={() => toggleLocation(loc)}>
                    {loc} <X className="h-3 w-3" />
                  </Badge>
                ))}
                {sortBy !== "jobs_count" && (
                  <Badge variant="outline" className="gap-1">
                    {sortBy === "name" ? "A-Z" : sortBy === "rating" ? "Rating" : ""}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSortBy("jobs_count")} />
                  </Badge>
                )}
                <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {isBn ? "সব清除" : "Clear all"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Featured Companies ── */}
        {featured.length > 0 && !search && !hasActiveFilters && (
          <div className="px-6 sm:px-8 lg:px-12 pt-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h2 className="text-lg font-semibold">
                {isBn ? "বিশেষ কোম্পানি" : "Featured Companies"}
              </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
              {featured.map((company) => (
                <Link key={company.id} href={`/companies/${company.slug || company.id}`} className="shrink-0 w-72">
                  <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        {company.logo ? (
                          <img src={getStorageUrl(company.logo)!} alt={company.name} className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm truncate">{company.name}</h3>
                          {company.industry && (
                            <Badge className={`text-[10px] px-1.5 py-0 ${getIndustryStyle(company.industry)}`}>
                              {company.industry}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {company.jobs_count || 0} {isBn ? "পদ" : "jobs"}
                        </span>
                        {company.rating != null && company.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {company.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Results ── */}
        <div className="px-6 sm:px-8 lg:px-12 py-8">
          {!search && !hasActiveFilters && featured.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {isBn ? "সব কোম্পানি" : "All Companies"}
              </h2>
              {!loading && (
                <span className="text-xs text-muted-foreground">
                  {filtered.length} {isBn ? "টি কোম্পানি" : "companies"}
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isBn ? "কোনো কোম্পানি পাওয়া যায়নি" : "No companies found"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isBn ? "আপনার অনুসন্ধানের সাথে মিলে এমন কোনো কোম্পানি নেই" : "No companies match your search criteria"}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {isBn ? "ফিল্টার রিসেট" : "Reset Filters"}
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((company) => (
                  <Link key={company.id} href={`/companies/${company.slug || company.id}`}>
                    <Card className="group hover:shadow-lg transition-all hover:-translate-y-0.5 h-full">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          {company.logo ? (
                            <img
                              src={getStorageUrl(company.logo)!}
                              alt={company.name}
                              className="h-12 w-12 rounded-lg object-cover ring-1 ring-border"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center ring-1 ring-primary/10">
                              <Building2 className="h-6 w-6 text-primary" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                                {company.name}
                              </h3>
                              {company.is_featured && (
                                <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {company.industry && (
                                <Badge className={`text-[10px] px-1.5 py-0 ${getIndustryStyle(company.industry)}`}>
                                  {company.industry}
                                </Badge>
                              )}
                              {company.is_verified && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-green-600 border-green-300 dark:text-green-400 dark:border-green-800">
                                  <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {company.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                            {company.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-3">
                            {company.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {company.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {company.jobs_count || 0} {isBn ? "পদ" : "jobs"}
                            </span>
                            {company.size && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {company.size}
                              </span>
                            )}
                          </div>
                          {company.rating != null && company.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span className="font-medium text-amber-600 dark:text-amber-400">
                                {company.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-10">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (page <= 4) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = page - 3 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="icon"
                        className="h-9 w-9 text-xs"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
