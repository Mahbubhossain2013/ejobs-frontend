"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
import { useThemeStore } from "@/store/theme-store";
import { toast } from "sonner";
import api from "@/lib/api-client";
import { formatRelativeTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Headphones,
  Plus,
  Clock,
  CheckCircle,
  ArrowLeft,
  Send,
  MessageSquare,
  User,
  Shield,
  XCircle,
  ImageIcon,
  Paperclip,
  Download,
} from "lucide-react";

/* ─── Interfaces ─── */

interface Ticket {
  id: number;
  ticket_number?: string;
  subject: string;
  message?: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TicketReply {
  id: number;
  user_id: number;
  message: string;
  is_admin: boolean;
  created_at: string;
  user?: {
    id: number;
    name: string;
  };
  attachments?: string[];
}

interface TicketDetail extends Ticket {
  replies: TicketReply[];
}

/* ─── Color maps ─── */

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  resolved:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  closed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  medium: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  high: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  urgent: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  billing: "Billing",
  technical: "Technical",
  account: "Account",
};

/* ─── Component ─── */

export default function EmployerSupportPage() {
  const { isAuthenticated } = useAuth();
  const { user } = useAuthStore();
  const { language } = useThemeStore();
  const isBn = language === "bn";

  /* ── List state ── */
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    category: "general",
    priority: "medium",
    message: "",
  });
  const [ticketAttachments, setTicketAttachments] = useState<File[]>([]);

  /* ── Thread state ── */
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(
    null
  );
  const [ticketDetailLoading, setTicketDetailLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyAttachments, setReplyAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ticketFileInputRef = useRef<HTMLInputElement>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 400 * 1024;
  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  const validateFiles = (files: FileList | File[]) => {
    const valid: File[] = [];
    const oversized: string[] = [];
    const invalid: string[] = [];
    Array.from(files).forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        invalid.push(file.name);
      } else if (file.size > MAX_FILE_SIZE) {
        oversized.push(file.name);
      } else {
        valid.push(file);
      }
    });
    if (oversized.length)
      toast.error(
        `${
          isBn ? "৪০০KB+ ফাইল" : "Files over 400KB"
        }: ${oversized.join(", ")}`
      );
    if (invalid.length)
      toast.error(
        `${
          isBn ? "অযোগ্য ফাইল" : "Invalid files"
        }: ${invalid.join(", ")}`
      );
    return valid;
  };

  const compressImageToWebP = (file: File): Promise<File> =>
    new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) return resolve(file);
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1920;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (!blob) return reject(new Error("Conversion failed"));
            const converted = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, ".webp"),
              { type: "image/webp" }
            );
            resolve(converted);
          },
          "image/webp",
          0.82
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Image load failed"));
      };
      img.src = url;
    });

  const prepareAttachments = async (files: File[]) => {
    const valid = validateFiles(files);
    const prepared = await Promise.all(
      valid.map(async (file) =>
        file.type.startsWith("image/")
          ? compressImageToWebP(file)
          : file
      )
    );
    return prepared;
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Read failed"));
      reader.readAsDataURL(file);
    });

  /* ─── Fetch ticket list ─── */

  const fetchTickets = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await api.get("/support/tickets");
      setTickets(res.data?.data?.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchTickets();
  }, [isAuthenticated, fetchTickets]);

  /* ─── Fetch single ticket detail ─── */

  const fetchTicketDetail = useCallback(async (ticketId: number) => {
    setTicketDetailLoading(true);
    try {
      const res = await api.get(`/support/tickets/${ticketId}`);
      setSelectedTicket(res.data?.data || null);
    } catch {
      // silent
    } finally {
      setTicketDetailLoading(false);
    }
  }, []);

  /* ─── Scroll to bottom when messages change ─── */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.replies]);

  /* ─── Select a ticket ─── */

  const handleSelectTicket = (ticket: Ticket) => {
    fetchTicketDetail(ticket.id);
  };

  /* ─── Back to list ─── */

  const handleBackToList = () => {
    setSelectedTicket(null);
    setReplyMessage("");
    setReplyAttachments([]);
    fetchTickets();
  };

  /* ─── Submit reply ─── */

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    try {
      const prepared = await prepareAttachments(replyAttachments);
      const attachments = await Promise.all(
        prepared.map((file) => toBase64(file))
      );
      await api.post(`/support/tickets/${selectedTicket.id}/reply`, {
        message: replyMessage.trim(),
        attachments,
      });
      setReplyMessage("");
      setReplyAttachments([]);
      await fetchTicketDetail(selectedTicket.id);
      toast.success(isBn ? "উত্তর পাঠানো হয়েছে" : "Reply sent successfully");
    } catch {
      toast.error(isBn ? "উত্তর পাঠাতে ব্যর্থ" : "Failed to send reply");
    }
  };

  /* ─── Close ticket ─── */

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    try {
      await api.post(`/support/tickets/${selectedTicket.id}/close`);
      await fetchTicketDetail(selectedTicket.id);
      toast.success(isBn ? "টিকিট বন্ধ হয়েছে" : "Ticket closed successfully");
    } catch {
      toast.error(isBn ? "টিকিট বন্ধ করতে ব্যর্থ" : "Failed to close ticket");
    }
  };

  /* ─── Create ticket ─── */

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.message.trim()) return;
    setSubmitting(true);
    try {
      const prepared = await prepareAttachments(ticketAttachments);
      const attachments = await Promise.all(
        prepared.map((file) => toBase64(file))
      );
      await api.post("/support/tickets", { ...form, attachments });
      setDialogOpen(false);
      setForm({
        subject: "",
        category: "general",
        priority: "medium",
        message: "",
      });
      setTicketAttachments([]);
      toast.success(
        isBn ? "টিকিট তৈরি হয়েছে" : "Ticket created successfully"
      );
      fetchTickets();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.message?.[0] ||
        (isBn ? "টিকিট তৈরি করা যায়নি" : "Failed to create ticket");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Derived ─── */

  const isTicketClosed = selectedTicket?.status === "closed";

  const AttachmentPreview = ({ files }: { files: File[] }) => {
    const [previews, setPreviews] = useState<string[]>([]);
    useEffect(() => {
      let urls: string[] = [];
      setPreviews([]);
      Promise.all(
        files.map(
          (file) =>
            new Promise<string>((resolve) => {
              const url = URL.createObjectURL(file);
              urls.push(url);
              resolve(url);
            })
        )
      ).then(setPreviews);
      return () => urls.forEach((url) => URL.revokeObjectURL(url));
    }, [files]);

    if (!previews.length) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {previews.map((src, idx) => (
          <img
            key={src}
            src={src}
            alt={files[idx].name}
            className="h-16 w-16 object-cover rounded border"
          />
        ))}
      </div>
    );
  };

  const AttachmentList = ({ attachments }: { attachments?: string[] }) => {
    if (!attachments || !attachments.length) return null;
    return (
      <div className="mt-2 space-y-1">
        {attachments.map((item, idx) => {
          const isImage = item.startsWith("data:image") || /\.(jpg|jpeg|png|gif|webp)$/i.test(item);
          const name = item.split("/").pop()?.split("?")[0] || `attachment-${idx + 1}`;
          return (
            <div
              key={idx}
              className="flex items-center gap-2 text-xs"
            >
              {isImage ? (
                <div className="relative group">
                  <a href={item} target="_blank" rel="noreferrer" className="block">
                    <img
                      src={item}
                      alt={name}
                      className="h-16 w-16 object-cover rounded-lg border"
                    />
                  </a>
                  <a
                    href={item}
                    download={name}
                    title="Download"
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download className="h-3 w-3" />
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border bg-muted px-2 py-1.5 min-w-0">
                  <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <a
                    href={item}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-primary underline max-w-[200px]"
                  >
                    {name}
                  </a>
                  <a
                    href={item}
                    download={name}
                    title="Download"
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  /* ─── Render ─── */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isBn ? "সাপোর্ট টিকিট" : "Support Tickets"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isBn
              ? "আপনার সমস্যার সমাধানে আমাদের সাথে যোগাযোগ করুন"
              : "Get help from our support team"}
          </p>
        </div>
        {!selectedTicket && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {isBn ? "নতুন টিকিট" : "New Ticket"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {isBn
                    ? "নতুন সাপোর্ট টিকিট"
                    : "Create Support Ticket"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>{isBn ? "বিষয়" : "Subject"}</Label>
                  <Input
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    placeholder={
                      isBn
                        ? "সমস্যার সংক্ষিপ্ত বিবরণ"
                        : "Brief description of the issue"
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>{isBn ? "ক্যাটাগরি" : "Category"}</Label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="general">
                        {isBn ? "সাধারণ" : "General"}
                      </option>
                      <option value="billing">
                        {isBn ? "বিলিং" : "Billing"}
                      </option>
                      <option value="technical">
                        {isBn ? "প্রযুক্তিগত" : "Technical"}
                      </option>
                      <option value="account">
                        {isBn ? "অ্যাকাউন্ট" : "Account"}
                      </option>
                    </select>
                  </div>
                  <div>
                    <Label>{isBn ? "অগ্রাধিকার" : "Priority"}</Label>
                    <select
                      value={form.priority}
                      onChange={(e) =>
                        setForm({ ...form, priority: e.target.value })
                      }
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="low">
                        {isBn ? "কম" : "Low"}
                      </option>
                      <option value="medium">
                        {isBn ? "মাঝারি" : "Medium"}
                      </option>
                      <option value="high">
                        {isBn ? "উচ্চ" : "High"}
                      </option>
                      <option value="urgent">
                        {isBn ? "জরুরি" : "Urgent"}
                      </option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label>{isBn ? "বিবরণ" : "Message"}</Label>
                  <Textarea
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    rows={4}
                    placeholder={
                      isBn
                        ? "আপনার সমস্যার বিস্তারিত বিবরণ লিখুন"
                        : "Describe your issue in detail"
                    }
                  />
                </div>
                <div>
                  <Label>{isBn ? "সংযুক্তি" : "Attachments"}</Label>
                  <input
                    ref={ticketFileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={async (e) => {
                      const files = await prepareAttachments(
                        Array.from(e.target.files || [])
                      );
                      setTicketAttachments((prev) => [...prev, ...files]);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => ticketFileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    {isBn ? "ফাইল যোগ করুন" : "Add attachments"}
                  </Button>
                  <AttachmentPreview files={ticketAttachments} />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {isBn
                      ? "সর্বোচ্চ ৪০০KB, ছবি অটো webp-তে রূপান্তর হবে"
                      : "Max 400KB per file, images auto-convert to webp"}
                  </p>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting
                    ? "..."
                    : isBn
                      ? "পাঠান"
                      : "Submit Ticket"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Content */}
      {selectedTicket ? (
        /* ══════════════════════════════════════
            Thread View
           ══════════════════════════════════════ */
        <div>
          {/* Back button */}
          <Button
            variant="ghost"
            className="mb-4 -ml-2"
            onClick={handleBackToList}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isBn ? "তালিকায় ফিরুন" : "Back to tickets"}
          </Button>

          {ticketDetailLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          ) : (
            <>
              {/* Ticket Header */}
              <Card className="mb-4">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold">
                        {selectedTicket.subject}
                      </h2>
                    </div>
                    {!isTicketClosed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCloseTicket}
                        className="text-destructive hover:text-destructive shrink-0"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        {isBn ? "বন্ধ করুন" : "Close Ticket"}
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-semibold ${STATUS_COLORS[selectedTicket.status] || ""}`}
                    >
                      {selectedTicket.status.replace("_", " ")}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${PRIORITY_COLORS[selectedTicket.priority] || ""}`}
                    >
                      {selectedTicket.priority}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {CATEGORY_LABELS[selectedTicket.category] ||
                        selectedTicket.category}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(selectedTicket.created_at)}
                    </span>
                  </div>
                  <AttachmentList attachments={(selectedTicket as any).attachments} />
                </CardContent>
              </Card>

              {/* Message Thread */}
              <div className="space-y-3 mb-4">
                {selectedTicket.replies.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">
                      {isBn
                        ? "এখনো কোনো বার্তা নেই"
                        : "No messages yet"}
                    </p>
                  </div>
                ) : (
                  selectedTicket.replies.map((reply) => {
                    const isOwn = reply.user_id === user?.id;
                    const isAdmin = reply.is_admin;
                    return (
                      <Card
                        key={reply.id}
                        className={`${
                          isAdmin
                            ? "border-l-4 border-l-primary"
                            : isOwn
                              ? "border-l-4 border-l-emerald-500"
                              : ""
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                isAdmin
                                  ? "bg-primary/10 text-primary"
                                  : isOwn
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {isAdmin ? (
                                <Shield className="h-4 w-4" />
                              ) : (
                                <User className="h-4 w-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">
                                  {reply.user?.name ||
                                    (isAdmin
                                      ? isBn
                                        ? "সাপোর্ট টিম"
                                        : "Support Team"
                                      : isBn
                                        ? "আপনি"
                                        : "You")}
                                </span>
                                {isAdmin && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[9px] px-1.5 py-0"
                                  >
                                    {isBn ? "অ্যাডমিন" : "Admin"}
                                  </Badge>
                                )}
                                <span className="text-[11px] text-muted-foreground">
                                  {formatRelativeTime(reply.created_at)}
                                </span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap break-words text-foreground">
                                {reply.message}
                              </p>
                              <AttachmentList attachments={reply.attachments} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input */}
              {!isTicketClosed ? (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-end gap-2">
                      <Textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        rows={2}
                        placeholder={
                          isBn
                            ? "আপনার উত্তর লিখুন..."
                            : "Write your reply..."
                        }
                        className="flex-1 resize-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendReply();
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendReply}
                        disabled={!replyMessage.trim()}
                        size="icon"
                        className="h-10 w-10 shrink-0"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <input
                          ref={replyFileInputRef}
                          type="file"
                          className="hidden"
                          multiple
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          onChange={async (e) => {
                            const files = await prepareAttachments(
                              Array.from(e.target.files || [])
                            );
                            setReplyAttachments((prev) => [
                              ...prev,
                              ...files,
                            ]);
                            e.target.value = "";
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => replyFileInputRef.current?.click()}
                        >
                          <Paperclip className="h-4 w-4 mr-1" />
                          {isBn ? "সংযুক্তি" : "Attachment"}
                        </Button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {isBn
                          ? "এন্টার চেপে পাঠান, শিফট+এন্টার নতুন লাইন"
                          : "Press Enter to send, Shift+Enter for new line"}
                      </p>
                    </div>
                    <AttachmentPreview files={replyAttachments} />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      {isBn
                        ? "এই টিকিটটি বন্ধ রয়েছে। আর উত্তর দেওয়া যাবে না।"
                        : "This ticket is closed. No further replies can be added."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Headphones className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">
            {isBn ? "কোনো টিকিট নেই" : "No tickets yet"}
          </p>
          <p className="text-sm mt-1">
            {isBn
              ? "সাপোর্ট টিকিট তৈরি করতে উপরের বোতাম ক্লিক করুন"
              : "Click the button above to create your first ticket."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSelectTicket(ticket)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1">
                      {ticket.subject}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]">
                        {CATEGORY_LABELS[ticket.category] || ticket.category}
                      </Badge>
                      <span
                        className={`${PRIORITY_COLORS[ticket.priority] || ""} px-1.5 py-0.5 rounded text-[10px] font-medium`}
                      >
                        {ticket.priority}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(ticket.created_at)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-semibold ${STATUS_COLORS[ticket.status] || ""}`}
                  >
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
