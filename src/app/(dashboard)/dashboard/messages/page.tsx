"use client";

import React, { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useThemeStore } from "@/store/theme-store";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeMessages } from "@/hooks/use-realtime-messages";
import api from "@/lib/api-client";
import { messagesService } from "@/services/messages.service";
import { MessageAttachment } from "@/components/messages/MessageAttachment";
import { toast } from "sonner";
import { DefaultAvatar } from "@/components/ui/default-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, RefreshCw, Search, Send, ArrowLeft, Clock, FileText } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

function MessagesContent() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const targetUserId = searchParams.get("to");

  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [activeContract, setActiveContract] = useState<any>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fetchedRef = useRef(false);

  const getName = (c: any) => c?.other_party?.name || c?.participant?.name || "User";
  const getAvatar = (c: any) => c?.other_party?.avatar || c?.other_party?.profile?.avatar || c?.participant?.avatar;

  // Fetch conversations once
  const fetchConvs = useCallback(() => {
    messagesService.getConversations().then((res) => {
      const list = (res || []).filter((c: any) => c?.uuid);
      setConversations(list);
      setLoading(false);
    }).catch(() => { toast.error("Failed to load conversations"); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!fetchedRef.current) { fetchedRef.current = true; fetchConvs(); }
  }, [fetchConvs]);

  // Handle ?to= param
  useEffect(() => {
    if (!targetUserId) return;
    api.get(`/messages/direct/${targetUserId}`).then((res) => {
      const conv = res.data?.conversation;
      if (conv?.uuid) {
        fetchConvs();
        selectConv(conv);
      }
    }).catch(() => {});
  }, [targetUserId]);

  // Select a conversation
  const selectConv = (conv: any) => {
    if (!conv?.uuid) return;
    setSelectedId(conv.uuid);
    setSelectedConv(conv);
    setShowChat(true);
    setLoadingMsgs(true);
    messagesService.getMessages(conv.uuid).then((res: any) => {
      setMessages(res?.messages || []);
    }).catch(() => toast.error("Failed to load messages"))
      .finally(() => { setLoadingMsgs(false); setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50); });
  };

  // Auto-scroll
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Fetch contract for selected conversation's other party
  useEffect(() => {
    if (!selectedConv) { setActiveContract(null); return; }
    const otherUserId = selectedConv.other_party?.id || selectedConv.participant?.id;
    if (!otherUserId) { setActiveContract(null); return; }
    api.get("/candidate/contracts").then((res) => {
      const contracts = res.data?.data;
      const list = Array.isArray(contracts) ? contracts : contracts?.data || [];
      const match = list.find((c: any) => c.employer_id === otherUserId);
      setActiveContract(match || null);
    }).catch(() => setActiveContract(null));
  }, [selectedConv]);

  // Flash tab title when a new incoming message arrives, reset on focus
  useEffect(() => {
    if (!messages.length) return;
    const last = messages[messages.length - 1];
    if (!last || last.sender_id === user?.id || last._pending) return;
    const base = isBn ? "eJobs | বার্তা" : "eJobs | Messages";
    document.title = `(1) New Message | ${base}`;
    const reset = () => { document.title = base; };
    window.addEventListener("focus", reset);
    return () => window.removeEventListener("focus", reset);
  }, [messages, user?.id, isBn]);

  // Realtime incoming messages (WebSocket)
  useRealtimeMessages(selectedConv?.uuid, (incoming) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === incoming.id)) return prev;
      return [...prev, incoming];
    });
    // Bump conversation preview in sidebar
    setConversations((prev) =>
      prev.map((c) =>
        c.uuid === selectedConv?.uuid ? { ...c, messages: [...(c.messages || []), incoming] } : c
      )
    );
  });

  // Fallback polling when WebSocket is unavailable — light refresh of open chat
  useEffect(() => {
    if (!selectedConv?.uuid) return;
    const id = setInterval(() => {
      messagesService.getMessages(selectedConv.uuid).then((res: any) => {
        const list = res?.messages || [];
        setMessages((prev) => {
          const known = new Set(prev.map((m) => m.id));
          const fresh = list.filter((m: any) => !known.has(m.id));
          return fresh.length ? [...prev, ...fresh] : prev;
        });
      }).catch(() => {});
    }, 15000);
    return () => clearInterval(id);
  }, [selectedConv?.uuid]);

  // Poll conversation list so the sidebar stays fresh (previews, unread counts, ordering)
  useEffect(() => {
    const id = setInterval(() => {
      messagesService.getConversations().then((res) => {
        const list = (res || []).filter((c: any) => c?.uuid);
        setConversations((prev) => {
          const merged = list.map((c: any) => {
            const existing = prev.find((p) => p.uuid === c.uuid);
            return existing ? { ...c, messages: existing.messages?.length ? existing.messages : c.messages } : c;
          });
          const freshUuids = new Set(merged.map((c: any) => c.uuid));
          const stale = prev.filter((c) => !freshUuids.has(c.uuid));
          return [...stale, ...merged];
        });
      }).catch(() => {});
    }, 15000);
    return () => clearInterval(id);
  }, []);

  // Send (optimistic — instant like Messenger)
  const handleSend = async () => {
    const t = body.trim();
    if (!t || !selectedConv) return;
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      sender_id: user?.id,
      message: t,
      created_at: new Date().toISOString(),
      _pending: true,
    };
    setMessages((p) => [...p, optimistic]);
    setBody("");
    try {
      const res = await messagesService.sendMessage(selectedConv.uuid, t);
      const msg = res?.data?.data || res?.data || res?.message || res;
      setMessages((p) => p.map((m) => (m.id === tempId ? { ...msg, _pending: false } : m)));
      // Move conversation to top of sidebar
      setConversations((prev) => {
        const others = prev.filter((c) => c.uuid !== selectedConv.uuid);
        return [{ ...selectedConv, messages: [...(selectedConv.messages || []), msg] }, ...others];
      });
    } catch {
      setMessages((p) => p.map((m) => (m.id === tempId ? { ...m, _pending: false, _failed: true } : m)));
      toast.error(isBn ? "বার্তা পাঠাতে ব্যর্থ" : "Failed to send");
    } finally { inputRef.current?.focus(); }
  };

  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const filtered = conversations.filter((c: any) => !search || getName(c).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-3.5rem)] -m-4 md:-m-6 overflow-hidden">
      {/* ═══ LEFT: Sidebar ═══ */}
      <div className={`${showChat ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 lg:w-96 border-r bg-background shrink-0`}>
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h2 className="text-lg font-semibold">{isBn ? "বার্তা" : "Messages"}</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fetchConvs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <div className="px-3 pb-3 shrink-0">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input placeholder={isBn ? "খুঁজুন..." : "Search..."} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-2 space-y-1">{[...Array(5)].map((_, i) => <div key={i} className="flex items-center gap-3 p-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="flex-1"><Skeleton className="h-4 w-28 mb-1" /><Skeleton className="h-3 w-40" /></div></div>)}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">{isBn ? "কোনো বার্তা নেই" : "No conversations"}</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((c: any) => {
                const msgs = c.messages || [];
                const last = msgs.find((m: any) => m.message) || msgs[0];
                const lastText = last?.message || (last?.attachment_path ? (isBn ? "📎 ফাইল" : "📎 Attachment") : (isBn ? "কোনো বার্তা নেই" : "No messages"));
                const active = selectedId === c.uuid;
                return (
                  <button key={c.uuid} onClick={() => selectConv(c)} className={`w-full text-left p-3 hover:bg-muted/50 transition-colors ${active ? "bg-muted/70" : ""}`}>
                    <div className="flex items-start gap-3">
                      <DefaultAvatar src={getAvatar(c)} name={getName(c)} className="h-10 w-10 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium truncate">{getName(c)}</span>
                          <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">{last?.created_at && formatRelativeTime(last.created_at)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{lastText}</p>
                      </div>
                      {(c.unread_count ?? 0) > 0 && <Badge variant="destructive" className="shrink-0 text-[10px] px-1.5 py-0 mt-1">{c.unread_count}</Badge>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ═══ RIGHT: Chat ═══ */}
      <div className={`${!showChat ? "hidden md:flex" : "flex"} flex-col flex-1 min-w-0 bg-background`}>
        {!selectedConv ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">{isBn ? "একটি কথোপকথন নির্বাচন করুন" : "Select a conversation"}</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setShowChat(false)}><ArrowLeft className="h-5 w-5" /></Button>
                <DefaultAvatar src={getAvatar(selectedConv)} name={getName(selectedConv)} className="h-9 w-9" />
                <span className="font-medium text-sm truncate">{getName(selectedConv)}</span>
              </div>
              {activeContract && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => router.push(`/dashboard/contracts`)}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{isBn ? "চুক্তি দেখুন" : "View Contract"}</span>
                </Button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 pt-3 space-y-3">
              {loadingMsgs ? (
                <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-48 rounded-2xl" />)}</div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center"><MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" /><p className="text-sm text-muted-foreground">{isBn ? "কোনো বার্তা নেই" : "No messages"}</p></div>
              ) : (
                messages.map((msg: any) => {
                  const mine = msg.sender_id === user?.id;
                  const name = msg.sender?.name || (mine ? (isBn ? "আপনি" : "You") : getName(selectedConv));
                  const avatar = msg.sender?.avatar || msg.sender?.profile?.avatar;
                  const attachmentPath = msg.attachment_path;
                  const attachmentUrl = attachmentPath
                    ? attachmentPath.startsWith("http")
                      ? attachmentPath
                      : `/api/messages/attachment/${encodeURIComponent(attachmentPath)}`
                    : null;
                  const attachmentName = attachmentPath ? attachmentPath.split("/").pop() : "";
                  return (
                    <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] flex flex-col ${mine ? "items-end" : "items-start"}`}>
                        {!mine && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <DefaultAvatar src={avatar} name={name} className="h-5 w-5" />
                            <span className="text-[10px] text-muted-foreground font-medium">{name}</span>
                          </div>
                        )}
                        <div className={`rounded-2xl px-4 py-2 ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                          <MessageAttachment url={attachmentUrl} name={attachmentName} mine={mine} />
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.message || msg.content || msg.body || ""}</p>
                          <p className={`text-[10px] mt-1 flex items-center gap-1 ${mine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                            {formatRelativeTime(msg.created_at)}
                            {msg._pending && <Clock className="h-3 w-3" />}
                            {msg._failed && <span className="text-red-400">{isBn ? "ব্যর্থ" : "Failed"}</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="border-t p-3 shrink-0">
              <div className="flex gap-2 items-end">
                <Input ref={inputRef} value={body} onChange={(e) => setBody(e.target.value)} onKeyDown={onKey} placeholder={isBn ? "বার্তা লিখুন..." : "Type a message..."} className="flex-1 min-w-0" />
                <Button onClick={handleSend} disabled={!body.trim()} size="icon" className="h-9 w-9 shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <MessagesContent />
    </Suspense>
  );
}
