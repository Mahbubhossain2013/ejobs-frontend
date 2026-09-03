"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
import { useThemeStore } from "@/store/theme-store";
import { toast } from "sonner";
import api from "@/lib/api-client";
import { formatRelativeTime } from "@/lib/utils";
import PublicLayout from "@/components/layout/PublicLayout";
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
} from "lucide-react";

/* ─── Interfaces ─── */

interface Ticket {
  id: number;
  ticket_number?: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TicketMessage {
  id: number;
  sender_id: number;
  message: string;
  is_admin_reply: boolean;
  admin_role_label?: string;
  created_at: string;
  sender?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

interface TicketDetail extends Ticket {
  messages: TicketMessage[];
}

/* ─── Color maps ─── */

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  in_progress:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  answered:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
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

const CATEGORY_LABELS: Record<string, { en: string; bn: string }> = {
  general: { en: "General", bn: "সাধারণ" },
  billing: { en: "Billing", bn: "বিলিং" },
  technical: { en: "Technical", bn: "প্রযুক্তিগত" },
  account: { en: "Account", bn: "অ্যাকাউন্ট" },
  ai: { en: "AI", bn: "এআই" },
};

/* ─── Component ─── */

export default function SupportPage() {
  const router = useRouter();
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
      const res = await api.get("/tickets");
      setTickets(res.data?.data || []);
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

  const fetchTicketDetail = useCallback(
    async (ticketId: number) => {
      setTicketDetailLoading(true);
      try {
        const res = await api.get(`/tickets/${ticketId}`);
        setSelectedTicket(res.data?.data || null);
      } catch {
        // silent
      } finally {
        setTicketDetailLoading(false);
      }
    },
    []
  );

  /* ─── Scroll to bottom when messages change ─── */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.messages]);

  /* ─── Select a ticket ─── */

  const handleSelectTicket = (ticket: Ticket) => {
    fetchTicketDetail(ticket.id);
  };

  /* ─── Back to list ─── */

  const handleBackToList = () => {
    setSelectedTicket(null);
    setReplyMessage("");
    // Refresh list in case status changed
    fetchTickets();
  };

  /* ─── Submit reply ─── */

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    setSendingReply(true);
    try {
      await api.post(`/tickets/${selectedTicket.id}/reply`, {
        message: replyMessage.trim(),
      });
      setReplyMessage("");
      // Re-fetch ticket to refresh messages
      await fetchTicketDetail(selectedTicket.id);
    } catch {
      // silent — could add toast here
    } finally {
      setSendingReply(false);
    }
  };

  /* ─── Create ticket ─── */

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.message.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/tickets", form);
      setDialogOpen(false);
      setForm({
        subject: "",
        category: "general",
        priority: "medium",
        message: "",
      });
      const res = await api.get("/tickets");
      setTickets(res.data?.data || []);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.message?.[0] || (isBn ? "টিকিট তৈরি করা যায়নি" : "Failed to create ticket");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Derived ─── */

  const isTicketClosed = selectedTicket?.status === "closed";

  /* ─── Render ─── */

  return (
    <PublicLayout>
      {/* ═══════════════════════════════════════
          Hero Section
         ═══════════════════════════════════════ */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-4">
            <Headphones className="h-3 w-3 mr-1" />
            {isBn ? "সাপোর্ট" : "Support"}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {isBn ? "সাপোর্ট টিকিট" : "Support Tickets"}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            {isBn
              ? "আপনার সমস্যার সমাধানে আমাদের সাথে যোগাযোগ করুন"
              : "Get help from our support team"}
          </p>
          {isAuthenticated && !selectedTicket && (
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
      </section>

      {/* ═══════════════════════════════════════
          Main Content
         ═══════════════════════════════════════ */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          {!isAuthenticated ? (
            /* ── Auth Gate ── */
            <div className="text-center py-16 text-muted-foreground">
              <Headphones className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {isBn ? "লগইন প্রয়োজন" : "Login Required"}
              </p>
              <p className="text-sm mb-4">
                {isBn
                  ? "সাপোর্ট টিকিট তৈরি করতে লগইন করুন"
                  : "Please login to create and view support tickets."}
              </p>
              <Button onClick={() => router.push("/login")}>
                {isBn ? "লগইন" : "Login"}
              </Button>
            </div>
          ) : selectedTicket ? (
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
                /* ── Thread Loading ── */
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
                          <div className="flex items-center gap-2 mb-1">
                            {selectedTicket.ticket_number && (
                              <span className="text-xs text-muted-foreground font-mono">
                                {selectedTicket.ticket_number}
                              </span>
                            )}
                          </div>
                          <h2 className="text-lg font-semibold">
                            {selectedTicket.subject}
                          </h2>
                        </div>
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
                          {CATEGORY_LABELS[selectedTicket.category]?.[isBn ? "bn" : "en"] || selectedTicket.category}
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
                    {selectedTicket.messages.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">
                        <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
                        <p className="text-sm">
                          {isBn
                            ? "এখনো কোনো বার্তা নেই"
                            : "No messages yet"}
                        </p>
                      </div>
                    ) : (
                      selectedTicket.messages.map((msg) => {
                        const isOwn = msg.sender_id === user?.id;
                        const isAdmin = msg.is_admin_reply;
                        return (
                          <Card
                            key={msg.id}
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
                                {/* Avatar / Icon */}
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
                                  ) : msg.sender?.avatar ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={msg.sender.avatar}
                                      alt=""
                                      className="h-8 w-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <User className="h-4 w-4" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium">
                                      {msg.sender?.name ||
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
                                        {msg.admin_role_label ||
                                          (isBn
                                            ? "অ্যাডমিন"
                                            : "Admin")}
                                      </Badge>
                                    )}
                                    <span className="text-[11px] text-muted-foreground">
                                      {formatRelativeTime(msg.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-sm whitespace-pre-wrap break-words text-foreground">
                                    {msg.message}
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
                            onChange={(e) =>
                              setReplyMessage(e.target.value)
                            }
                            rows={2}
                            placeholder={
                              isBn
                                ? "আপনার উত্তর লিখুন..."
                                : "Write your reply..."
                            }
                            disabled={sendingReply}
                            className="flex-1 resize-none"
                            onKeyDown={(e) => {
                              if (
                                e.key === "Enter" &&
                                !e.shiftKey
                              ) {
                                e.preventDefault();
                                handleSendReply();
                              }
                            }}
                          />
                          <Button
                            onClick={handleSendReply}
                            disabled={
                              sendingReply || !replyMessage.trim()
                            }
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
            /* ── List Loading ── */
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            /* ── Empty State ── */
            <div className="text-center py-16 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
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
            /* ══════════════════════════════════════
                Ticket List
               ══════════════════════════════════════ */
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
                        {ticket.ticket_number && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {ticket.ticket_number}
                          </span>
                        )}
                        <h3 className="font-semibold text-sm mb-1">
                          {ticket.subject}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                          <Badge
                            variant="outline"
                            className="text-[10px]"
                          >
                            {CATEGORY_LABELS[ticket.category]?.[isBn ? "bn" : "en"] || ticket.category}
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
      </section>
    </PublicLayout>
  );
}
