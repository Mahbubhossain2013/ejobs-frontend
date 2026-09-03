"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import api from "@/lib/api-client";
import { useThemeStore } from "@/store/theme-store";
import { useAuthStore } from "@/store/auth-store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listenToMessages } from "@/lib/echo";
import { MessageAttachment } from "@/components/messages/MessageAttachment";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DefaultAvatar } from "@/components/ui/default-avatar";
import { toast } from "sonner";
import { getStorageUrl } from "@/lib/utils";
import {
  Briefcase,
  Upload,
  X,
  Send,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  DollarSign,
  RefreshCw,
  MessageSquare,
  ArrowLeft,
  Paperclip,
  ImageIcon,
  FileCode,
  FileArchive,
  Download,
} from "lucide-react";
import {
  formatCurrency,
} from "@/lib/utils";

/* ─── Interfaces ─── */

interface DeliveryRecord {
  id: number;
  message: string;
  attachments?: string[];
  status: string;
  created_at: string;
}

interface Project {
  id: number;
  job_id: number;
  title: string;
  description?: string;
  employer?: { id: number; name: string; avatar?: string };
  company?: { id: number; name: string; logo?: string; user?: { id: number; name: string; avatar?: string } };
  budget?: number;
  project_status:
    | "in_progress"
    | "submitted"
    | "revision_requested"
    | "completed"
    | "disputed";
  escrow?: {
    amount: number;
    status: string;
    platform_fee?: number;
  };
  deliveries?: DeliveryRecord[];
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: number | string;
  sender_id: number;
  receiver_id: number;
  message: string;
  attachment_path?: string;
  created_at: string;
  is_read: boolean;
  _pending?: boolean;
  _failed?: boolean;
}

/* ─── Status Config ─── */

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  in_progress: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    icon: Clock,
  },
  submitted: {
    label: "Submitted",
    color:
      "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    icon: Send,
  },
  revision_requested: {
    label: "Revision Requested",
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    icon: RefreshCw,
  },
  completed: {
    label: "Completed",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    icon: CheckCircle,
  },
  disputed: {
    label: "Disputed",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    icon: AlertTriangle,
  },
};

/* ─── Helper: format time for chat bubbles ─── */

function formatChatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ─── Helpers (stable, outside component) ─── */

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return ImageIcon;
  if (["zip", "rar", "7z"].includes(ext)) return FileArchive;
  if (["js", "ts", "jsx", "tsx", "py", "java", "php", "html", "css", "json", "xml"].includes(ext)) return FileCode;
  return FileText;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ─── Component ─── */

export default function CandidateWorkspacePage() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const { user } = useAuthStore();
  const currentUserId = user?.id;

  /* ── Projects ── */
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading: loading } = useQuery<Project[]>({
    queryKey: ["candidate", "workspace"],
    queryFn: async () => {
      const res = await api.get("/candidate/workspace");
      const raw = res.data.data || [];
      return raw.map((p: any) => ({
        ...p,
        employer: p.employer || (p.company?.user ? { id: p.company.user.id, name: p.company.user.name, avatar: p.company.user.avatar } : undefined),
      }));
    },
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
  });

  /* ── Chat ── */
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationUuid, setConversationUuid] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const echoCleanupRef = useRef<(() => void) | null>(null);

  /* ── Mobile chat visibility ── */
  const [showMobileChat, setShowMobileChat] = useState(false);

  /* ── Chat Attachments ── */
  const [attachFiles, setAttachFiles] = useState<File[]>([]);

  // Memoize object URLs and revoke on cleanup (prevents memory leak)
  const attachFileUrls = useMemo(() => attachFiles.map((f) => ({
    url: URL.createObjectURL(f),
    name: f.name,
    size: f.size,
    type: f.type,
  })), [attachFiles]);

  useEffect(() => {
    return () => { attachFileUrls.forEach((u) => URL.revokeObjectURL(u.url)); };
  }, [attachFileUrls]);

  /* ── Submit Work Dialog ── */
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submitProject, setSubmitProject] = useState<Project | null>(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* ── Dispute Dialog ── */
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [disputeProject, setDisputeProject] = useState<Project | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputing, setDisputing] = useState(false);

  /* ─── Derived ─── */

  const otherParty = useMemo(() =>
    selectedProject?.employer || (selectedProject?.company?.user ? { id: selectedProject.company.user.id, name: selectedProject.company.user.name, avatar: selectedProject.company.user.avatar } : null),
    [selectedProject]
  );

  const invalidateProjects = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["candidate", "workspace"] });
  }, [queryClient]);

  /* ─── Messages ─── */

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchMessages = useCallback(
    async (targetUserId: number) => {
      try {
        const res = await api.get(`/messages/direct/${targetUserId}`);
        const data = res.data.data;
        setChatMessages(data?.messages || []);
        if (res.data.conversation?.uuid) {
          setConversationUuid(res.data.conversation.uuid);
        }
      } catch {
        // Silently fail on poll; only show error on initial load
      }
    },
    []
  );

  const selectProject = useCallback(
    async (project: Project) => {
      setSelectedProject(project);
      setShowMobileChat(true);
      setChatMessages([]);
      setChatInput("");
      setAttachFiles([]);
      setConversationUuid(null);

      const employerUser = project.employer || project.company?.user;
      if (!employerUser) return;

      setChatLoading(true);
      try {
        const res = await api.get(`/messages/direct/${employerUser.id}`);
        const data = res.data.data;
        setChatMessages(data?.messages || []);
      } catch {
        toast.error(
          isBn
            ? "বার্তা লোড করতে ব্যর্থ"
            : "Failed to load messages"
        );
      } finally {
        setChatLoading(false);
      }
    },
    [isBn]
  );

  // Real-time messages via WebSocket
  useEffect(() => {
    if (echoCleanupRef.current) {
      echoCleanupRef.current();
      echoCleanupRef.current = null;
    }

    if (!conversationUuid) return;

    try {
      const cleanup = listenToMessages(conversationUuid, (data: any) => {
        const newMsg = data.message;
        if (!newMsg) return;
        setChatMessages((prev) => {
          if (prev.some((m: any) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      });
      echoCleanupRef.current = cleanup;
    } catch {
      // Echo not available, fallback silently
    }

    return () => {
      if (echoCleanupRef.current) {
        echoCleanupRef.current();
        echoCleanupRef.current = null;
      }
    };
  }, [conversationUuid]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  // Flash tab title when a new incoming message arrives, reset on focus
  useEffect(() => {
    if (!chatMessages.length) return;
    const last = chatMessages[chatMessages.length - 1];
    if (!last || last.sender_id === currentUserId || last._pending) return;
    const base = isBn ? "eJobs | কর্মক্ষেত্র" : "eJobs | Workspace";
    document.title = `(1) New Message | ${base}`;
    const reset = () => { document.title = base; };
    window.addEventListener("focus", reset);
    return () => window.removeEventListener("focus", reset);
  }, [chatMessages, currentUserId, isBn]);

  const sendMessage = async () => {
    if ((!chatInput.trim() && attachFiles.length === 0) || !otherParty) return;

    const text = chatInput.trim();
    const files = [...attachFiles];
    setChatInput("");
    setAttachFiles([]);

    // Optimistic bubble — instant like Messenger
    const tempId = `temp-${Date.now()}`;
    const optimistic: any = {
      id: tempId,
      sender_id: user?.id,
      message: text,
      created_at: new Date().toISOString(),
      _pending: true,
    };
    setChatMessages((prev) => [...prev, optimistic]);

    try {
      let res;
      if (files.length > 0) {
        const formData = new FormData();
        formData.append("message", text);
        files.forEach((f) => formData.append("attachment", f));
        res = await api.post(`/messages/direct/${otherParty.id}`, formData);
      } else {
        res = await api.post(`/messages/direct/${otherParty.id}`, { message: text });
      }
      const sentMsg = res.data?.data;
      if (sentMsg?.id) {
        setChatMessages((prev) => prev.map((m) => (m.id === tempId ? { ...sentMsg, _pending: false } : m)));
      } else {
        setChatMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, _pending: false } : m)));
      }
    } catch {
      toast.error(
        isBn ? "বার্তা পাঠাতে ব্যর্থ" : "Failed to send message"
      );
      setChatMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, _pending: false, _failed: true } : m)));
      setChatInput(text);
      setAttachFiles(files);
    }
  };

  // Fallback polling for open chat when WebSocket is unavailable
  useEffect(() => {
    if (!conversationUuid) return;
    const id = setInterval(() => {
      api.get(`/messages/conversation/${conversationUuid}`).then((res: any) => {
        const list = res?.data?.data || [];
        setChatMessages((prev) => {
          const known = new Set(prev.map((m: any) => m.id));
          const fresh = list.filter((m: any) => !known.has(m.id) && !String(m.id).startsWith("temp-"));
          return fresh.length ? [...prev, ...fresh] : prev;
        });
      }).catch(() => {});
    }, 15000);
    return () => clearInterval(id);
  }, [conversationUuid]);

  /* ─── Submit Work ─── */

  const handleOpenSubmit = (project: Project) => {
    setSubmitProject(project);
    setSubmitMessage("");
    setSubmitFile(null);
    setSubmitDialogOpen(true);
  };

  const handleSubmitWork = async () => {
    if (!submitProject) return;
    if (!submitMessage.trim()) {
      toast.error(isBn ? "বার্তা লিখুন" : "Please write a message");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("message", submitMessage);
      if (submitFile) {
        formData.append("attachments[0]", submitFile);
      }

      await api.post(
        `/candidate/workspace/${submitProject.id}/submit`,
        formData
      );

      toast.success(
        isBn
          ? "কাজ সফলভাবে জমা দেওয়া হয়েছে!"
          : "Work submitted successfully!"
      );
      setSubmitDialogOpen(false);
      invalidateProjects();
      // Refresh selected project data
      if (selectedProject?.id === submitProject.id) {
        selectProject(submitProject);
      }
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (isBn ? "জমা দিতে ব্যর্থ" : "Failed to submit work");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Dispute ─── */

  const handleOpenDispute = (project: Project) => {
    setDisputeProject(project);
    setDisputeReason("");
    setDisputeDialogOpen(true);
  };

  const handleDispute = async () => {
    if (!disputeProject) return;
    if (!disputeReason.trim()) {
      toast.error(isBn ? "কারণ লিখুন" : "Please provide a reason");
      return;
    }

    setDisputing(true);
    try {
      await api.post(`/candidate/workspace/${disputeProject.id}/dispute`, {
        reason: disputeReason,
      });

      toast.success(
        isBn ? "বিরোধ জমা দেওয়া হয়েছে" : "Dispute submitted"
      );
      setDisputeDialogOpen(false);
      invalidateProjects();
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (isBn ? "বিরোধ জমা দিতে ব্যর্থ" : "Failed to submit dispute");
      toast.error(msg);
    } finally {
      setDisputing(false);
    }
  };

  /* ─── Helpers ─── */

  const canSubmit = (status: string) =>
    ["in_progress", "revision_requested"].includes(status);

  /* ─── Render ─── */

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] -m-6 md:-mx-6 md:-my-6 overflow-hidden">
      {/* ═══════════════════════════════════════════
          LEFT PANEL — Project List
         ═══════════════════════════════════════════ */}
      <div
        className={`${
          showMobileChat ? "hidden md:flex" : "flex"
        } flex-col w-full md:w-1/3 lg:w-[30%] border-r bg-background overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h2 className="text-lg font-semibold">
            {isBn ? "কর্মক্ষেত্র" : "Workspace"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={invalidateProjects}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {isBn
                  ? "এখনো কোনো প্রজেক্ট নেই"
                  : "No assigned projects yet"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {projects.map((project) => {
                const statusInfo =
                  statusConfig[project.project_status] ||
                  statusConfig.in_progress;
                const isActive = selectedProject?.id === project.id;
                const other = project.employer;

                return (
                  <button
                    key={project.id}
                    onClick={() => selectProject(project)}
                    className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                      isActive ? "bg-muted/70" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <DefaultAvatar src={other?.avatar} name={other?.name} className="h-10 w-10 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-medium truncate">
                            {project.title}
                          </h3>
                          <Badge
                            className={`shrink-0 text-[10px] px-1.5 py-0 ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {other?.name || isBn ? "অজ্ঞাত" : "Unknown"}
                        </p>
                        {project.budget != null && (
                          <p className="text-xs font-medium mt-1">
                            {formatCurrency(project.budget)}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          RIGHT PANEL — Chat Area
         ═══════════════════════════════════════════ */}
      <div
        className={`${
          showMobileChat ? "flex" : "hidden md:flex"
        } flex-col flex-1 min-w-0 bg-background overflow-hidden`}
      >
        {!selectedProject ? (
          /* ── Empty State ── */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-4">
              <Briefcase className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-1">
                {isBn
                  ? "চ্যাট শুরু করতে একটি প্রজেক্ট নির্বাচন করুন"
                  : "Select a project to start chatting"}
              </h3>
              <p className="text-sm text-muted-foreground/60">
                {isBn
                  ? "বাম পাশের তালিকা থেকে একটি প্রজেক্ট বেছে নিন"
                  : "Pick a project from the list on the left"}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Chat Top Bar ── */}
            <div className="flex items-center gap-3 p-4 border-b shrink-0">
              {/* Mobile back button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:hidden shrink-0"
                onClick={() => setShowMobileChat(false)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <DefaultAvatar src={otherParty?.avatar} name={otherParty?.name} className="h-9 w-9 shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold truncate">
                  {selectedProject.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {otherParty?.name || ""}
                </p>
              </div>
              {(() => {
                const statusInfo =
                  statusConfig[selectedProject.project_status] ||
                  statusConfig.in_progress;
                const StatusIcon = statusInfo.icon;
                return (
                  <Badge className={`shrink-0 ${statusInfo.color}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                );
              })()}
            </div>

            {/* ── Project Info Card ── */}
            <div className="px-4 py-3 border-b bg-muted/30 shrink-0">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {selectedProject.budget != null && (
                  <span className="flex items-center gap-1 font-semibold">
                    <DollarSign className="h-4 w-4" />
                    {formatCurrency(selectedProject.budget)}
                  </span>
                )}
                {selectedProject.escrow && (
                  <>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      {isBn ? "এসক্রো:" : "Escrow:"}{" "}
                      <span className="font-medium text-foreground">
                        {formatCurrency(selectedProject.escrow.amount)}
                      </span>
                      <Badge variant="outline" className="text-[10px] ml-0.5">
                        {selectedProject.escrow.status}
                      </Badge>
                    </span>
                    {selectedProject.escrow.platform_fee != null && (
                      <span className="text-muted-foreground text-xs">
                        {isBn ? "প্ল্যাটফর্ম ফি:" : "Fee:"}{" "}
                        {formatCurrency(selectedProject.escrow.platform_fee)}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-3">
                {canSubmit(selectedProject.project_status) && (
                  <Button
                    size="sm"
                    onClick={() => handleOpenSubmit(selectedProject)}
                  >
                    <Send className="h-4 w-4 mr-1.5" />
                    {isBn ? "কাজ জমা দিন" : "Submit Work"}
                  </Button>
                )}
                {selectedProject.project_status !== "completed" &&
                  selectedProject.project_status !== "disputed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDispute(selectedProject)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-1.5" />
                      {isBn ? "বিরোধ" : "Open Dispute"}
                    </Button>
                  )}
              </div>

              {/* Deliveries merged into info card */}
              {selectedProject.deliveries && selectedProject.deliveries.length > 0 && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    {isBn ? "জমাকৃত কাজ" : "Submissions"} ({selectedProject.deliveries.length})
                  </p>
                  {selectedProject.deliveries.map((d) => (
                    <div key={d.id} className="p-2 rounded-lg bg-background border text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Badge variant={d.status === "submitted" ? "default" : d.status === "revision_requested" ? "destructive" : "secondary"} className="text-[10px]">
                          {d.status}
                        </Badge>
                        <span className="text-muted-foreground">{formatChatTime(d.created_at)}</span>
                      </div>
                      {d.message && <p className="text-muted-foreground">{d.message}</p>}
                      {d.attachments && d.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {d.attachments.map((attPath, i) => (
                            <a
                              key={i}
                              href={getStorageUrl(attPath) || `/storage/${attPath}`}
                              download
                              className="flex items-center gap-1 px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors"
                            >
                              {/\.(jpg|jpeg|png|gif|webp)$/i.test(attPath) ? (
                                <img src={getStorageUrl(attPath) || `/storage/${attPath}`} alt="" className="h-5 w-5 rounded object-cover" />
                              ) : (
                                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              )}
                              <span className="truncate max-w-[120px]">{attPath.split("/").pop()}</span>
                              <Download className="h-3 w-3 text-muted-foreground shrink-0" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Chat Messages ── */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {chatLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                    >
                      <Skeleton className="h-10 w-48 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {isBn
                      ? "এখনো কোনো বার্তা নেই। চ্যাট শুরু করুন!"
                      : "No messages yet. Start the conversation!"}
                  </p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isOwn = msg.sender_id === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg px-4 py-2 ${
                          isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {!isOwn && otherParty && (
                          <p className="text-xs font-medium mb-0.5 opacity-70">
                            {otherParty.name}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.message}
                        </p>
                        {msg.attachment_path && (
                          <MessageAttachment
                            url={getStorageUrl(msg.attachment_path) || `/storage/${msg.attachment_path}`}
                            name={msg.attachment_path.split("/").pop() || ""}
                            mine={isOwn}
                          />
                        )}
                        <p
                          className={`text-[10px] mt-1 flex items-center gap-1 ${
                            isOwn
                              ? "text-primary-foreground/60"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatChatTime(msg.created_at)}
                          {msg._pending && <Clock className="h-3 w-3" />}
                          {msg._failed && <span className="text-red-400">{isBn ? "ব্যর্থ" : "Failed"}</span>}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Message Input ── */}
            <div className="p-4 border-t shrink-0">
              {/* Attachment previews */}
              {attachFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {attachFileUrls.map((f, i) => {
                    const isImage = f.type.startsWith("image/");
                    const FileIcon = getFileIcon(f.name);
                    return (
                      <div key={i} className="relative group">
                        {isImage ? (
                          <img
                            src={f.url}
                            alt={f.name}
                            className="h-16 w-16 object-cover rounded-lg border"
                          />
                        ) : (
                          <div className="h-16 w-24 flex flex-col items-center justify-center rounded-lg border bg-muted gap-1">
                            <FileIcon className="h-5 w-5 text-muted-foreground" />
                            <span className="text-[9px] text-muted-foreground truncate max-w-[80px] px-1">
                              {f.name}
                            </span>
                          </div>
                        )}
                        <div className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() =>
                              setAttachFiles((prev) =>
                                prev.filter((_, idx) => idx !== i)
                              )
                            }
                            className="h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-[9px] text-muted-foreground text-center mt-0.5 truncate max-w-[64px]">
                          {formatFileSize(f.size)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex items-end gap-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.zip,.rar,.7z,.txt,.js,.ts,.jsx,.tsx,.py,.java,.php,.html,.css,.json,.xml"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      setAttachFiles((prev) => [...prev, ...files].slice(0, 5));
                    }
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={
                    isBn ? "বার্তা লিখুন..." : "Type a message..."
                  }
                  className="flex-1"
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  disabled={!chatInput.trim() && attachFiles.length === 0}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════
          DIALOGS
         ═══════════════════════════════════════════ */}

      {/* Submit Work Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isBn ? "কাজ জমা দিন" : "Submit Work"}
            </DialogTitle>
            {submitProject && (
              <p className="text-sm text-muted-foreground">
                {submitProject.title}
              </p>
            )}
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{isBn ? "বার্তা *" : "Message *"}</Label>
              <Textarea
                placeholder={
                  isBn
                    ? "আপনার কাজ সম্পর্কে বিবরণ লিখুন..."
                    : "Describe your work submission..."
                }
                value={submitMessage}
                onChange={(e) => setSubmitMessage(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{isBn ? "সংযুক্তি" : "Attachment"}</Label>
              <div className="mt-1">
                {submitFile ? (
                  <div className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate max-w-[200px]">
                        {submitFile.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setSubmitFile(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {isBn
                        ? "ফাইল নির্বাচন করুন"
                        : "Choose a file to upload"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setSubmitFile(file);
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
            <Button
              onClick={handleSubmitWork}
              disabled={submitting || !submitMessage.trim()}
              className="w-full"
            >
              {submitting
                ? isBn
                  ? "জমা দিচ্ছে..."
                  : "Submitting..."
                : isBn
                ? "কাজ জমা দিন"
                : "Submit Work"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog open={disputeDialogOpen} onOpenChange={setDisputeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isBn ? "বিরোধ খোলুন" : "Open Dispute"}
            </DialogTitle>
            {disputeProject && (
              <p className="text-sm text-muted-foreground">
                {disputeProject.title}
              </p>
            )}
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{isBn ? "কারণ *" : "Reason *"}</Label>
              <Textarea
                placeholder={
                  isBn
                    ? "বিরোধের কারণ বিস্তারিত লিখুন..."
                    : "Explain the reason for the dispute..."
                }
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleDispute}
              disabled={disputing || !disputeReason.trim()}
              className="w-full"
              variant="destructive"
            >
              {disputing
                ? isBn
                  ? "জমা দিচ্ছে..."
                  : "Submitting..."
                : isBn
                ? "বিরোধ জমা দিন"
                : "Submit Dispute"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
