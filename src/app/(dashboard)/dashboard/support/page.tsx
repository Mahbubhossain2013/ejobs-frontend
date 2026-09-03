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
}

interface TicketDetail extends Ticket {
  replies: TicketReply[];
}

interface PaginatedData {
  data: Ticket[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
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

export default function SupportPage() {
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

  /* ── Thread state ── */
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(
    null
  );
  const [ticketDetailLoading, setTicketDetailLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    fetchTickets();
  };

  /* ─── Submit reply ─── */

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    setSendingReply(true);
    try {
      await api.post(`/support/tickets/${selectedTicket.id}/reply`, {
        message: replyMessage.trim(),
      });
      setReplyMessage("");
      await fetchTicketDetail(selectedTicket.id);
      toast.success(isBn ? "উত্তর পাঠানো হয়েছে" : "Reply sent successfully");
    } catch {
      toast.error(isBn ? "উত্তর পাঠাতে ব্যর্থ" : "Failed to send reply");
    } finally {
      setSendingReply(false);
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
      await api.post("/support/tickets", form);
      setDialogOpen(false);
      setForm({
        subject: "",
        category: "general",
        priority: "medium",
        message: "",
      });
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
                        disabled={sendingReply}
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
                        disabled={sendingReply || !replyMessage.trim()}
                        size="icon"
                        className="h-10 w-10 shrink-0"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      {isBn
                        ? "এন্টার চেপে পাঠান, শিফট+এন্টার নতুন লাইন"
                        : "Press Enter to send, Shift+Enter for new line"}
                    </p>
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
