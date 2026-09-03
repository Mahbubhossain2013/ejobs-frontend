"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useThemeStore } from "@/store/theme-store";
import { useAuth } from "@/hooks/use-auth";
import { aiService } from "@/services/ai.service";
import { subscriptionService, type QuotaInfo } from "@/services/subscription.service";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Sparkles, MessageSquare, Bot, User, Loader2, CheckCircle, Target, Award,
} from "lucide-react";

const JOB_ROLES = [
  { en: "Software Engineer", bn: "সফটওয়্যার ইঞ্জিনিয়ার" },
  { en: "Marketing Manager", bn: "মার্কেটিং ম্যানেজার" },
  { en: "Data Analyst", bn: "ডেটা অ্যানালিস্ট" },
  { en: "Product Manager", bn: "প্রোডাক্ট ম্যানেজার" },
  { en: "UI/UX Designer", bn: "UI/UX ডিজাইনার" },
  { en: "Financial Analyst", bn: "ফিনান্সিয়াল অ্যানালিস্ট" },
  { en: "HR Manager", bn: "HR ম্যানেজার" },
  { en: "Sales Representative", bn: "সেলস রিপ্রেজেন্টেটিভ" },
];

const DIFFICULTIES = [
  { value: "easy", en: "Easy", bn: "সহজ" },
  { value: "medium", en: "Medium", bn: "মাঝারি" },
  { value: "hard", en: "Hard", bn: "কঠিন" },
];

interface InterviewSession {
  session_id: string;
  questions: string[];
}

interface EvaluationResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

type InterviewPhase = "setup" | "interview" | "results";

export default function AiMockInterviewClient() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const { user } = useAuth();

  const [phase, setPhase] = useState<InterviewPhase>("setup");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ question: string; answer: string }[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  const [startLoading, setStartLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [evaluateLoading, setEvaluateLoading] = useState(false);

  const [quotas, setQuotas] = useState<Record<string, QuotaInfo>>({});

  useEffect(() => {
    subscriptionService
      .getMySubscriptionWithQuotas()
      .then((result) => setQuotas(result.quotas))
      .catch(() => {});
  }, []);

  const interviewQuota = quotas.ai_interviews;
  const quotaReached = interviewQuota && interviewQuota.max_limit > 0 && interviewQuota.remaining <= 0;

  const handleStartInterview = async () => {
    if (!selectedRole || startLoading) return;
    setStartLoading(true);
    try {
      const data = await aiService.startInterview({
        role: selectedRole,
        difficulty: selectedDifficulty,
      });
      setSession(data);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setCurrentAnswer("");
      setPhase("interview");
    } catch {
      toast.error(isBn ? "ইন্টারভিউ শুরু করতে ব্যর্থ হয়েছে" : "Failed to start interview");
    } finally {
      setStartLoading(false);
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim() || !session) return;
    const q = session.questions[currentQuestionIndex];
    const newAnswers = [...answers, { question: q, answer: currentAnswer.trim() }];
    setAnswers(newAnswers);
    setCurrentAnswer("");
    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleEvaluate(newAnswers);
    }
  };

  const handleEvaluate = async (finalAnswers: { question: string; answer: string }[]) => {
    if (!session) return;
    setEvaluateLoading(true);
    try {
      const data = await aiService.evaluateInterview({
        session_id: session.session_id,
        answers: finalAnswers,
      });
      setEvaluation(data);
      setPhase("results");
    } catch {
      toast.error(isBn ? "মূল্যায়ন করতে ব্যর্থ হয়েছে" : "Failed to evaluate answers");
    } finally {
      setEvaluateLoading(false);
    }
  };

  const handleRestart = () => {
    setPhase("setup");
    setSession(null);
    setEvaluation(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setCurrentAnswer("");
    setSelectedRole("");
    setSelectedDifficulty("medium");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-3xl mx-auto px-3 py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  {isBn ? "AI মক ইন্টারভিউ" : "AI Mock Interview"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isBn ? "AI-চালিত ফিডব্যাক দিয়ে ইন্টারভিউ অনুশীলন করুন" : "Practice interviews with AI-powered feedback"}
                </p>
              </div>
            </div>
          </div>

          {/* Quota Warning */}
          {quotaReached && (
            <Card className="mb-6 border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">
                      {isBn ? "মক ইন্টারভিউ সীমা শেষ" : "Mock interview quota reached"}
                    </p>
                    <p className="text-xs text-yellow-700">
                      {isBn ? "আপনার সাবস্ক্রিপশন প্ল্যানে আরো মক ইন্টারভিউ পেতে আপগ্রেড করুন।" : "Upgrade your subscription plan to get more mock interviews."}
                    </p>
                  </div>
                  <Link href="/pricing">
                    <Button size="sm" variant="outline" className="shrink-0">
                      {isBn ? "আপগ্রেড করুন" : "Upgrade"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Setup Phase */}
          {phase === "setup" && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {isBn ? "জব রোল নির্বাচন করুন" : "Select Job Role"}
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      disabled={quotaReached}
                      className="w-full h-11 px-3 rounded-md border bg-background text-foreground text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                    >
                      <option value="">
                        {isBn ? "রোল নির্বাচন করুন..." : "Select a role..."}
                      </option>
                      {JOB_ROLES.map((role) => (
                        <option key={role.en} value={role.en}>
                          {isBn ? role.bn : role.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {isBn ? "কঠিনতার মাত্রা" : "Difficulty Level"}
                    </label>
                    <div className="flex gap-2">
                      {DIFFICULTIES.map((d) => (
                        <button
                          key={d.value}
                          onClick={() => setSelectedDifficulty(d.value)}
                          disabled={quotaReached}
                          className={`flex-1 h-10 rounded-md text-sm font-medium transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                            selectedDifficulty === d.value
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {isBn ? d.bn : d.en}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleStartInterview}
                    disabled={!selectedRole || startLoading || quotaReached}
                    className="w-full"
                  >
                    {startLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <MessageSquare className="h-4 w-4 mr-2" />
                    )}
                    {isBn ? "ইন্টারভিউ শুরু করুন" : "Start Interview"}
                  </Button>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-3">
                    {isBn ? "কিভাবে কাজ করে" : "How it works"}
                  </h3>
                  <div className="space-y-3">
                    {[
                      { icon: Target, text: isBn ? "আপনার জব রোল এবং কঠিনতা নির্বাচন করুন" : "Select your job role and difficulty level" },
                      { icon: MessageSquare, text: isBn ? "AI আপনাকে প্রশ্ন জিজ্ঞাসা করবে" : "AI will ask you interview questions" },
                      { icon: CheckCircle, text: isBn ? "প্রতিটি প্রশ্নের উত্তর দিন" : "Answer each question thoroughly" },
                      { icon: Award, text: isBn ? "বিস্তারিত ফিডব্যাক এবং মূল্যায়ন পান" : "Get detailed feedback and evaluation" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <item.icon className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Interview Phase */}
          {phase === "interview" && session && (
            <div className="space-y-4">
              {/* Progress */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {isBn ? "প্রগ্রেস" : "Progress"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {currentQuestionIndex + 1} / {session.questions.length}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{
                        width: `${((currentQuestionIndex + 1) / session.questions.length) * 100}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Question */}
              <Card className="border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                        {isBn ? "প্রশ্ন" : "Question"} {currentQuestionIndex + 1}
                      </p>
                      <p className="font-medium">
                        {session.questions[currentQuestionIndex]}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Answer Input */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                        {isBn ? "আপনার উত্তর" : "Your Answer"}
                      </p>
                      <textarea
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        placeholder={isBn ? "আপনার উত্তর লিখুন..." : "Type your answer..."}
                        disabled={submitLoading}
                        rows={4}
                        className="w-full px-3 py-2 rounded-md border bg-background text-foreground text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={!currentAnswer.trim() || submitLoading}
                    >
                      {submitLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      {currentQuestionIndex < session.questions.length - 1
                        ? isBn ? "পরবর্তী প্রশ্ন" : "Next Question"
                        : isBn ? "মূল্যায়ন করুন" : "Evaluate"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Previous Answers */}
              {answers.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium mb-3">
                      {isBn ? "আপনার পূর্ববর্তী উত্তর" : "Your Previous Answers"}
                    </h3>
                    <div className="space-y-3">
                      {answers.map((a, i) => (
                        <div key={i} className="p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">
                            {isBn ? "প্রশ্ন" : "Q"} {i + 1}: {a.question}
                          </p>
                          <p className="text-sm">{a.answer}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Results Phase */}
          {phase === "results" && evaluation && (
            <div className="space-y-4">
              {/* Score Card */}
              <Card className="border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">
                        {isBn ? "ইন্টারভিউ ফলাফল" : "Interview Results"}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {isBn ? "AI দ্বারা মূল্যায়ন করা হয়েছে" : "Evaluated by AI"}
                      </p>
                    </div>
                  </div>

                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${getScoreColor(evaluation.score)}`}>
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-2xl font-bold">{evaluation.score}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Feedback */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {isBn ? "ফিডব্যাক" : "Feedback"}
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {evaluation.feedback}
                  </p>
                </CardContent>
              </Card>

              {/* Strengths */}
              {evaluation.strengths && evaluation.strengths.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {isBn ? "শক্তিশালী দিক" : "Strengths"}
                    </h3>
                    <ul className="space-y-2">
                      {evaluation.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Improvements */}
              {evaluation.improvements && evaluation.improvements.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-yellow-600" />
                      {isBn ? "উন্নতির পরামর্শ" : "Areas for Improvement"}
                    </h3>
                    <ul className="space-y-2">
                      {evaluation.improvements.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Target className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Restart Button */}
              <Button onClick={handleRestart} className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                {isBn ? "নতুন ইন্টারভিউ শুরু করুন" : "Start New Interview"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay for Evaluation */}
      {evaluateLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
              <p className="font-medium">
                {isBn ? "আপনার উত্তর মূল্যায়ন করা হচ্ছে..." : "Evaluating your answers..."}
              </p>
              <p className="text-sm text-muted-foreground">
                {isBn ? "এটি কিছুক্ষণ লাগতে পারে" : "This may take a moment"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}