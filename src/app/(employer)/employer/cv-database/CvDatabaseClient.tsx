"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import api from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Loader2,
  Download,
  Search,
  Users,
  Filter,
  ChevronDown,
  ChevronUp,
  SortAsc,
  Eye,
  Mail,
  Star,
  ChevronLeft,
  ChevronRight,
  FileDown,
  UserPlus,
  X,
  MessageSquare,
  UserCheck,
  UserMinus,
  Send,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Candidate {
  id: number;
  username?: string | null;
  user_id?: number;
  name: string;
  email: string;
  profile: {
    phone: string | null;
    location: string | null;
    skills: string[] | string | null;
    years_of_experience: number | null;
    highest_education: string | null;
    current_position: string | null;
    bio: string | null;
    availability: string | null;
    expected_salary: string | null;
  } | null;
}

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48, 96];

export default function CvDatabaseClient() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [previewCandidate, setPreviewCandidate] = useState<Candidate | null>(null);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [followLoadingMap, setFollowLoadingMap] = useState<Record<number, boolean>>({});
  const [messageCandidate, setMessageCandidate] = useState<Candidate | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [skills, setSkills] = useState("");
  const [location, setLocation] = useState("");
  const [education, setEducation] = useState("any");
  const [availability, setAvailability] = useState("any");
  const [expMin, setExpMin] = useState("");
  const [expMax, setExpMax] = useState("");
  const [sortBy, setSortBy] = useState("experience_desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(24);
  const [total, setTotal] = useState(0);

  const educationOptions = useMemo(() => [
    "High School",
    "Diploma",
    "Bachelor",
    "Master",
    "PhD",
    "Other",
  ], []);

  const availabilityOptions = useMemo(() => [
    "Immediate",
    "Within 1 Week",
    "Within 1 Month",
    "Contract",
    "Freelance",
  ], []);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const resetPage = () => setPage(1);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (user) fetchCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && !authLoading) {
      resetPage();
      fetchCandidates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, skills, location, education, availability, expMin, expMax, sortBy, page, perPage]);

  const fetchCandidates = () => {
    setLoading(true);
    setSelectedIds([]);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (skills) params.skills = skills;
    if (location) params.location = location;
    if (education) params.education = education;
    if (availability) params.availability = availability;
    if (expMin) params.experience_min = expMin;
    if (expMax) params.experience_max = expMax;
    if (sortBy) params.sort = sortBy;
    params.page = String(page);
    params.per_page = String(perPage);

    api.get("/cv-database/search", { params })
      .then((res) => {
        const data = res.data?.data;
        setCandidates(Array.isArray(data?.data) ? data.data : []);
        setTotal(typeof data?.total === "number" ? data.total : candidates.length);
      })
      .catch(() => toast.error("Failed to load candidates"))
      .finally(() => setLoading(false));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (skills) params.set("skills", skills);
      if (location) params.set("location", location);
      if (education && education !== "any") params.set("education", education);
      if (availability && availability !== "any") params.set("availability", availability);
      if (expMin) params.set("experience_min", expMin);
      if (expMax) params.set("experience_max", expMax);

      const response = await api.get(`/cv-database/export?${params.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `cv_database_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("CV database exported successfully!");
    } catch {
      toast.error("Failed to export. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === candidates.length && candidates.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(candidates.map((c) => c.id));
    }
  };

  const toggleFollow = async (candidate: Candidate) => {
    if (!candidate.username) return;
    setFollowLoadingMap((prev) => ({ ...prev, [candidate.id]: true }));
    try {
      const res = await api.post(`/candidate/profile/${candidate.username}/follow`);
      const following = res.data?.following ?? res.data?.data?.following ?? false;
      setFollowingMap((prev) => ({ ...prev, [candidate.username as string]: following }));
      toast.success(following ? `Now following ${candidate.name}` : `Unfollowed ${candidate.name}`);
    } catch {
      toast.error("Failed to update follow status");
    } finally {
      setFollowLoadingMap((prev) => ({ ...prev, [candidate.id]: false }));
    }
  };

  const loadFollowStatus = (candidate: Candidate) => {
    if (!candidate.username || candidate.username in followingMap) return;
    api.get(`/candidate/profile/${candidate.username}/follow-status`)
      .then((res: any) => {
        const following = res.data?.following ?? res.data?.data?.following ?? false;
        setFollowingMap((prev) => ({ ...prev, [candidate.username as string]: following }));
      })
      .catch(() => {});
  };

  const handleSendMessage = async () => {
    if (!messageCandidate || !messageText.trim()) return;
    setSendingMessage(true);
    try {
      const targetUserId = messageCandidate.user_id || messageCandidate.id;
      await api.post(`/messages/direct/${targetUserId}`, { message: messageText.trim() });
      toast.success("Message sent");
      setMessageCandidate(null);
      setMessageText("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const formatSkills = (skills: string[] | string | null | undefined): string[] => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills.map((s: any) => (typeof s === "object" && s !== null ? s.name || "" : String(s))).filter(Boolean).slice(0, 6);
    return skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 6);
  };

  const activeFilterCount = [skills, location, education, availability, expMin, expMax].filter(Boolean).length;

  if (authLoading || loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">CV Database</h1>
          <p className="text-muted-foreground">
            Search, filter and download candidate CVs in bulk
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowFilters((v) => !v)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">{activeFilterCount}</Badge>
            )}
            {showFilters ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name, position, skills..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                />
              </div>
              <Input
                placeholder="Skills (e.g. React, Laravel)"
                value={skills}
                onChange={(e) => { setSkills(e.target.value); resetPage(); }}
              />
              <Input
                placeholder="Location"
                value={location}
                onChange={(e) => { setLocation(e.target.value); resetPage(); }}
              />
              <Select value={education} onValueChange={(v) => { setEducation(v); resetPage(); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Education" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Education</SelectItem>
                  {educationOptions.map((opt) => (
                    <SelectItem key={opt} value={opt.toLowerCase()}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={availability} onValueChange={(v) => { setAvailability(v); resetPage(); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Availability</SelectItem>
                  {availabilityOptions.map((opt) => (
                    <SelectItem key={opt} value={opt.toLowerCase()}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min exp"
                  value={expMin}
                  onChange={(e) => { setExpMin(e.target.value); resetPage(); }}
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder="Max exp"
                  value={expMax}
                  onChange={(e) => { setExpMax(e.target.value); resetPage(); }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={candidates.length > 0 && selectedIds.length === candidates.length}
            onCheckedChange={toggleSelectAll}
          />
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {total} candidate{total !== 1 ? "s" : ""} found
          </span>
          {selectedIds.length > 0 && (
            <Badge variant="secondary">{selectedIds.length} selected</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v); resetPage(); }}>
            <SelectTrigger className="w-44">
              <SortAsc className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="experience_desc">Experience: High-Low</SelectItem>
              <SelectItem value="experience_asc">Experience: Low-High</SelectItem>
              <SelectItem value="name_asc">Name: A-Z</SelectItem>
              <SelectItem value="name_desc">Name: Z-A</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); resetPage(); }}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Per page" />
            </SelectTrigger>
            <SelectContent>
              {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {candidates.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-medium">No candidates match your filters</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {candidates.map((candidate) => (
              <Card key={candidate.id} className="flex flex-col">
                <CardContent className="p-4 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{candidate.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{candidate.email}</p>
                    </div>
                    <Checkbox
                      checked={selectedIds.includes(candidate.id)}
                      onCheckedChange={() => toggleSelect(candidate.id)}
                    />
                  </div>

                  {candidate.profile?.current_position && (
                    <p className="text-sm font-medium">{candidate.profile.current_position}</p>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {formatSkills(candidate.profile?.skills).map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {candidate.profile?.location && <span>{candidate.profile.location}</span>}
                    {candidate.profile?.years_of_experience != null && (
                      <span>{candidate.profile.years_of_experience} yr exp</span>
                    )}
                    {candidate.profile?.highest_education && (
                      <span>{candidate.profile.highest_education}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-auto pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setPreviewCandidate(candidate)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Quick View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Candidate Profile</DialogTitle>
                        </DialogHeader>
                        {previewCandidate && (
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold text-lg">{previewCandidate.name}</h3>
                              <p className="text-sm text-muted-foreground">{previewCandidate.email}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              {previewCandidate.profile?.phone && (
                                <div><span className="text-muted-foreground">Phone:</span> {previewCandidate.profile.phone}</div>
                              )}
                              {previewCandidate.profile?.location && (
                                <div><span className="text-muted-foreground">Location:</span> {previewCandidate.profile.location}</div>
                              )}
                              {previewCandidate.profile?.current_position && (
                                <div><span className="text-muted-foreground">Position:</span> {previewCandidate.profile.current_position}</div>
                              )}
                              {previewCandidate.profile?.years_of_experience != null && (
                                <div><span className="text-muted-foreground">Experience:</span> {previewCandidate.profile.years_of_experience} years</div>
                              )}
                              {previewCandidate.profile?.highest_education && (
                                <div><span className="text-muted-foreground">Education:</span> {previewCandidate.profile.highest_education}</div>
                              )}
                              {previewCandidate.profile?.availability && (
                                <div><span className="text-muted-foreground">Availability:</span> {previewCandidate.profile.availability}</div>
                              )}
                              {previewCandidate.profile?.expected_salary && (
                                <div><span className="text-muted-foreground">Expected Salary:</span> {previewCandidate.profile.expected_salary}</div>
                              )}
                            </div>
                            {previewCandidate.profile?.bio && (
                              <div>
                                <p className="text-sm font-medium mb-1">Bio</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{previewCandidate.profile.bio}</p>
                              </div>
                            )}
                            {formatSkills(previewCandidate.profile?.skills).length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-1">Skills</p>
                                <div className="flex flex-wrap gap-1">
                                  {formatSkills(previewCandidate.profile?.skills).map((skill, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { setMessageCandidate(candidate); setMessageText(""); }}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                    <Button size="sm" className="flex-1" disabled={!!followLoadingMap[candidate.id]} onClick={() => toggleFollow(candidate)} onMouseEnter={() => loadFollowStatus(candidate)}>
                      {followLoadingMap[candidate.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : followingMap[candidate.username as string] ? <UserMinus className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                      {followingMap[candidate.username as string] ? "Following" : "Follow"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Message Candidate Dialog */}
      <Dialog open={!!messageCandidate} onOpenChange={(open) => { if (!open) setMessageCandidate(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Message {messageCandidate?.name || ""}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Send a message to {messageCandidate?.name || "this candidate"}.
            </p>
            <Textarea
              placeholder="Write your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={5}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMessageCandidate(null)}>Cancel</Button>
              <Button onClick={handleSendMessage} disabled={sendingMessage || !messageText.trim()}>
                {sendingMessage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
