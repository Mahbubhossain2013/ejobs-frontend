"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useThemeStore } from "@/store/theme-store";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { aiService, type CareerRoadmap } from "@/services/ai.service";
import { subscriptionService, type QuotaInfo } from "@/services/subscription.service";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Send, Sparkles, TrendingUp, MessageSquare, Zap, Crown,
  Loader2, Map, ChevronRight, Clock, BookOpen, Bot, User, Route, Target, Award,
} from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const ROADMAP_PROMPTS = [
  { en: "Show me a roadmap to become a Senior Developer", bn: "সিনিয়র ডেভেলপার হওয়ার রোডম্যাপ দেখান" },
  { en: "How to transition from Developer to Tech Lead?", bn: "ডেভেলপার থেকে টেক লিড হওয়ার পথ" },
  { en: "Career path for UI/UX Designer", bn: "UI/UX ডিজাইনারের ক্যারিয়ার পথ" },
  { en: "Skills needed for Data Scientist role", bn: "ডেটা সায়েন্টিস্টের জন্য প্রয়োজনীয় দক্ষতা" },
];

export default function AiCareerClient() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const { user, isAuthenticated, role } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"roadmap" | "salary">("roadmap");
  const [salaryData, setSalaryData] = useState<{ predicted_salary: number; confidence: number; factors: string[] } | null>(null);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [quotas, setQuotas] = useState<Record<string, QuotaInfo>>({});
  const [customPrompt, setCustomPrompt] = useState("");
  const [roadmapError, setRoadmapError] = useState<string | null>(null);

  const isEmployer = role === "employer";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    subscriptionService
      .getMySubscriptionWithQuotas()
      .then((result) => setQuotas(result.quotas))
      .catch(() => { /* handled */ });
  }, []);

  const chatQuota = quotas.ai_chat_messages;
  const chatLimitReached = chatQuota && chatQuota.max_limit > 0 && chatQuota.remaining <= 0;

  const loadSavedRoadmap = async () => {
    if (!isAuthenticated) return;
    setRoadmapLoading(true);
    setRoadmapError(null);
    try {
      const data = await aiService.getCareerRoadmap();
      setRoadmap(data || null);
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;
      if (status === 403) {
        setRoadmapError(message || (isBn ? "প্রিমিয়াম প্ল্যান প্রয়োজন" : "Premium or Pro plan required"));
      } else {
        setRoadmapError(message || (isBn ? "রোডম্যাপ লোড করতে ব্যর্থ হয়েছে" : "AI career roadmap is temporarily unavailable. Please try again later."));
      }
    } finally {
      setRoadmapLoading(false);
    }
  };

  // Auto-load saved roadmap on mount when roadmap tab is active
  useEffect(() => {
    if (activeTab === "roadmap" && !roadmap && !roadmapLoading) {
      loadSavedRoadmap();
    }
  }, [activeTab]);

  const handleGenerateOrRegenerate = async () => {
    setRoadmapLoading(true);
    setRoadmapError(null);
    try {
      const data = await aiService.getCareerRoadmap(customPrompt || undefined, true);
      setRoadmap(data || null);
      setCustomPrompt("");
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;
      if (status === 403) {
        setRoadmapError(message || (isBn ? "প্রিমিয়াম প্ল্যান প্রয়োজন" : "Premium or Pro plan required"));
      } else {
        setRoadmapError(message || (isBn ? "রোডম্যাপ তৈরি করতে ব্যর্থ হয়েছে" : "AI career roadmap is temporarily unavailable. Please try again later."));
      }
    } finally {
      setRoadmapLoading(false);
    }
  };

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const context = roadmap
        ? `Current level: ${roadmap.current_level}. Target: ${roadmap.target_role}. User: ${user?.name || "Unknown"}`
        : `User: ${user?.name || "Unknown"}, Role: ${user?.role || "candidate"}`;
      const res = await aiService.chat(msg, context);
      const reply = res.data?.response || res.data || (isBn ? "দুঃখিত, উত্তর তৈরি করা যায়নি।" : "Sorry, could not generate a response.");
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: isBn ? "একটি ত্রুটি ঘটেছে।" : "An error occurred." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSalaryPredict = async () => {
    setSalaryLoading(true);
    try {
      const data = await aiService.getSalaryPrediction();
      setSalaryData(data || null);
    } catch {} finally {
      setSalaryLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Navbar />

      {isEmployer && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/20 flex items-center justify-center mb-4">
            <Route className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">{isBn ? "এই ফিচার শুধুমাত্র ক্যান্ডিডেটদের জন্য" : "This feature is for candidates only"}</h2>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            {isBn
              ? "AI ক্যারিয়ার কোচ শুধুমাত্র ক্যান্ডিডেটদের জন্য উপলব্ধ। আপনি আপনার ড্যাশবোর্ডে ফিরে যেতে পারেন।"
              : "AI Career Coach is only available for candidates. You can go back to your dashboard."}
          </p>
          <Button asChild>
            <Link href="/employer/dashboard">{isBn ? "ড্যাশবোর্ডে ফিরুন" : "Back to Dashboard"}</Link>
          </Button>
        </div>
      )}

      {!isEmployer && (<>

      {/* Tab Bar */}
      <div className="shrink-0 border-b bg-background">
        <div className="container max-w-3xl mx-auto px-3">
          <div className="flex gap-1 py-2 overflow-x-auto">
            {[
              { key: "roadmap" as const, icon: Route, label: isBn ? "রোডম্যাপ" : "Roadmap" },
              { key: "salary" as const, icon: TrendingUp, label: isBn ? "বেতন" : "Salary" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Roadmap Tab */}
      {activeTab === "roadmap" && (
        <div className="flex-1 overflow-y-auto">
          <div className="container max-w-3xl mx-auto px-3 py-4 pb-6">
            {roadmapLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Route className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {isBn ? "আপনার ক্যারিয়ার রোডম্যাপ তৈরি হচ্ছে..." : "Building your career roadmap..."}
                </p>
              </div>
            ) : roadmap ? (
              <div className="space-y-4">
                {/* Current & Target */}
                <Card className="border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          {isBn ? "আপনার পথ" : "Your Journey"}
                        </p>
                        <p className="font-semibold text-sm">
                          {roadmap.current_level} → {roadmap.target_role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Steps */}
                {roadmap.steps && roadmap.steps.length > 0 && (
                  <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
                    <div className="space-y-4">
                      {roadmap.steps.map((step, i) => (
                        <div key={i} className="relative flex gap-3">
                          <div className="relative z-10 w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary-foreground">{i + 1}</span>
                          </div>
                          <Card className="flex-1">
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                              <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
                              {step.duration && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                                  <Clock className="h-3 w-3" />
                                  {step.duration}
                                </div>
                              )}
                              {step.resources && step.resources.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {step.resources.map((r, j) => (
                                    <Badge key={j} variant="secondary" className="text-[10px]">
                                      <BookOpen className="h-2.5 w-2.5 mr-0.5" />
                                      {r}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Route className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">
                  {isBn ? "আপনার রোডম্যাপ তৈরি করুন" : "Build Your Roadmap"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  {isBn ? "AI আপনার প্রোফাইল বিশ্লেষণ করে একটি ব্যক্তিগতকৃত ক্যারিয়ার রোডম্যাপ তৈরি করবে।" : "AI analyzes your profile to create a personalized career roadmap."}
                </p>
                <Button onClick={handleGenerateOrRegenerate} disabled={roadmapLoading}>
                  <Route className="h-4 w-4 mr-2" />
                  {isBn ? "রোডম্যাপ তৈরি করুন" : "Generate Roadmap"}
                </Button>
              </div>
            )}
            {roadmapError && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-sm text-red-700 dark:text-red-400 space-y-2">
                <p>{roadmapError}</p>
                <p className="text-xs opacity-80">
                  {isBn ? "সমস্যাটি রিপোর্ট করতে" : "To report this issue, please"}{" "}
                  <Link href="/employer/support" className="underline font-medium hover:text-red-900 dark:hover:text-red-300">
                    {isBn ? "সাপোর্ট টিকেট খুলুন" : "open a support ticket"}
                  </Link>
                </p>
              </div>
            )}
            {roadmap && (
              <div className="mt-4 p-4 rounded-lg border bg-muted/40 space-y-3">
                <p className="text-sm font-medium">
                  {isBn ? "রোডম্যাপ কাস্টমাইজ করুন" : "Customize your roadmap"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isBn
                    ? "প্রম্পট দিন এবং AI রোডম্যাপ পুনরায় তৈরি করবে।"
                    : "Give instructions and AI will regenerate your roadmap."}
                </p>
                <div className="flex gap-2">
                  <Input
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder={isBn ? "যেমন: আরও ফোকাস করুন DevOps上" : "Example: focus more on DevOps"}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerateOrRegenerate()}
                  />
                  <Button onClick={handleGenerateOrRegenerate} disabled={roadmapLoading || !customPrompt.trim()}>
                    {roadmapLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Salary Tab */}
      {activeTab === "salary" && (
        <div className="flex-1 overflow-y-auto">
          <div className="container max-w-3xl mx-auto px-3 py-4 pb-6">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{isBn ? "বেতন পূর্বাভাস" : "Salary Prediction"}</h3>
                    <p className="text-xs text-muted-foreground">
                      {isBn ? "AI আপনার প্রোফাইল বিশ্লেষণ করে বেতন অনুমান করবে" : "AI predicts salary based on your profile"}
                    </p>
                  </div>
                </div>
                <Button onClick={handleSalaryPredict} disabled={salaryLoading} className="w-full">
                  {salaryLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <TrendingUp className="h-4 w-4 mr-2" />}
                  {isBn ? "আমার বেতন অনুমান করুন" : "Predict My Salary"}
                </Button>
                {salaryData && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <p className="text-2xl font-bold">{formatCurrency(salaryData.predicted_salary || 0)}</p>
                    <p className="text-sm text-muted-foreground">
                      {isBn ? "আনুমানিক বেতন" : "Estimated salary"} ({salaryData.confidence}% confidence)
                    </p>
                    {salaryData.factors?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {salaryData.factors.map((f, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Input Bar — fixed at bottom, only on roadmap tab */}
      {activeTab === "roadmap" && (
      <div className="shrink-0 border-t bg-background p-3 sm:p-4 safe-area-inset">
        <div className="container max-w-3xl mx-auto">
          <div className="flex gap-2 items-end">
            <Input
              ref={inputRef}
              placeholder={chatLimitReached
                  ? isBn ? "ব্যবহার সীমা শেষ" : "Usage limit reached"
                  : isBn ? "রোডম্যাপ সম্পর্কে জিজ্ঞাসা করুন..." : "Ask about your roadmap..."
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
      )}
      </>)}
    </div>
  );
}
