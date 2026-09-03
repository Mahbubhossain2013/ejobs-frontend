"use client";

import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useThemeStore } from "@/store/theme-store";
import api from "@/lib/api-client";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Upload, FileText, Sparkles, CheckCircle, AlertTriangle,
  TrendingUp, ArrowRight, Target, Eye,
  Award, Briefcase, GraduationCap, Settings, Star, User, BarChart,
  CloudUpload, X, File,
} from "lucide-react";

interface ScoreResult {
  overall_score: number;
  grade: string;
  sections: Record<string, { score: number; feedback: string }>;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  industry_benchmark: number;
}

export default function ResumeScoreClient() {
  const { user } = useAuth();
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"profile" | "pdf" | null>(null);

  const handleFetchProfile = async () => {
    setFetchingProfile(true);
    try {
      const res = await api.get("/candidate/cv/profile");
      const data = res.data?.data || res.data;
      if (data) {
        setProfile(data);
        toast.success(isBn ? "প্রোফাইল লোড হয়েছে" : "Profile loaded");
      } else {
        toast.error(isBn ? "প্রোফাইল পাওয়া যায়নি" : "No profile found");
      }
    } catch {
      toast.error(isBn ? "প্রোফাইল লোড ব্যর্থ" : "Failed to load profile");
    } finally {
      setFetchingProfile(false);
    }
  };

  const handleScore = async () => {
    if (!profile) {
      toast.error(isBn ? "প্রথমে প্রোফাইল লোড করুন" : "Load your profile first");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post("/candidate/resume-score", { profile });
      const data = res.data?.data || res.data;
      if (res.data?.status === false && res.data?.action === "upgrade") {
        toast.error(isBn ? "আপনার প্ল্যান আপগ্রেড করুন" : "Upgrade your plan");
        return;
      }
      setResult(data);
      toast.success(isBn ? "স্কোর তৈরি হয়েছে!" : "Score generated!");
    } catch (e: any) {
      toast.error(e.response?.data?.message || (isBn ? "স্কোরিং ব্যর্থ" : "Scoring failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setUploadMethod("pdf");
      } else {
        toast.error(isBn ? "শুধুমাত্র PDF ফাইল আপলোড করুন" : "Only PDF files are allowed");
      }
    }
  }, [isBn]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setUploadMethod("pdf");
      } else {
        toast.error(isBn ? "শুধুমাত্র PDF ফাইল আপলোড করুন" : "Only PDF files are allowed");
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadMethod(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePdfUpload = async () => {
    if (!selectedFile) {
      toast.error(isBn ? "প্রথমে একটি PDF ফাইল নির্বাচন করুন" : "Select a PDF file first");
      return;
    }
    setUploadingPdf(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);
      const res = await api.post("/candidate/resume-score/pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res.data?.data || res.data;
      if (res.data?.status === false && res.data?.action === "upgrade") {
        toast.error(isBn ? "আপনার প্ল্যান আপগ্রেড করুন" : "Upgrade your plan");
        return;
      }
      setResult(data);
      toast.success(isBn ? "স্কোর তৈরি হয়েছে!" : "Score generated!");
    } catch (e: any) {
      toast.error(e.response?.data?.message || (isBn ? "স্কোরিং ব্যর্থ" : "Scoring failed"));
    } finally {
      setUploadingPdf(false);
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade?.startsWith("A")) return "text-green-600 bg-green-100";
    if (grade?.startsWith("B")) return "text-blue-600 bg-blue-100";
    if (grade?.startsWith("C")) return "text-amber-600 bg-amber-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  };

  const sectionIcons: Record<string, any> = {
    contact_completeness: User,
    professional_summary: FileText,
    work_experience: Briefcase,
    education: GraduationCap,
    skills_relevance: Settings,
    ats_compatibility: Target,
    formatting: Eye,
    keywords: Star,
    achievement_density: Award,
    language_quality: FileText,
  };

  const sectionLabels: Record<string, string> = {
    contact_completeness: isBn ? "যোগাযোগ" : "Contact",
    professional_summary: isBn ? "সারসংক্ষেপ" : "Summary",
    work_experience: isBn ? "অভিজ্ঞতা" : "Experience",
    education: isBn ? "শিক্ষা" : "Education",
    skills_relevance: isBn ? "দক্ষতা" : "Skills",
    ats_compatibility: isBn ? "ATS" : "ATS",
    formatting: isBn ? "ফরম্যাট" : "Format",
    keywords: isBn ? "কীওয়ার্ড" : "Keywords",
    achievement_density: isBn ? "অর্জন" : "Achievements",
    language_quality: isBn ? "ভাষা" : "Language",
  };

  const sectionMaxScores: Record<string, number> = {
    contact_completeness: 10,
    professional_summary: 15,
    work_experience: 20,
    education: 10,
    skills_relevance: 15,
    ats_compatibility: 10,
    formatting: 10,
    keywords: 10,
    achievement_density: 5,
    language_quality: 5,
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/5 to-background py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
          <h1 className="text-3xl font-bold mb-2">
            {isBn ? "রিজিউম স্কোর চেকার" : "Resume Score Checker"}
          </h1>
          <p className="text-muted-foreground mb-4">
            {isBn
              ? "আপনার রিজিউমের মান অন্যদের তুলনায় কেমন জানুন — বিনামূল্যে!"
              : "Know where your resume stands amongst others — for FREE!"}
          </p>
          <Badge className="bg-gradient-to-r from-primary to-emerald-600 text-white border-0">
            <Sparkles className="h-3 w-3 mr-1" />
            {isBn ? "বিনামূল্যে স্কোর পান" : "Get Free Score"}
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        {/* Upload Section */}
        {!result && (
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              {!profile && !selectedFile ? (
                <div className="space-y-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-blue-500" />
                  </div>
                  <h2 className="text-lg font-semibold">
                    {isBn ? "আপনার রিজিউম আপলোড করুন" : "Upload Your Resume"}
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {isBn
                      ? "আপনার CV প্রোফাইল বা PDF ফাইল আপলোড করে স্কোর পান।"
                      : "Score your resume from your CV profile or upload a PDF file."}
                  </p>

                  {/* PDF Drop Zone */}
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 transition-colors cursor-pointer ${
                      dragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <div className="flex flex-col items-center gap-3">
                      <CloudUpload className={`h-10 w-10 ${dragActive ? "text-primary" : "text-muted-foreground/50"}`} />
                      <div>
                        <p className="text-sm font-medium">
                          {isBn ? "ড্র্যাগ ও ড্রপ করুন অথবা ক্লিক করুন" : "Drag & drop or click to upload"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isBn ? "শুধুমাত্র PDF ফাইল (সর্বোচ্চ ৪০০KB)" : "PDF files only (max 400KB)"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        {isBn ? "অথবা" : "or"}
                      </span>
                    </div>
                  </div>

                  <Button onClick={handleFetchProfile} disabled={fetchingProfile} variant="outline" size="lg">
                    {fetchingProfile ? (
                      <><Sparkles className="h-4 w-4 mr-2 animate-spin" />{isBn ? "লোড হচ্ছে..." : "Loading..."}</>
                    ) : (
                      <><FileText className="h-4 w-4 mr-2" />{isBn ? "CV প্রোফাইল থেকে লোড করুন" : "Load from CV Profile"}</>
                    )}
                  </Button>
                </div>
              ) : selectedFile && !profile ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                    <File className="h-8 w-8 text-amber-500" />
                  </div>
                  <h2 className="text-lg font-semibold">
                    {isBn ? "ফাইল নির্বাচিত" : "File Selected"}
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{selectedFile.name}</span>
                    <span className="text-xs">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                      className="ml-1 p-1 rounded-full hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Button onClick={handlePdfUpload} disabled={uploadingPdf} size="lg">
                      {uploadingPdf ? (
                        <><Sparkles className="h-4 w-4 mr-2 animate-spin" />{isBn ? "স্কোর করছে..." : "Scoring..."}</>
                      ) : (
                        <><Sparkles className="h-4 w-4 mr-2" />{isBn ? "এখনই স্কোর করুন" : "Score My Resume"}</>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleRemoveFile}>
                      {isBn ? "পরিবর্তন" : "Change"}
                    </Button>
                  </div>
                </div>
              ) : profile ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-50 dark:bg-green-950/40 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h2 className="text-lg font-semibold">
                    {isBn ? "প্রোফাইল প্রস্তুত" : "Profile Ready"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {profile.personal_info?.full_name || "Profile loaded"}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Button onClick={handleScore} disabled={loading} size="lg">
                      {loading ? (
                        <><Sparkles className="h-4 w-4 mr-2 animate-spin" />{isBn ? "স্কোর করছে..." : "Scoring..."}</>
                      ) : (
                        <><Sparkles className="h-4 w-4 mr-2" />{isBn ? "এখনই স্কোর করুন" : "Score My Resume"}</>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => { setProfile(null); setUploadMethod(null); }}>
                      {isBn ? "পরিবর্তন" : "Change"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Score Results */}
        {result && (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-emerald-500/10 p-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold mb-1">{isBn ? "আপনার স্কোর" : "Your Score"}</h2>
                    <p className="text-sm text-muted-foreground">
                      {isBn ? "আপনার রিজিউমের সমগ্র মূল্যায়ন" : "Overall resume evaluation"}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className={`text-5xl font-bold ${getScoreColor(result.overall_score)}`}>
                        {result.overall_score}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">/100</p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-2xl font-bold ${getGradeColor(result.grade)}`}>
                      {result.grade}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{isBn ? "আপনার স্কোর" : "Your Score"}</span>
                    <span>{result.overall_score}%</span>
                  </div>
                  <Progress value={result.overall_score} className="h-3" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>{isBn ? "ইন্ডাস্ট্রি বেঞ্চমার্ক" : "Industry Benchmark"}</span>
                    <span>{result.industry_benchmark}%</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Section Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-primary" />
                  {isBn ? "বিভাগ অনুযায়ী স্কোর" : "Section Breakdown"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(result.sections).map(([key, section]) => {
                    const Icon = sectionIcons[key] || Settings;
                    const maxScore = sectionMaxScores[key] || 10;
                    const percentage = (section.score / maxScore) * 100;
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{sectionLabels[key] || key}</span>
                          </div>
                          <span className="text-sm font-semibold">{section.score}/{maxScore}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">{section.feedback}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    {isBn ? "শক্তি" : "Strengths"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-5 w-5" />
                    {isBn ? "দুর্বলতা" : "Weaknesses"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Improvements */}
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <TrendingUp className="h-5 w-5" />
                  {isBn ? "উন্নতির পরামর্শ" : "Improvements"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.improvements.map((imp, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                      {imp}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-gradient-to-r from-primary/10 to-emerald-500/10">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{isBn ? "আপনার সিভি উন্নত করুন" : "Improve Your Resume"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {isBn ? "আমাদের টেমপ্লেট ব্যবহার করে পেশাদার সিভি তৈরি করুন" : "Create a professional CV with our templates"}
                  </p>
                </div>
                <Button onClick={() => router.push("/resume-builder")}>
                  <FileText className="h-4 w-4 mr-2" />
                  {isBn ? "সিভি তৈরি করুন" : "Build CV"}
                </Button>
              </CardContent>
            </Card>

            {/* Retry */}
            <div className="text-center">
              <Button variant="ghost" onClick={() => { setResult(null); setProfile(null); setSelectedFile(null); setUploadMethod(null); }}>
                {isBn ? "আবার চেক করুন" : "Check Again"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
