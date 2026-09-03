"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api-client";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Award, Users, Clock, BookOpen, ArrowLeft, CheckCircle, HelpCircle } from "lucide-react";

interface Lesson {
  id: number;
  title: string;
  duration_minutes: number;
  order: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_hours: number;
  price: number;
  currency: string;
  instructor_name: string | null;
  is_certified: boolean;
  enrollment_count: number;
  lessons: Lesson[];
  assessment?: {
    id: number;
    title: string;
    questions_count: number;
    passing_score: number;
  } | null;
}

interface Enrollment {
  id: number;
  status: string;
  progress: number;
  enrolled_at: string;
  completed_at: string | null;
}

interface Certificate {
  id: number;
  certificate_number: string;
  issued_at: string;
}

export default function SkillDetailClient() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const fetchCourse = () => {
    api.get(`/skills/${params.id}`)
      .then((res) => {
        setCourse(res.data?.data);
        setEnrollment(res.data?.enrollment || null);
        setCertificate(res.data?.certificate || null);
      })
      .catch(() => { toast.error("Course not found"); router.push("/skills"); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourse(); }, [params.id]);

  const handleEnroll = async () => {
    if (!user) { toast.error("Please login to enroll"); router.push("/login"); return; }
    setEnrolling(true);
    try {
      await api.post(`/skills/${course!.id}/enroll`);
      toast.success("Enrolled successfully!");
      fetchCourse();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to enroll");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <PublicLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></PublicLayout>;
  }

  if (!course) return null;

  return (
    <PublicLayout>
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Button variant="ghost" className="mb-6" onClick={() => router.push("/skills")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
          </Button>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-4">
                <Badge className="bg-primary/10 text-primary">{course.category}</Badge>
                {course.is_certified && <Badge variant="outline"><Award className="h-3 w-3 mr-1" /> Certified</Badge>}
              </div>

              <h1 className="text-3xl font-bold mb-3">{course.title}</h1>

              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.duration_hours} hours</span>
                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.enrollment_count} enrolled</span>
                <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {course.lessons?.length || 0} lessons</span>
                {course.instructor_name && <span>Instructor: {course.instructor_name}</span>}
              </div>

              <p className="text-muted-foreground mb-8 leading-relaxed">{course.description}</p>

              {enrollment ? (
                <div className="bg-muted/50 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold mb-3">Your Progress</h3>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>{enrollment.status === "completed" ? "Completed!" : "In Progress"}</span>
                    <span>{enrollment.progress}%</span>
                  </div>
                  <Progress value={enrollment.progress} className="h-3" />
                  {enrollment.status === "completed" && (
                    <div className="mt-4 space-y-2">
                      <p className="text-emerald-600 text-sm flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" /> Course completed!
                      </p>
                      <div className="flex items-center gap-3">
                        {certificate && (
                          <Button asChild size="sm" variant="outline">
                            <a href={`/api/certificates/${certificate.id}/download`} target="_blank" rel="noopener noreferrer">
                              <Award className="h-4 w-4 mr-1" /> Download Certificate
                            </a>
                          </Button>
                        )}
                        <Button asChild size="sm" variant="outline">
                          <a href="/certificates">
                            <Award className="h-4 w-4 mr-1" /> My Certificates
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Button size="lg" onClick={handleEnroll} disabled={enrolling}>
                    {enrolling ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enrolling...</> : "Enroll Now"}
                  </Button>
                  <span className="text-2xl font-bold text-primary">
                    {course.price > 0 ? `${course.currency} ${course.price}` : "Free"}
                  </span>
                </div>
              )}

              {course.assessment && (
                <div className="mt-6 border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <HelpCircle className="h-5 w-5" /> Assessment Available
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {course.assessment.questions_count} questions &middot; Pass: {course.assessment.passing_score}%
                      </p>
                    </div>
                    <Button asChild variant="outline">
                      <a href={`/assessments/${course.assessment.id}`}>
                        Take Assessment
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lessons */}
          {course.lessons && course.lessons.length > 0 && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Course Lessons</h3>
                <div className="space-y-2">
                  {course.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50">
                      <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-medium">
                        {lesson.order}
                      </span>
                      <span className="flex-1">{lesson.title}</span>
                      <span className="text-xs text-muted-foreground">{lesson.duration_minutes}min</span>
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
