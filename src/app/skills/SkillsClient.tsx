"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api-client";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, GraduationCap, Users, Clock, Award } from "lucide-react";

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
}

export default function SkillsClient() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  useEffect(() => {
    api.get("/skills/categories").then((res) => setCategories(res.data?.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (category !== "all") params.category = category;
    if (difficulty !== "all") params.difficulty = difficulty;

    api.get("/skills", { params })
      .then((res) => setCourses(res.data?.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, category, difficulty]);

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case "beginner": return "bg-emerald-100 text-emerald-800";
      case "intermediate": return "bg-blue-100 text-blue-800";
      case "advanced": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <PublicLayout>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">Skill Center</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional skill training courses powered by {process.env.NEXT_PUBLIC_APP_NAME || "eJobs"}. Get certified and boost your career.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-8 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Course Grid */}
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No courses found. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Link key={course.id} href={`/skills/${course.id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className={getDifficultyColor(course.difficulty)}>{course.difficulty}</Badge>
                        {course.is_certified && (
                          <Badge variant="outline" className="text-xs"><Award className="h-3 w-3 mr-1" /> Certified</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{course.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {course.duration_hours}h</span>
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {course.enrollment_count} enrolled</span>
                      </div>
                      <div className="mt-4 pt-3 border-t flex items-center justify-between">
                        <span className="font-bold text-primary">
                          {course.price > 0 ? `${course.currency} ${course.price}` : "Free"}
                        </span>
                        <Button size="sm" variant="outline">View Course</Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
