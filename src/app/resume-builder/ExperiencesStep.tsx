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
          <div>
            <h2 className="text-xl font-bold">
              {isBn ? "অভিজ্ঞতা, শিক্ষা ও দক্ষতা" : "Experience, Education & Skills"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isBn ? "৩টি ট্যাবে তথ্য পূরণ করুন (অবজেক্টিভ, শিক্ষা/অভিজ্ঞতা এবং স্কিলস)" : "Complete all 3 tabs below to build a full professional CV"}
            </p>
          </div>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-xs text-foreground flex items-center gap-2">
          <span className="text-base">💡</span>
          <span>
            {isBn
              ? "সিভিতে শিক্ষাগত যোগ্যতা ও কাজের অভিজ্ঞতা যুক্ত করতে উপরের '২. শিক্ষা ও কাজের অভিজ্ঞতা' ট্যাবে তথ্য দিন।"
              : "To display education and work history on your CV, make sure to add them in tab '2. Qualifications'."}
          </span>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveExpView("details")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeExpView === "details"
                ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                : "bg-muted hover:bg-muted/80 text-foreground"
            }`}
          >
            <span>{isBn ? "১. অবজেক্টিভ" : "1. Objective"}</span>
            {data.resume_objective?.description && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveExpView("qualifications")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeExpView === "qualifications"
                ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                : "bg-muted hover:bg-muted/80 text-foreground"
            }`}
          >
            <span>{isBn ? "২. শিক্ষা ও কাজের অভিজ্ঞতা" : "2. Qualifications"}</span>
            {((data.education?.length || 0) > 0 || (data.work_experience?.length || 0) > 0) ? (
              <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                {(data.education?.length || 0) + (data.work_experience?.length || 0)}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setActiveExpView("extras")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeExpView === "extras"
                ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                : "bg-muted hover:bg-muted/80 text-foreground"
            }`}
          >
            <span>{isBn ? "৩. দক্ষতা ও অন্যান্য" : "3. Skills & Extras"}</span>
            {(data.skills?.length || 0) > 0 ? (
              <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                {data.skills?.length}
              </span>
            ) : null}
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

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t">
          {activeExpView === "details" && (
            <>
              <Button variant="outline" onClick={onPrev} className="gap-2 w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4" />
                {isBn ? "পূর্ববর্তী ধাপ (ব্যক্তিগত তথ্য)" : "Previous (Personal Details)"}
              </Button>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="ghost" size="sm" onClick={onNext} className="text-xs text-muted-foreground hover:text-foreground">
                  {isBn ? "সরাসরি প্রিভিউ দেখুন" : "Skip to Preview"}
                </Button>
                <Button onClick={() => setActiveExpView("qualifications")} className="gap-2 bg-primary hover:bg-primary/90 font-bold flex-1 sm:flex-initial">
                  {isBn ? "পরবর্তী: শিক্ষা ও অভিজ্ঞতা ট্যাব" : "Next: Qualifications Tab"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {activeExpView === "qualifications" && (
            <>
              <Button variant="outline" onClick={() => setActiveExpView("details")} className="gap-2 w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4" />
                {isBn ? "পূর্ববর্তী: অবজেক্টিভ" : "Previous: Objective"}
              </Button>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="ghost" size="sm" onClick={onNext} className="text-xs text-muted-foreground hover:text-foreground">
                  {isBn ? "সরাসরি প্রিভিউ দেখুন" : "Skip to Preview"}
                </Button>
                <Button onClick={() => setActiveExpView("extras")} className="gap-2 bg-primary hover:bg-primary/90 font-bold flex-1 sm:flex-initial">
                  {isBn ? "পরবর্তী: দক্ষতা ও অন্যান্য" : "Next: Skills & Extras"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {activeExpView === "extras" && (
            <>
              <Button variant="outline" onClick={() => setActiveExpView("qualifications")} className="gap-2 w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4" />
                {isBn ? "পূর্ববর্তী: শিক্ষা ও অভিজ্ঞতা" : "Previous: Qualifications"}
              </Button>
              <Button onClick={onNext} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold w-full sm:w-auto shadow-md">
                {isBn ? "পরবর্তী ধাপ: সিভি প্রিভিউ ও সাবমিট" : "Next: Preview & Submit CV"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}
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