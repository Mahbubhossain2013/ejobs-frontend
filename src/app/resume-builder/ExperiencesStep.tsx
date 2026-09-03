"use client";

import React from "react";
import type { useResumeWizard } from "@/hooks/use-resume-wizard";
import { useThemeStore } from "@/store/theme-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ResumeObjectiveSection from "./sections/ResumeObjectiveSection";
import EducationSection from "./sections/EducationSection";
import InterestsSection from "./sections/InterestsSection";
import SkillsSection from "./sections/SkillsSection";
import WorkExperienceSection from "./sections/WorkExperienceSection";
import LanguagesSection from "./sections/LanguagesSection";
import AchievementsSection from "./sections/AchievementsSection";
import CustomSection from "./sections/CustomSection";
import CertificationsSection from "./sections/CertificationsSection";
import ProjectsSection from "./sections/ProjectsSection";
import ReferencesSection from "./sections/ReferencesSection";
import TrainingSection from "./sections/TrainingSection";

export default function ExperiencesStep({ wizard, onNext, onPrev }: { wizard: ReturnType<typeof useResumeWizard>; onNext: () => void; onPrev: () => void }) {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const { data, setSectionData, activeExpView, setActiveExpView } = wizard;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">My experiences</h2>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setActiveExpView("details")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeExpView === "details" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
            Resume Details
          </button>
          <button onClick={() => setActiveExpView("qualifications")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeExpView === "qualifications" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
            Qualifications
          </button>
          <button onClick={() => setActiveExpView("extras")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeExpView === "extras" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
            Extras
          </button>
        </div>

        {activeExpView === "details" ? (
          <div className="space-y-6">
            <ResumeObjectiveSection data={data.resume_objective} onChange={(d) => setSectionData("resume_objective", d)} />
            <CustomSection data={data.custom_sections} onChange={(d) => setSectionData("custom_sections", d)} isBn={isBn} />
          </div>
        ) : activeExpView === "qualifications" ? (
          <div className="space-y-6">
            <EducationSection data={data.education} onChange={(d) => setSectionData("education", d)} isBn={isBn} />
            <InterestsSection data={data.interests} onChange={(d) => setSectionData("interests", d)} isBn={isBn} />
            <SkillsSection data={data.skills} onChange={(d) => setSectionData("skills", d)} isBn={isBn} />
            <WorkExperienceSection data={data.work_experience} onChange={(d) => setSectionData("work_experience", d)} isBn={isBn} />
            <LanguagesSection data={data.languages} onChange={(d) => setSectionData("languages", d)} isBn={isBn} />
            <AchievementsSection data={data.achievements} onChange={(d) => setSectionData("achievements", d)} isBn={isBn} />
          </div>
        ) : (
          <div className="space-y-6">
            <CertificationsSection data={data.certifications} onChange={(d) => setSectionData("certifications", d)} isBn={isBn} />
            <ProjectsSection data={data.projects} onChange={(d) => setSectionData("projects", d)} isBn={isBn} />
            <ReferencesSection data={data.references} onChange={(d) => setSectionData("references", d)} isBn={isBn} />
            <TrainingSection data={data.training} onChange={(d) => setSectionData("training", d)} isBn={isBn} />
          </div>
        )}

        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={onPrev} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {isBn ? "পূর্ববর্তী ধাপ (ব্যক্তিগত তথ্য)" : "Previous (Personal Details)"}
          </Button>
          <Button onClick={onNext} className="gap-2 bg-primary hover:bg-primary/90 font-bold">
            {isBn ? "পরবর্তী ধাপ: সিভি প্রিভিউ ও সাবমিট" : "Next: Preview & Submit CV"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="hidden lg:block lg:col-span-2">
        <Card className="sticky top-24"><CardContent className="p-4 text-sm text-muted-foreground space-y-2">
          <p className="font-medium text-foreground">Tips</p>
          <ul className="text-xs space-y-1 list-disc pl-4">
            <li>Keep descriptions concise and impactful</li>
            <li>Use action verbs to start each bullet point</li>
            <li>Quantify achievements where possible</li>
            <li>Tailor your resume to the job you are applying for</li>
          </ul>
        </CardContent></Card>
      </div>
    </div>
  );
}