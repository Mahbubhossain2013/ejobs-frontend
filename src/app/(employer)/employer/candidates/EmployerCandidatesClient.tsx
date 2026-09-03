"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useThemeStore } from "@/store/theme-store";
import api from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { DefaultAvatar } from "@/components/ui/default-avatar";
import {
  Search,
  MapPin,
  Briefcase,
  Download,
  Lock,
  Star,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";


interface Candidate {
  id: number;
  name: string;
  username: string;
  current_position: string;
  city: string;
  bio: string;
  skills: string[];
  avatar: string | null;
  is_boosted: boolean;
  is_premium: boolean;
  resume_locked: boolean;
  resume: string | null;
  active_badges: any[];
}

export default function EmployerCandidatesClient() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skillsFilter, setSkillsFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [upgradeMessage, setUpgradeMessage] = useState<string | null>(null);

  const fetchCandidates = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (search) params.set("search", search);
      if (skillsFilter) params.set("skills", skillsFilter);
      if (cityFilter) params.set("city", cityFilter);

      const res = await api.get(`/employer/candidates?${params}`);
      setCandidates(res.data?.data?.data || []);
      setLastPage(res.data?.data?.last_page || 1);
      setPage(p);
    } catch (e: any) {
      if (e.response?.status === 403) {
        setUpgradeMessage(
          e.response?.data?.message ||
            (isBn
              ? "এই বৈশিষ্ট্যটি আপনার বর্তমান সাবস্ক্রিপশনে অন্তর্ভুক্ত নয়।"
              : "This feature is not included in your current subscription.")
        );
      } else {
        toast.error(isBn ? "প্রার্থী লোড করতে ব্যর্থ" : "Failed to load candidates");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates(1);
  }, []);

  const handleSearch = () => {
    fetchCandidates(1);
  };

  // Upgrade prompt
  if (upgradeMessage) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">
          {isBn ? "প্রার্থী খুঁজুন" : "Search Candidates"}
        </h1>
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
            <h3 className="text-lg font-semibold">{upgradeMessage}</h3>
            <p className="text-muted-foreground">
              {isBn
                ? "ক্যান্ডিডেট ডাটাবেস অ্যাক্সেস পেতে আপনার প্ল্যান আপগ্রেড করুন।"
                : "Upgrade your plan to access the candidate database."}
            </p>
            <Button asChild>
              <Link href="/employer/subscription">
                {isBn ? "প্ল্যান দেখুন" : "View Plans"}
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {isBn ? "প্রার্থী খুঁজুন" : "Search Candidates"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isBn
            ? "আপনার পদের জন্য প্রার্থী খুঁজুন এবং যোগাযোগ করুন"
            : "Find and connect with candidates for your positions"}
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isBn ? "নাম, পজিশন, বায়ো দিয়ে খুঁজুন..." : "Search by name, position, bio..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <Input
          placeholder={isBn ? "স্কিল" : "Skills"}
          value={skillsFilter}
          onChange={(e) => setSkillsFilter(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="sm:w-40"
        />
        <Input
          placeholder={isBn ? "শহর" : "City"}
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="sm:w-40"
        />
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          {isBn ? "খুঁজুন" : "Search"}
        </Button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">
            {isBn ? "কোনো প্রার্থী পাওয়া যায়নি" : "No candidates found"}
          </h3>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {candidates.map((c) => (
              <Card key={c.id} className="relative">
                {c.is_boosted && (
                  <Badge className="absolute top-2 right-2 bg-amber-500">
                    <Star className="h-3 w-3 mr-1" /> Boosted
                  </Badge>
                )}
                {c.is_premium && !c.is_boosted && (
                  <Badge className="absolute top-2 right-2 bg-purple-500">Premium</Badge>
                )}
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <DefaultAvatar src={c.avatar} name={c.name} className="h-10 w-10" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {c.current_position || (isBn ? "পজিশন নেই" : "No position")}
                      </p>
                    </div>
                  </div>

                  {c.city && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {c.city}
                    </p>
                  )}

                  {c.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{c.bio}</p>
                  )}

                  {c.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {c.skills.slice(0, 4).map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px]">
                          {skill}
                        </Badge>
                      ))}
                      {c.skills.length > 4 && (
                        <Badge variant="secondary" className="text-[10px]">
                          +{c.skills.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <Button size="sm" variant="outline" asChild className="flex-1">
                      <Link href={`/profile/${c.username}`}>
                        {isBn ? "প্রোফাইল" : "Profile"}
                      </Link>
                    </Button>
                    {c.resume_locked ? (
                      <Button size="sm" variant="outline" disabled className="gap-1">
                        <Lock className="h-3 w-3" />
                        {isBn ? "রিজিউম" : "Resume"}
                      </Button>
                    ) : c.resume ? (
                      <Button size="sm" variant="outline" asChild className="gap-1">
                        <a href={c.resume} target="_blank" rel="noopener noreferrer">
                          <Download className="h-3 w-3" />
                          {isBn ? "রিজিউম" : "Resume"}
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => fetchCandidates(page - 1)}
              >
                {isBn ? "আগে" : "Previous"}
              </Button>
              <span className="flex items-center px-3 text-sm text-muted-foreground">
                {page} / {lastPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= lastPage}
                onClick={() => fetchCandidates(page + 1)}
              >
                {isBn ? "পরে" : "Next"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
