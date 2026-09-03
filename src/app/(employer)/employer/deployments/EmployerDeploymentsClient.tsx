"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/theme-store";
import api from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Plane, MapPin, CheckCircle, Circle, XCircle, Clock, Pencil, Search } from "lucide-react";

interface DeploymentStage {
  id: number;
  stage_name: string;
  stage_label: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  deadline: string | null;
  remarks: string | null;
}

interface Deployment {
  id: number;
  candidate_id: number;
  job_title: string;
  company_name: string | null;
  destination_country: string;
  destination_city: string | null;
  status: string;
  expected_joining_date: string | null;
  candidate: { id: number; name: string; email: string };
  stages: DeploymentStage[];
  created_at: string;
}

export default function EmployerDeploymentsClient() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);
  const [stageUpdateOpen, setStageUpdateOpen] = useState(false);
  const [updatingStage, setUpdatingStage] = useState(false);

  // Create form state
  const [candidateId, setCandidateId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [notes, setNotes] = useState("");
  const [candidates, setCandidates] = useState<{ id: number; name: string; email: string }[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState("");

  // Stage update form state
  const [stageStatus, setStageStatus] = useState("");
  const [stageRemarks, setStageRemarks] = useState("");
  const [stageDeadline, setStageDeadline] = useState("");
  const [editingStageId, setEditingStageId] = useState<number | null>(null);

  const fetchDeployments = () => {
    api.get("/deployments")
      .then((res) => setDeployments(res.data?.data?.data || []))
      .catch((err) => {
        if (err.response?.status === 403) {
          toast.error(isBn ? "এই বৈশিষ্ট্যটি আপনার সাবস্ক্রিপশনে অন্তর্ভুক্ত নয়।" : "This feature is not included in your current subscription.");
        } else {
          toast.error(isBn ? "ডিপ্লয়মেন্ট লোড করতে ব্যর্থ" : "Failed to load deployments");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) fetchDeployments();
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!createOpen) return;
    setLoadingCandidates(true);
    let active = true;
    api.get("/employer/candidates")
      .then((res) => {
        if (!active) return;
        const data = res.data?.data ?? res.data ?? [];
        const items = Array.isArray(data) ? data : data?.data ?? [];
        const mapped = (items as any[]).map((c) => ({
          id: c.id,
          name: c.name ?? c.username ?? "Unnamed",
          email: c.email ?? "",
        }));
        setCandidates(mapped);
      })
      .catch(() => {
        if (!active) return;
        setCandidates([]);
      })
      .finally(() => {
        if (active) setLoadingCandidates(false);
      });
    return () => { active = false; };
  }, [createOpen]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateId || !jobTitle || !country) {
      toast.error("Please fill in required fields");
      return;
    }
    setCreating(true);
    try {
      await api.post("/deployments", {
        candidate_id: candidateId,
        job_title: jobTitle,
        company_name: companyName || undefined,
        destination_country: country,
        destination_city: city || undefined,
        expected_joining_date: joiningDate || undefined,
        notes: notes || undefined,
      });
      toast.success("Deployment created successfully");
      setCreateOpen(false);
      fetchDeployments();
      setCandidateId(""); setJobTitle(""); setCompanyName(""); setCountry(""); setCity(""); setJoiningDate(""); setNotes(""); setCandidateSearch("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create deployment");
    } finally {
      setCreating(false);
    }
  };

  const handleStageUpdate = async () => {
    if (!editingStageId || !stageStatus) return;
    setUpdatingStage(true);
    try {
      await api.put(`/deployments/stages/${editingStageId}`, {
        status: stageStatus,
        remarks: stageRemarks || undefined,
        deadline: stageDeadline || undefined,
      });
      toast.success("Stage updated");
      setStageUpdateOpen(false);
      fetchDeployments();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update stage");
    } finally {
      setUpdatingStage(false);
    }
  };

  const getProgress = (stages: DeploymentStage[]): number => {
    if (!stages || stages.length === 0) return 0;
    return Math.round((stages.filter((s) => s.status === "completed").length / stages.length) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-100 text-emerald-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "on_hold": return "bg-amber-100 text-amber-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "in_progress": return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Circle className="h-4 w-4 text-gray-300" />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deployment Management</h1>
          <p className="text-muted-foreground">Manage candidate deployments overseas</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Deployment</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Deployment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Candidate User ID *</Label>
                <Select value={candidateId} onValueChange={(v) => { setCandidateId(v); setCandidateSearch(v ? String(v) : ""); }}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCandidates ? "Loading..." : "Select candidate"} />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name} - {c.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Job Title *</Label>
                <Input placeholder="e.g. Welder" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input placeholder="Company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Destination Country *</Label>
                  <Input placeholder="e.g. Saudi Arabia" value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Destination City</Label>
                  <Input placeholder="e.g. Riyadh" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Expected Joining Date</Label>
                <Input type="date" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea rows={3} placeholder="Additional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create Deployment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {deployments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Plane className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Deployments</h3>
            <p className="text-muted-foreground text-center">Create a deployment to start tracking a candidate's overseas job process.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {deployments.map((deployment) => {
            const progress = getProgress(deployment.stages);
            return (
              <Card key={deployment.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{deployment.job_title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {deployment.candidate?.name} {deployment.company_name && `• ${deployment.company_name}`}
                      </p>
                    </div>
                    <Badge className={getStatusColor(deployment.status)}>
                      {deployment.status.replaceAll("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {deployment.destination_city ? `${deployment.destination_city}, ` : ""}{deployment.destination_country}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="space-y-1">
                    {deployment.stages.map((stage) => (
                      <div
                        key={stage.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer group"
                        onClick={() => {
                          setEditingStageId(stage.id);
                          setStageStatus(stage.status);
                          setStageRemarks(stage.remarks || "");
                          setStageDeadline(stage.deadline ? stage.deadline.split("T")[0] : "");
                          setStageUpdateOpen(true);
                        }}
                      >
                        {getStageIcon(stage.status)}
                        <span className="flex-1 text-sm font-medium">{stage.stage_label}</span>
                        <Badge variant="outline" className="text-xs">{stage.status.replaceAll("_", " ")}</Badge>
                        {stage.deadline && (
                          <span className="text-xs text-muted-foreground">Due: {new Date(stage.deadline).toLocaleDateString()}</span>
                        )}
                        <Pencil className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stage Update Dialog */}
      <Dialog open={stageUpdateOpen} onOpenChange={setStageUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stage</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={stageStatus} onValueChange={setStageStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Textarea rows={3} value={stageRemarks} onChange={(e) => setStageRemarks(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Input type="date" value={stageDeadline} onChange={(e) => setStageDeadline(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleStageUpdate} disabled={updatingStage}>
              {updatingStage ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : "Update Stage"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
