"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api-client";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Clock, HelpCircle, Award, ArrowLeft, Play, CheckCircle, History, XCircle } from "lucide-react";

interface Question {
  id: number;
  question: string;
  type: string;
  options: string[] | null;
  points: number;
  order: number;
}

interface Assessment {
  id: number;
  title: string;
  description: string;
  passing_score: number;
  time_limit_minutes: number | null;
  max_attempts: number;
  question_count: number;
  course: {
    id: number;
    title: string;
    category: string;
  };
  questions: Question[];
}

interface AttemptHistory {
  id: number;
  status: string;
  score: number | null;
  is_passed: boolean | null;
  created_at: string;
}

interface CanAttempt {
  can_attempt: boolean;
  attempts_used: number;
  max_attempts: number;
  has_active_attempt: boolean;
  best_score: number | null;
  is_passed: boolean;
  passing_score: number;
}

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [canAttempt, setCanAttempt] = useState<CanAttempt | null>(null);
  const [attemptHistory, setAttemptHistory] = useState<AttemptHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    api.get(`/assessments/${params.id}`)
      .then((res) => {
        setAssessment(res.data?.data);
        setCanAttempt(res.data?.can_attempt);
        setAttemptHistory(res.data?.attempt_history || []);
      })
      .catch(() => toast.error("Assessment not found"))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleStart = async () => {
    if (!user) {
      toast.error("Please login to start the assessment");
      router.push("/login");
      return;
    }

    setStarting(true);
    try {
      const res = await api.post(`/assessments/${assessment!.id}/start`);
      toast.success("Assessment started!");
      router.push(`/assessments/${assessment!.id}/take?attempt=${res.data?.data?.attempt_id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to start assessment");
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PublicLayout>
    );
  }

  if (!assessment) return null;

  return (
    <PublicLayout>
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Button variant="ghost" className="mb-6" onClick={() => router.push("/skills")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Skill Center
          </Button>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-4">
                <Badge className="bg-primary/10 text-primary">
                  <HelpCircle className="h-3 w-3 mr-1" /> Assessment
                </Badge>
                {assessment.course && (
                  <Badge variant="outline">{assessment.course.category}</Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold mb-3">{assessment.title}</h1>

              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1">
                  <HelpCircle className="h-4 w-4" /> {assessment.question_count} Questions
                </span>
                {assessment.time_limit_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {assessment.time_limit_minutes} min
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Award className="h-4 w-4" /> Pass: {assessment.passing_score}%
                </span>
              </div>

              {assessment.description && (
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  {assessment.description}
                </p>
              )}

              {assessment.course && (
                <div className="bg-muted/50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-muted-foreground">
                    Course: <span className="font-medium text-foreground">{assessment.course.title}</span>
                  </p>
                </div>
              )}

              {canAttempt && (
                <div className="bg-muted/50 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold mb-3">Your Status</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Attempts Used</p>
                      <p className="font-semibold">{canAttempt.attempts_used} / {canAttempt.max_attempts}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Best Score</p>
                      <p className="font-semibold">{canAttempt.best_score !== null ? `${canAttempt.best_score}%` : "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Passing Score</p>
                      <p className="font-semibold">{canAttempt.passing_score}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className={`font-semibold ${canAttempt.is_passed ? "text-emerald-600" : "text-muted-foreground"}`}>
                        {canAttempt.is_passed ? "Passed" : "Not Passed"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {canAttempt?.can_attempt ? (
                <div className="flex items-center gap-4">
                  <Button size="lg" onClick={handleStart} disabled={starting}>
                    {starting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting...</>
                    ) : canAttempt.has_active_attempt ? (
                      <><Play className="mr-2 h-4 w-4" /> Resume Assessment</>
                    ) : (
                      <><Play className="mr-2 h-4 w-4" /> Start Assessment</>
                    )}
                  </Button>
                  {canAttempt.has_active_attempt && (
                    <p className="text-sm text-muted-foreground">You have an in-progress attempt</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-2">
                    {canAttempt?.is_passed
                      ? "You have already passed this assessment!"
                      : "Maximum attempts reached"}
                  </p>
                  {canAttempt?.is_passed && (
                    <Button variant="outline" onClick={() => router.push("/certificates")}>
                      View Certificate
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {attemptHistory.length > 0 && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <History className="h-5 w-5" /> Attempt History
                </h3>
                <div className="space-y-3">
                  {attemptHistory.map((attempt) => (
                    <div key={attempt.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        {attempt.is_passed === true ? (
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                        ) : attempt.is_passed === false ? (
                          <XCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium">
                            {attempt.status === "completed" ? `Score: ${attempt.score}%` : attempt.status}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(attempt.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={attempt.is_passed ? "default" : "secondary"}>
                        {attempt.is_passed ? "Passed" : "Failed"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
