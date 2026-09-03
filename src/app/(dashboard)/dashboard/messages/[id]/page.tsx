"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useThemeStore } from "@/store/theme-store";
import { useAuth } from "@/hooks/use-auth";
import { messagesService } from "@/services/messages.service";
import { MessageAttachment } from "@/components/messages/MessageAttachment";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DefaultAvatar } from "@/components/ui/default-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Send,
  MessageSquare,
  MoreVertical,
  Ban,
  Flag,
} from "lucide-react";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import type { Message } from "@/types";

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const { user } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [convMeta, setConvMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load messages
  useEffect(() => {
    if (!id) return;
    messagesService
      .getMessages(id)
      .then((res: any) => {
        setMessages(res?.messages || res || []);
        setConvMeta(res?.conversation || null);
      })
      .catch(() => { toast.error("Failed to load messages"); })
      .finally(() => setLoading(false));
  }, [id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading]);

  const handleSend = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    try {
      const res = await messagesService.sendMessage(id, trimmed);
      const newMsg = res?.data || res?.message;
      if (newMsg) {
        setMessages((prev) => [...prev, newMsg]);
      } else {
        // Optimistic: add a temporary message
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender_id: user?.id,
            content: trimmed,
            message: trimmed,
            created_at: new Date().toISOString(),
          },
        ]);
      }
      setBody("");
    } catch {
      toast.error(isBn ? "বার্তা পাঠাতে ব্যর্থ" : "Failed to send message");
    } finally {
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBlock = async () => {
    setShowMenu(false);
    try {
      await messagesService.blockUser(id);
      toast.success(isBn ? "ব্লক করা হয়েছে" : "User blocked");
      router.push("/dashboard/messages");
    } catch {
      toast.error(isBn ? "ব্লক করা যায়নি" : "Failed to block user");
    }
  };

  const handleReport = async () => {
    setShowMenu(false);
    const reason = window.prompt(
      isBn ? "রিপোর্টের কারণ লিখুন:" : "Enter reason for report:"
    );
    if (!reason) return;
    try {
      await messagesService.reportUser(id, reason);
      toast.success(isBn ? "রিপোর্ট করা হয়েছে" : "User reported");
    } catch {
      toast.error(isBn ? "রিপোর্ট করা যায়নি" : "Failed to report user");
    }
  };

  // Determine the other participant from conversation metadata or messages
  const otherParticipant = messages.find((m) => m.sender_id !== user?.id);
  const otherName = otherParticipant?.sender?.name || convMeta?.other_party?.name || (isBn ? "ব্যবহারকারী" : "User");
  const otherAvatar = otherParticipant?.sender?.avatar || otherParticipant?.sender?.profile?.avatar || convMeta?.other_party?.avatar || convMeta?.other_party?.profile?.avatar;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/messages">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          {loading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <DefaultAvatar src={otherAvatar} name={otherName} />
              <div>
                <p className="font-medium text-sm">
                  {otherName}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-50 bg-popover border rounded-lg shadow-lg py-1 min-w-[160px]">
                <button
                  onClick={handleBlock}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                >
                  <Ban className="h-4 w-4" />
                  {isBn ? "ব্লক করুন" : "Block User"}
                </button>
                <button
                  onClick={handleReport}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                >
                  <Flag className="h-4 w-4" />
                  {isBn ? "রিপোর্ট করুন" : "Report User"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
              >
                <Skeleton className="h-10 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : !messages.length ? (
          <div className="flex flex-col items-center justify-center h-full">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm">
              {isBn
                ? "কোনো বার্তা নেই। প্রথম বার্তা পাঠান!"
                : "No messages yet. Send the first message!"}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            const attachmentPath = msg.attachment_path;
            const attachmentUrl = attachmentPath
              ? attachmentPath.startsWith("http")
                ? attachmentPath
                : `/api/messages/attachment/${encodeURIComponent(attachmentPath)}`
              : null;
            const attachmentName = attachmentPath ? attachmentPath.split("/").pop() : "";
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isMine
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <MessageAttachment url={attachmentUrl} name={attachmentName} mine={isMine} />
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.message || msg.content || msg.body}
                  </p>
                  <p
                    className={`text-[10px] mt-1 ${
                      isMine
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {msg.created_at && formatRelativeTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-2 border-t">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            placeholder={isBn ? "বার্তা লিখুন..." : "Type a message..."}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!body.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
