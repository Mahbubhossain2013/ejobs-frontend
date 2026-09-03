"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/theme-store";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { User, Briefcase, GraduationCap, Award, BookOpen, Globe, Link2, FileCheck, ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { compressImageToWebP } from "@/lib/image-compression";
import { useProfileForm } from "@/hooks/use-profile-form";
import ProfileSectionPersonal from "@/components/profile/ProfileSectionPersonal";
import ProfileSectionContact from "@/components/profile/ProfileSectionContact";
import ProfileSectionCareer from "@/components/profile/ProfileSectionCareer";
import ProfileSectionEducation from "@/components/profile/ProfileSectionEducation";
import ProfileSectionExperience from "@/components/profile/ProfileSectionExperience";
import ProfileSectionSkills from "@/components/profile/ProfileSectionSkills";
import ProfileSectionLanguages from "@/components/profile/ProfileSectionLanguages";
import ProfileSectionTraining from "@/components/profile/ProfileSectionTraining";
import ProfileSectionCertifications from "@/components/profile/ProfileSectionCertifications";
import ProfileSectionDocuments from "@/components/profile/ProfileSectionDocuments";
import ProfileSectionSocial from "@/components/profile/ProfileSectionSocial";

const STEPS = [
  { key: "personal", icon: User, labelEn: "Personal", labelBn: "ব্যক্তিগত" },
  { key: "contact", icon: Briefcase, labelEn: "Contact", labelBn: "যোগাযোগ" },
  { key: "career", icon: Briefcase, labelEn: "Career", labelBn: "ক্যারিয়ার" },
  { key: "education", icon: GraduationCap, labelEn: "Education", labelBn: "শিক্ষা" },
  { key: "experience", icon: Briefcase, labelEn: "Experience", labelBn: "অভিজ্ঞতা" },
  { key: "skills", icon: Award, labelEn: "Skills", labelBn: "দক্ষতা" },
  { key: "languages", icon: Globe, labelEn: "Languages", labelBn: "ভাষা" },
  { key: "training", icon: BookOpen, labelEn: "Training", labelBn: "প্রশিক্ষণ" },
  { key: "certifications", icon: Award, labelEn: "Certifications", labelBn: "সার্টিফিকেশন" },
  { key: "documents", icon: FileCheck, labelEn: "Documents", labelBn: "ডকুমেন্ট" },
  { key: "social", icon: Link2, labelEn: "Social Links", labelBn: "সোশ্যাল লিংক" },
];

export default function CandidateProfilePage() {
  const { language, settings } = useThemeStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const isBn = language === "bn";
  const siteName = settings.site_name || process.env.NEXT_PUBLIC_APP_NAME || "eJobs";

  const [step, setStep] = useState(0);
  const [savedSteps, setSavedSteps] = useState<Set<number>>(new Set());
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const form = useProfileForm();
  const { saving, handleSave, loading } = form;

  useEffect(() => {
    document.title = isBn ? `প্রোফাইল সম্পাদনা | ${siteName}` : `Edit Profile | ${siteName}`;
  }, [isBn, siteName]);

  useEffect(() => {
    if (user && form.avatarExisting) setAvatarPreview(form.avatarExisting);
  }, [user, form.avatarExisting]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.info(isBn ? "ছবি প্রক্রিয়াকরণ হচ্ছে..." : "Processing image...");
    const compressed = await compressImageToWebP(file);
    if (compressed.size > 2 * 1024 * 1024) {
      toast.error(isBn ? "ছবি ২MB এর বেশি।" : "Image too large.");
      return;
    }
    const sizeKb = Math.round(compressed.size / 1024);
    setAvatarFile(compressed);
    setAvatarPreview(URL.createObjectURL(compressed));
    toast.success(isBn ? `ছবি ${sizeKb}KB তে সংকুচিত হয়েছে` : `Compressed to ${sizeKb}KB`);
  };

  const handleSaveCurrent = async () => {
    const ok = await handleSave(step, avatarFile);
    if (ok) {
      setSavedSteps((prev) => new Set(prev).add(step));
      if (step < STEPS.length - 1) setStep(step + 1);
    }
  };

  const handleSaveAndFinish = async () => {
    const ok = await handleSave(step, avatarFile);
    if (ok) {
      setSavedSteps((prev) => new Set(prev).add(step));
      setShowCompletionModal(true);
      setTimeout(() => router.push("/dashboard/profile/overview"), 2500);
    }
  };

  const completionPct = form.getCompletionPct();
  const completedSteps = new Set([...form.getCompletedSteps(), ...savedSteps]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderSection = () => {
    switch (STEPS[step].key) {
      case "personal":
        return <ProfileSectionPersonal isBn={isBn} avatarPreview={avatarPreview} onAvatarChange={handleAvatarChange}
          fullNameBn={form.fullNameBn} setFullNameBn={form.setFullNameBn}
          fullNameEn={form.fullNameEn} setFullNameEn={form.setFullNameEn}
          fatherName={form.fatherName} setFatherName={form.setFatherName}
          motherName={form.motherName} setMotherName={form.setMotherName}
          dob={form.dob} setDob={form.setDob}
          gender={form.gender} setGender={form.setGender}
          maritalStatus={form.maritalStatus} setMaritalStatus={form.setMaritalStatus}
          nationality={form.nationality} setNationality={form.setNationality}
          nationalId={form.nationalId} setNationalId={form.setNationalId}
          birthRegNo={form.birthRegNo} setBirthRegNo={form.setBirthRegNo} />;
      case "contact":
        return <ProfileSectionContact isBn={isBn}
          phone={form.phone} setPhone={form.setPhone}
          altPhone={form.altPhone} setAltPhone={form.setAltPhone}
          email={form.email} setEmail={form.setEmail}
          presentAddress={form.presentAddress} setPresentAddress={form.setPresentAddress}
          permanentAddress={form.permanentAddress} setPermanentAddress={form.setPermanentAddress}
          division={form.division} setDivision={form.setDivision}
          district={form.district} setDistrict={form.setDistrict}
          upazila={form.upazila} setUpazila={form.setUpazila}
          unionName={form.unionName} setUnionName={form.setUnionName}
          postOffice={form.postOffice} setPostOffice={form.setPostOffice}
          postalCode={form.postalCode} setPostalCode={form.setPostalCode} />;
      case "career":
        return <ProfileSectionCareer isBn={isBn}
          careerObjective={form.careerObjective} setCareerObjective={form.setCareerObjective}
          currentProfession={form.currentProfession} setCurrentProfession={form.setCurrentProfession}
          expectedJobCategory={form.expectedJobCategory} setExpectedJobCategory={form.setExpectedJobCategory}
          preferredLocation={form.preferredLocation} setPreferredLocation={form.setPreferredLocation}
          expectedSalary={form.expectedSalary} setExpectedSalary={form.setExpectedSalary}
          availableRemote={form.availableRemote} setAvailableRemote={form.setAvailableRemote}
          availableRelocation={form.availableRelocation} setAvailableRelocation={form.setAvailableRelocation} />;
      case "education":
        return <ProfileSectionEducation isBn={isBn} educations={form.educations} onUpdate={form.updateEducation} onRemove={form.removeEducation} onAdd={form.addEducation} />;
      case "experience":
        return <ProfileSectionExperience isBn={isBn} experiences={form.experiences} onUpdate={form.updateExperience} onRemove={form.removeExperience} onAdd={form.addExperience} />;
      case "skills":
        return <ProfileSectionSkills isBn={isBn} skills={form.skills} setSkills={form.setSkills} />;
      case "languages":
        return <ProfileSectionLanguages isBn={isBn} languages={form.languages} onToggle={form.toggleLanguage} onUpdate={form.updateLangProficiency} />;
      case "training":
        return <ProfileSectionTraining isBn={isBn} trainings={form.trainings} onUpdate={form.updateTraining} onRemove={form.removeTraining} onAdd={form.addTraining} />;
      case "certifications":
        return <ProfileSectionCertifications isBn={isBn} certifications={form.certifications} onUpdate={form.updateCertification} onRemove={form.removeCertification} onAdd={form.addCertification} onFileChange={form.setCertFile} />;
      case "documents":
        return <ProfileSectionDocuments isBn={isBn} documents={form.documents} onUpdate={form.setDocuments} />;
      case "social":
        return <ProfileSectionSocial linkedinUrl={form.linkedinUrl} setLinkedinUrl={form.setLinkedinUrl}
          githubUrl={form.githubUrl} setGithubUrl={form.setGithubUrl}
          facebookUrl={form.facebookUrl} setFacebookUrl={form.setFacebookUrl}
          portfolioUrl={form.portfolioUrl} setPortfolioUrl={form.setPortfolioUrl}
          twitterUrl={form.twitterUrl} setTwitterUrl={form.setTwitterUrl}
          instagramUrl={form.instagramUrl} setInstagramUrl={form.setInstagramUrl}
          youtubeUrl={form.youtubeUrl} setYoutubeUrl={form.setYoutubeUrl}
          stackoverflowUrl={form.stackoverflowUrl} setStackoverflowUrl={form.setStackoverflowUrl}
          whatsappUrl={form.whatsappUrl} setWhatsappUrl={form.setWhatsappUrl}
          telegramUrl={form.telegramUrl} setTelegramUrl={form.setTelegramUrl} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isBn ? "প্রোফাইল সম্পাদনা" : "Edit Profile"}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{isBn ? "ধাপে ধাপে আপনার প্রোফাইল সম্পূর্ণ করুন" : "Complete your profile step by step"}</p>
        </div>
        <Button onClick={async () => { const ok = await handleSave(step, avatarFile); if (ok) setSavedSteps((prev) => new Set(prev).add(step)); }} disabled={saving} variant="outline">
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {saving ? (isBn ? "সংরক্ষিত হচ্ছে..." : "Saving...") : (isBn ? "সংরক্ষণ করুন" : "Save")}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">{isBn ? "প্রোফাইল সম্পূর্ণতা" : "Profile Completion"}</p>
            <Badge variant={completionPct >= 80 ? "default" : completionPct >= 50 ? "secondary" : "outline"}>{completionPct}%</Badge>
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${completionPct}%` }} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <button key={s.key} onClick={() => setStep(i)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                i === step ? "bg-primary text-primary-foreground" : completedSteps.has(i) ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}>
              {completedSteps.has(i) ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              {isBn ? s.labelBn : s.labelEn}
            </button>
          );
        })}
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            {React.createElement(STEPS[step].icon, { className: "h-5 w-5 text-primary" })}
            {isBn ? STEPS[step].labelBn : STEPS[step].labelEn}
            <Badge variant="outline" className="ml-auto text-xs">{step + 1}/{STEPS.length}</Badge>
          </h2>
          {renderSection()}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pb-8">
        <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0}>
          <ChevronLeft className="h-4 w-4 mr-1" /> {isBn ? "পূর্ববর্তী" : "Previous"}
        </Button>
        <div className="flex items-center gap-2">
          {step < STEPS.length - 1 && (
            <Button variant="ghost" onClick={() => setStep(step + 1)}>{isBn ? "এড়িয়ে যান" : "Skip"}</Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={handleSaveCurrent} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isBn ? "সংরক্ষণ ও পরবর্তী" : "Save & Continue"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSaveAndFinish} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isBn ? "সম্পূর্ণ সংরক্ষণ করুন" : "Save Complete Profile"}
              <Check className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center justify-center gap-2">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              {isBn ? "ধন্যবাদ! প্রোফাইল সম্পন্ন।" : "Thank you! Profile completed."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{isBn ? "প্রোফাইল ওভারভিউতে নিয়ে যাওয়া হচ্ছে..." : "Redirecting to profile overview..."}</p>
            <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard/profile/overview")}>{isBn ? "এখনই যান" : "Go Now"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}