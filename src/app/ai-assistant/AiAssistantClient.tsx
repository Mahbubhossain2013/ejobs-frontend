"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useThemeStore } from "@/store/theme-store";
import { aiService } from "@/services/ai.service";
import { subscriptionService, type QuotaInfo } from "@/services/subscription.service";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DefaultAvatar } from "@/components/ui/default-avatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Sparkles, Bot, User, Zap, Crown, Loader2, MessageCircle, RefreshCcw, Copy, Check } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  typedChars?: number;
}

const QUICK_PROMPTS = [
  { en: "How to write a good CV?", bn: "ভালো CV কিভাবে লিখবেন?" },
  { en: "What salary should I expect?", bn: "আমি কত বেতন আশা করতে পারি?" },
  { en: "Tips for interview preparation", bn: "সাক্ষাৎকারের জন্য টিপস" },
  { en: "How to negotiate salary?", bn: "বেতন নিয়ে আলোচনা কিভাবে করবেন?" },
];

const MAX_PREVIEW_CHARS = 180;
const TYPING_SPEED = 18;

function cleanAiResponse(text: string): string {
  if (!text) return text;

  // Quick extraction: if the text contains a clean quoted answer at the end, extract it
  const quotedMatch = text.match(/"([^"]{10,})"\s*$/);
  if (quotedMatch && quotedMatch[1].length > 30) {
    return quotedMatch[1];
  }

  const metaKeywords = /^(User Question|User asks|User wants|Constraint|Confidence Score|Context|Route|Option \d|Draft \d|Self-Correction|Self Correction|Final Polish|Revised|Persona|Knowledge Base|Verification|Sanity Check|Checklist|Assessment|IMPORTANT|Summary|Conclusion|Next Steps|Action Items|Analysis|Plan|Note|Warning|Helpful assistant|NEVER echo|Answer directly|Short|Avoid unnecessary|Use Knowledge|Direct answer|No repetition|Concise|Accurate|Clear|The user|Looking at|Since I|I should|General advice|Specific platform|implicit|Refining|Draft \d|Step \d|No echoing|Direct.Concise|1-3 sentences|No filler)/i;

  const lines = text.split('\n');
  const cleaned = lines.filter(line => {
    const t = line.trim();
    if (!t) return true;
    // Strip any bullet/indented line with meta keywords
    if (/^[\s]*\*+/.test(t) && metaKeywords.test(t)) return false;
    // Strip indented sub-bullets entirely (likely reasoning)
    if (/^\s{2,}\*/.test(t)) return false;
    // Strip standalone boolean/verification
    if (/^(Yes|No|Maybe|True|False)\.?\s*$/i.test(t)) return false;
    // Strip separator lines
    if (/^-{3,}$/.test(t) || /^\*{3,}$/.test(t)) return false;
    // Strip lines that are just numbered items with Yes/No
    if (/^\d+\.\s+.*\?\s*(Yes|No)\.?$/i.test(t)) return false;
    // Strip "Constraint Checklist" block entirely
    if (/Constraint Checklist/i.test(t)) return false;
    return true;
  });

  let result = cleaned.join('\n').trim();

  // If still has meta patterns, try to extract last clean paragraph
  if (metaKeywords.test(result)) {
    const paragraphs = result.split(/\n\s*\n/);
    const lastClean = paragraphs.filter(p => !metaKeywords.test(p) && !/^[\s]*\*/.test(p.trim()));
    if (lastClean.length > 0) {
      result = lastClean[lastClean.length - 1].trim();
    }
  }

  // Final safety: if empty or too short, return original
  if (!result || result.length < 10) return text;
  return result;
}

export default function AiAssistantClient() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [quotas, setQuotas] = useState<Record<string, QuotaInfo>>({});

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const lastAssistantIndex = messages.reduce((acc, msg, i) => (msg.role === "assistant" && loading ? i : acc), -1);
    if (lastAssistantIndex < 0) return;
    const target = messages[lastAssistantIndex].content.length;
    setMessages((prev) => {
      const next = [...prev];
      const current = next[lastAssistantIndex].typedChars || 0;
      if (current >= target) return prev;
      next[lastAssistantIndex] = { ...next[lastAssistantIndex], typedChars: Math.min(current + Math.max(1, Math.floor(target / 40)), target) };
      return next;
    });
  }, [messages, loading]);

  useEffect(() => {
    subscriptionService
      .getMySubscriptionWithQuotas()
      .then((result) => setQuotas(result.quotas))
      .catch(() => { /* handled */ });
  }, []);

  const chatQuota = quotas.ai_chat_messages;
  const typingIndex = loading ? messages.length - 1 : -1;
  const chatLimitReached =
    chatQuota && chatQuota.max_limit > 0 && chatQuota.remaining <= 0;

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const data = await aiService.chat(msg);
      const rawReply = data?.response || data || (isBn ? "দুঃখিত, উত্তর তৈরি করা যায়নি।" : "Sorry, could not generate a response.");
      const reply = cleanAiResponse(typeof rawReply === "string" ? rawReply : JSON.stringify(rawReply));
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err: any) {
      const errMsg = err?.response?.data?.response || err?.response?.data?.message || err?.message || (isBn ? "একটি ত্রুটি ঘটেছে।" : "An error occurred.");
      setMessages((prev) => [...prev, { role: "assistant", content: cleanAiResponse(errMsg) }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleRegenerate = async (index: number) => {
    const userMsg = messages[index - 1]?.content;
    if (!userMsg || loading) return;
    setMessages((prev) => prev.slice(0, index));
    setLoading(true);
    try {
      const data = await aiService.chat(userMsg);
      const rawReply = data?.response || data || (isBn ? "দুঃখিত, উত্তর তৈরি করা যায়নি।" : "Sorry, could not generate a response.");
      const reply = cleanAiResponse(typeof rawReply === "string" ? rawReply : JSON.stringify(rawReply));
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err: any) {
      const errMsg = err?.response?.data?.response || err?.response?.data?.message || err?.message || (isBn ? "একটি ত্রুটি ঘটেছে।" : "An error occurred.");
      setMessages((prev) => [...prev, { role: "assistant", content: cleanAiResponse(errMsg) }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      // ignore copy failures
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Navbar />

      {/* Chat Messages — scrollable area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-2xl pb-28 sm:pb-6">
          {/* Quota Bar */}
          {chatQuota && chatQuota.max_limit > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  {isBn ? "AI চ্যাট" : "AI Chat"}
                </span>
                <span>
                  {chatQuota.used}/{chatQuota.max_limit} {isBn ? "ব্যবহৃত" : "used"}
                </span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    chatLimitReached ? "bg-destructive" : "bg-primary"
                  }`}
                  style={{
                    width: `${Math.min((chatQuota.used / chatQuota.max_limit) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Limit Reached Banner */}
          {chatLimitReached && (
            <Card className="mb-3 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-sm font-medium">
                    {isBn ? "সীমা শেষ" : "Limit Reached"}
                  </p>
                </div>
                <Button size="sm" asChild className="shrink-0">
                  <Link href="/pricing">
                    <Crown className="h-3.5 w-3.5 mr-1" />
                    {isBn ? "আপগ্রেড" : "Upgrade"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Chat Messages */}
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-1">
                  {isBn ? "কিছু জিজ্ঞাসা করুন" : "Ask me anything"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                  {isBn
                    ? "AI সহকারী আপনাকে ক্যারিয়ার পরামর্শ, বেতন পূর্বাভাস এবং চাকরি খোঁজায় সাহায্য করবে।"
                    : "I can help with career advice, salary predictions, interview tips, and job search strategies."}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(isBn ? prompt.bn : prompt.en)}
                      className="text-left text-sm p-3 rounded-lg border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {isBn ? prompt.bn : prompt.en}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => {
              const isAssistant = msg.role === "assistant";
              const showTyping = isAssistant && typingIndex === i;
              const displayContent = isAssistant && showTyping ? msg.content.slice(0, msg.typedChars) : msg.content;
              const isLongReply = isAssistant && msg.content.length > MAX_PREVIEW_CHARS;
              const isExpanded = isAssistant && (msg.typedChars ?? 0) >= msg.content.length;
              const previewText = isLongReply ? msg.content.slice(0, MAX_PREVIEW_CHARS) + "..." : msg.content;
              const effectiveText = isAssistant && isLongReply && !showTyping && !isExpanded ? previewText : displayContent;

              return (
                <div
                  key={i}
                  className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {isAssistant && (
                    <DefaultAvatar name="AI" className="h-8 w-8 shrink-0 mt-0.5" fallback={<Bot className="h-4 w-4" />} />
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ href, children }) => (
                          <a href={href} className="text-primary underline underline-offset-2 hover:text-primary/80" target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        ),
                        ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 my-1.5">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 my-1.5">{children}</ol>,
                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        h1: ({ children }) => <h1 className="text-lg font-bold my-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-bold my-1.5">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-bold my-1">{children}</h3>,
                        p: ({ children }) => <p className="mb-1 last:mb-0 leading-relaxed">{children}</p>,
                        code: ({ children }) => <code className="bg-muted-foreground/10 rounded px-1 py-0.5 text-xs font-mono">{children}</code>,
                      }}
                    >
                      {effectiveText}
                    </ReactMarkdown>

                    {isAssistant && isLongReply && !showTyping && !isExpanded && (
                      <button
                        type="button"
                        onClick={() => setMessages((prev) => prev.map((m, idx) => idx === i ? { ...m, typedChars: m.content.length } : m))}
                        className="mt-1 text-[10px] font-medium text-primary/80 hover:text-primary"
                      >
                        {isBn ? "পুরো উত্তর দেখুন" : "Show full reply"}
                      </button>
                    )}

                    {isAssistant && (
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRegenerate(i)}
                          disabled={loading}
                          className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-50"
                        >
                          <RefreshCcw className="h-3 w-3" />
                          {isBn ? "ফিরে লিখুন" : "Regenerate"}
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await copyMessage(msg.content);
                            setCopiedId(i);
                            setTimeout(() => setCopiedId((current) => (current === i ? null : current)), 1500);
                          }}
                          className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                        >
                          {copiedId === i ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copiedId === i ? (isBn ? "কপি হয়েছে" : "Copied") : (isBn ? "কপি" : "Copy")}
                        </button>
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <DefaultAvatar name="You" className="h-8 w-8 shrink-0 mt-0.5" fallback={<User className="h-4 w-4" />} />
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <DefaultAvatar name="AI" className="h-8 w-8 shrink-0 mt-0.5" fallback={<Bot className="h-4 w-4" />} />
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>

      {/* Input Area — fixed at bottom like ChatGPT */}
      <div className="shrink-0 border-t bg-background p-3 sm:p-4 safe-area-inset">
        <div className="container max-w-2xl mx-auto">
          <div className="flex gap-2 items-end">
            <Input
              ref={inputRef}
              placeholder={
                chatLimitReached
                  ? isBn ? "ব্যবহার সীমা শেষ" : "Usage limit reached"
                  : isBn ? "আপনার প্রশ্ন লিখুন..." : "Type your question..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              disabled={loading || chatLimitReached}
              className="flex-1 min-h-11"
            />
            <Button
              onClick={() => handleSend()}
              disabled={loading || !input.trim() || chatLimitReached}
              size="icon"
              className="h-11 w-11 shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-1.5 hidden sm:block">
            {isBn
              ? "AI সহকারী ভুল তথ্য দিতে পারে। গুরুত্বপূর্ণ সিদ্ধান্তের জন্য মানুষের পরামর্শ নিন।"
              : "AI may provide inaccurate information. Consult a human for important decisions."}
          </p>
        </div>
      </div>
    </div>
  );
}
