"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api-client";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight, Send } from "lucide-react";

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
  questions: Question[];
}

interface AttemptInfo {
  attempt_id: number;
  time_limit_minutes: number | null;
  total_questions: number;
  started_at: string;
  remaining_time_seconds: number | null;
}

function TakeAssessmentContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attempt");

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [attemptInfo, setAttemptInfo] = useState<AttemptInfo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) {
      router.push(`/assessments/${params.id}`);
      return;
    }

    api.get(`/assessments/${params.id}`)
      .then((res) => {
        setAssessment(res.data?.data);
        setAttemptInfo({
          attempt_id: parseInt(attemptId),
          time_limit_minutes: res.data?.data?.time_limit_minutes,
          total_questions: res.data?.data?.questions?.length || 0,
          started_at: new Date().toISOString(),
          remaining_time_seconds: res.data?.data?.time_limit_minutes
            ? res.data.data.time_limit_minutes * 60
            : null,
        });
        setTimeRemaining(
          res.data?.data?.time_limit_minutes
            ? res.data.data.time_limit_minutes * 60
            : null
        );
      })
      .catch(() => {
        toast.error("Failed to load assessment");
        router.push(`/assessments/${params.id}`);
      })
      .finally(() => setLoading(false));
  }, [params.id, attemptId, router]);

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || results) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, results]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = useCallback(async () => {
    if (submitting || results) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/assessments/attempts/${attemptId}/submit`, {
        answers,
      });
      setResults(res.data?.data);
      toast.success("Assessment submitted!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }, [attemptId, answers, submitting, results]);

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

  if (results) {
    return (
      <PublicLayout>
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <Card>
              <CardContent className="p-8 text-center">
                {results.is_passed ? (
                  <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                )}

                <h1 className="text-3xl font-bold mb-2">
                  {results.is_passed ? "Congratulations!" : "Not Passed"}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {results.is_passed
                    ? "You have passed the assessment!"
                    : "You did not meet the passing score. Try again!"}
                </p>

                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Your Score</p>
                    <p className="text-2xl font-bold">{results.score}%</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Passing Score</p>
                    <p className="text-2xl font-bold">{results.passing_score}%</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Time Spent</p>
                    <p className="text-2xl font-bold">
                      {results.time_spent_seconds
                        ? `${Math.floor(results.time_spent_seconds / 60)}m ${results.time_spent_seconds % 60}s`
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {results.is_passed && results.certificate && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-6 mb-6">
                    <p className="text-emerald-800 dark:text-emerald-200 font-medium mb-2">
                      Certificate Generated!
                    </p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-3">
                      Certificate No: {results.certificate.certificate_number}
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <a href={results.certificate.download_url} target="_blank" rel="noopener noreferrer">
                        Download Certificate
                      </a>
                    </Button>
                  </div>
                )}

                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={() => router.push(`/assessments/${params.id}`)}>
                    Back to Assessment
                  </Button>
                  <Button onClick={() => router.push("/certificates")}>
                    View Certificates
                  </Button>
                </div>
              </CardContent>
            </Card>

            {results.answers && results.answers.length > 0 && (
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Review Answers</h3>
                  <div className="space-y-4">
                    {results.answers.map((answer: any, index: number) => (
                      <div
                        key={answer.question_id}
                        className={`p-4 rounded-lg border ${
                          answer.is_correct
                            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
                            : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {answer.is_correct ? (
                            <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium mb-1">
                              Q{index + 1}. {answer.question}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Your answer: <span className="font-medium">{answer.user_answer || "Not answered"}</span>
                            </p>
                            {!answer.is_correct && (
                              <p className="text-sm text-emerald-600">
                                Correct answer: <span className="font-medium">{answer.correct_answer}</span>
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              Points: {answer.points_earned}/{answer.total_points}
                            </p>
                          </div>
                        </div>
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

  const currentQuestion = assessment.questions[currentIndex];
  const totalQuestions = assessment.questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <PublicLayout>
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => router.push(`/assessments/${params.id}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Exit
            </Button>

            {timeRemaining !== null && (
              <Badge
                variant={timeRemaining < 60 ? "destructive" : "secondary"}
                className="text-lg px-4 py-1"
              >
                <Clock className="h-4 w-4 mr-2" />
                {formatTime(timeRemaining)}
              </Badge>
            )}
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <span>{answeredCount} answered</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="mb-4">
                <Badge variant="outline" className="mb-2">
                  {currentQuestion.points} point{currentQuestion.points > 1 ? "s" : ""}
                </Badge>
                <Badge variant="secondary" className="ml-2">
                  {currentQuestion.type.replace("_", " ")}
                </Badge>
              </div>

              <h2 className="text-xl font-semibold mb-6">
                {currentQuestion.question}
              </h2>

              {currentQuestion.type === "multiple_choice" && currentQuestion.options && (
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={(value: string) => handleAnswerChange(currentQuestion.id, value)}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value={option} id={`option-${idx}`} />
                      <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.type === "true_false" && (
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={(value: string) => handleAnswerChange(currentQuestion.id, value)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="true" id="true" />
                    <Label htmlFor="true" className="flex-1 cursor-pointer">True</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="false" id="false" />
                    <Label htmlFor="false" className="flex-1 cursor-pointer">False</Label>
                  </div>
                </RadioGroup>
              )}

              {currentQuestion.type === "short_answer" && (
                <Textarea
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Type your answer here..."
                  rows={3}
                />
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous
            </Button>

            {currentIndex === totalQuestions - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={submitting || answeredCount === 0}
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Submit Assessment
              </Button>
            ) : (
              <Button onClick={() => setCurrentIndex(Math.min(totalQuestions - 1, currentIndex + 1))}>
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

export default function TakeAssessmentPage() {
  return (
    <Suspense
      fallback={
        <PublicLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </PublicLayout>
      }
    >
      <TakeAssessmentContent />
    </Suspense>
  );
}
