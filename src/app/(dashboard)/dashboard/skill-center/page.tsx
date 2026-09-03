"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useThemeStore } from "@/store/theme-store";
import api from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Award, Clock, ChevronRight, Star, BarChart3 } from "lucide-react";

interface Course {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  price: number;
  currency: string;
  instructor_name: string;
  thumbnail_path: string | null;
  duration_hours: number;
  enrollment_count: number;
}

interface Enrollment {
  id: number;
  course_id: number;
  status: string;
  progress: number;
  enrolled_at: string;
  completed_at: string | null;
  course: Course;
}

export default function SkillCenterPage() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    Promise.all([
      api.get("/skills/my-courses").catch(() => ({ data: { data: [] } })),
      api.get("/skills").catch(() => ({ data: { data: [] } })),
    ]).then(([myRes, allRes]) => {
      setEnrollments(myRes.data?.data || []);
      setCourses(allRes.data?.data?.data || allRes.data?.data || []);
      setLoading(false);
    });
  }, []);

  const enrolledIds = new Set(enrollments.map((e) => e.course_id));
  const inProgress = enrollments.filter((e) => e.status === "in_progress" || e.status === "enrolled");
  const completed = enrollments.filter((e) => e.status === "completed");
  const available = courses.filter((c) => !enrolledIds.has(c.id)).slice(0, 6);

  const totalHours = enrollments.reduce((sum, e) => sum + (e.course?.duration_hours || 0), 0);
  const avgProgress = enrollments.length ? Math.round(enrollments.reduce((sum, e) => sum + Number(e.progress), 0) / enrollments.length) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{isBn ? "দক্ষতা কেন্দ্র" : "Skill Center"}</h1>
        <p className="text-muted-foreground mt-1">
          {isBn ? "আপনার কোর্স ও শেখার যাত্রা" : "Your courses and learning journey"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: isBn ? "এনরোলড" : "Enrolled", value: enrollments.length, color: "text-blue-500" },
          { icon: BarChart3, label: isBn ? "গড় অগ্রগতি" : "Avg Progress", value: `${avgProgress}%`, color: "text-amber-500" },
          { icon: Clock, label: isBn ? "মোট ঘণ্টা" : "Total Hours", value: totalHours, color: "text-emerald-500" },
          { icon: Award, label: isBn ? "সম্পন্ন" : "Completed", value: completed.length, color: "text-purple-500" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* My Courses (in progress) */}
      {inProgress.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">{isBn ? "চলমান কোর্স" : "In Progress"}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgress.map((enrollment) => (
              <Link key={enrollment.id} href={`/dashboard/skill-center/${enrollment.course_id}`}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-sm line-clamp-2">{enrollment.course?.title}</h3>
                      <Badge variant={enrollment.status === "completed" ? "default" : "secondary"} className="shrink-0 text-[10px]">
                        {enrollment.status === "completed" ? (isBn ? "সম্পন্ন" : "Done") : (isBn ? "চলছে" : "Active")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{enrollment.course?.category} &middot; {enrollment.course?.difficulty}</p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${Number(enrollment.progress)}%` }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{Number(enrollment.progress)}%</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">{isBn ? "সম্পন্ন কোর্স" : "Completed Courses"}</h2>
            <Link href="/dashboard/skill-center/certificates" className="text-sm text-primary hover:underline flex items-center gap-1">
              <Award className="h-4 w-4" /> {isBn ? "সার্টিফিকেট দেখুন" : "View Certificates"}
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completed.map((enrollment) => (
              <Link key={enrollment.id} href={`/dashboard/skill-center/${enrollment.course_id}`}>
                <Card className="hover:shadow-md transition-shadow h-full border-emerald-200 dark:border-emerald-900">
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold text-sm">{enrollment.course?.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-emerald-500 text-[10px]">{isBn ? "সম্পন্ন" : "Completed"}</Badge>
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Available Courses */}
      {available.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">{isBn ? "উপলব্ধ কোর্স" : "Available Courses"}</h2>
            <Link href="/skills" className="text-sm text-primary hover:underline">{isBn ? "সব দেখুন" : "View All"} &rarr;</Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {available.map((course) => (
              <Link key={course.id} href={`/skills/${course.id}`}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold text-sm">{course.title}</h3>
                    <p className="text-xs text-muted-foreground">{course.category} &middot; {course.difficulty}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">
                        {course.price > 0 ? `${course.currency} ${course.price}` : (isBn ? "বিনামূল্যে" : "Free")}
                      </span>
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {enrollments.length === 0 && courses.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center space-y-3">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="font-semibold">{isBn ? "কোনো কোর্স পাওয়া যায়নি" : "No Courses Available"}</h3>
            <p className="text-sm text-muted-foreground">
              {isBn ? "শীঘ্রই কোর্স যোগ করা হবে" : "Courses will be added soon"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
