"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { useThemeStore } from "@/store/theme-store";
import { toast } from "sonner";
import type { CandidateEducationEntry, CandidateExperienceEntry, CandidateTrainingEntry, CandidateCertificationEntry, CandidateDocumentEntry, LanguageProficiency } from "@/types";
import { getStorageUrl } from "@/lib/utils";

export function useProfileForm() {
  const { user, setUser } = useAuthStore();
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarExisting, setAvatarExisting] = useState("");

  // Personal
  const [fullNameBn, setFullNameBn] = useState("");
  const [fullNameEn, setFullNameEn] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [nationality, setNationality] = useState("Bangladeshi");
  const [nationalId, setNationalId] = useState("");
  const [birthRegNo, setBirthRegNo] = useState("");

  // Contact
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [email, setEmail] = useState("");
  const [presentAddress, setPresentAddress] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [division, setDivision] = useState("");
  const [upazila, setUpazila] = useState("");
  const [unionName, setUnionName] = useState("");
  const [postOffice, setPostOffice] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Career
  const [careerObjective, setCareerObjective] = useState("");
  const [currentProfession, setCurrentProfession] = useState("");
  const [expectedJobCategory, setExpectedJobCategory] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [availableRemote, setAvailableRemote] = useState(false);
  const [availableRelocation, setAvailableRelocation] = useState(false);

  // Array fields
  const [educations, setEducations] = useState<CandidateEducationEntry[]>([]);
  const [experiences, setExperiences] = useState<CandidateExperienceEntry[]>([]);
  const [skills, setSkills] = useState("");
  const [languages, setLanguages] = useState<LanguageProficiency[]>([]);
  const [trainings, setTrainings] = useState<CandidateTrainingEntry[]>([]);
  const [certifications, setCertifications] = useState<(CandidateCertificationEntry & { _cert_file?: File })[]>([]);
  const [documents, setDocuments] = useState<CandidateDocumentEntry[]>([]);

  // Social
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [stackoverflowUrl, setStackoverflowUrl] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [telegramUrl, setTelegramUrl] = useState("");

  // ── Load from API ──
  useEffect(() => {
    if (!user) return;
    api.get("/candidate/dashboard").then((res) => {
      const p = res.data.user?.profile || res.data.data?.profile || {};
      setEmail(user.email || "");
      setFullNameEn(user.name || "");
      setFullNameBn(p.full_name_bn || "");
      setFatherName(p.father_name || "");
      setMotherName(p.mother_name || "");
      setDob(p.date_of_birth || "");
      setGender(p.gender || "");
      setMaritalStatus(p.marital_status || "");
      setNationality(p.nationality || "Bangladeshi");
      setNationalId(p.national_id || "");
      setBirthRegNo(p.birth_reg_no || "");
      setPhone(p.phone || "");
      setAltPhone(p.alt_phone || "");
      setPresentAddress(p.present_address || p.address || "");
      setPermanentAddress(p.permanent_address || "");
      setDistrict(p.district || "");
      setDivision(p.division || "");
      setUpazila(p.upazila || "");
      setUnionName(p.union || "");
      setPostOffice(p.post_office || "");
      setPostalCode(p.postal_code || "");
      setCareerObjective(p.career_objective || "");
      setCurrentProfession(p.current_profession || "");
      setExpectedJobCategory(p.expected_job_category || "");
      setPreferredLocation(p.preferred_location || "");
      setExpectedSalary(p.expected_salary || "");
      setAvailableRemote(p.available_remote || false);
      setAvailableRelocation(p.available_relocation || false);
      setSkills(Array.isArray(p.skills) ? p.skills.join(", ") : "");
      setLinkedinUrl(p.linkedin_url || "");
      setGithubUrl(p.github_url || "");
      setFacebookUrl(p.facebook_url || "");
      setPortfolioUrl(p.portfolio_url || "");
      if (p.social_links) {
        const sl = typeof p.social_links === "string" ? JSON.parse(p.social_links) : p.social_links;
        setTwitterUrl(sl.twitter_url || "");
        setInstagramUrl(sl.instagram_url || "");
        setYoutubeUrl(sl.youtube_url || "");
        setStackoverflowUrl(sl.stackoverflow_url || "");
        setWhatsappUrl(sl.whatsapp_url || "");
        setTelegramUrl(sl.telegram_url || "");
      }
      if (Array.isArray(p.educations)) setEducations(p.educations);
      if (Array.isArray(p.experiences)) setExperiences(p.experiences);
      if (Array.isArray(p.language_proficiency)) setLanguages(p.language_proficiency);
      if (Array.isArray(p.trainings)) setTrainings(p.trainings);
      if (Array.isArray(p.certifications)) setCertifications(p.certifications);
      if (Array.isArray(p.documents)) setDocuments(p.documents);
      const existingAvatar = res.data.user?.avatar || p.avatar || user?.avatar || "";
      if (existingAvatar) setAvatarExisting(getStorageUrl(existingAvatar));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  // ── Array mutators ──
  const addEducation = () => setEducations((p) => [...p, { level: "", board: "", group_or_subject: "", institute_name: "", passing_year: undefined, gpa_or_cgpa: undefined }]);
  const removeEducation = (i: number) => setEducations((p) => p.filter((_, idx) => idx !== i));
  const updateEducation = (i: number, field: string, value: any) => setEducations((p) => { const n = [...p]; n[i] = { ...n[i], [field]: value }; return n; });

  const addExperience = () => setExperiences((p) => [...p, { company_name: "", designation: "", employment_type: "Full-time", start_date: "", end_date: "", is_current: false, responsibilities: "" }]);
  const removeExperience = (i: number) => setExperiences((p) => p.filter((_, idx) => idx !== i));
  const updateExperience = (i: number, field: string, value: any) => setExperiences((p) => { const n = [...p]; n[i] = { ...n[i], [field]: value }; return n; });

  const addTraining = () => setTrainings((p) => [...p, { title: "", institute_name: "", duration: "", year: undefined }]);
  const removeTraining = (i: number) => setTrainings((p) => p.filter((_, idx) => idx !== i));
  const updateTraining = (i: number, field: string, value: any) => setTrainings((p) => { const n = [...p]; n[i] = { ...n[i], [field]: value }; return n; });

  const addCertification = () => setCertifications((p) => [...p, { name: "", organization: "", issue_date: "", expiry_date: "" }]);
  const removeCertification = (i: number) => setCertifications((p) => p.filter((_, idx) => idx !== i));
  const updateCertification = (i: number, field: string, value: string) => setCertifications((p) => { const n = [...p]; n[i] = { ...n[i], [field]: value }; return n; });
  const setCertFile = (i: number, file: File | undefined) => setCertifications((p) => { const n = [...p]; n[i] = { ...n[i], _cert_file: file }; return n; });

  const toggleLanguage = (lang: string) => {
    setLanguages((p) => {
      const exists = p.find((l) => l.name === lang);
      return exists ? p.filter((l) => l.name !== lang) : [...p, { name: lang, read: true, write: true, speak: true }];
    });
  };
  const updateLangProficiency = (lang: string, field: "read" | "write" | "speak", value: boolean) => {
    setLanguages((p) => p.map((l) => l.name === lang ? { ...l, [field]: value } : l));
  };

  // ── Section save functions ──
  const STEPS_KEYS = ["personal", "contact", "career", "education", "experience", "skills", "languages", "training", "certifications", "documents", "social"];

  const saveSection = async (stepIdx: number, avatarFile?: File | null): Promise<boolean> => {
    try {
      setSaving(true);
      const key = STEPS_KEYS[stepIdx];
      switch (key) {
        case "personal": {
          const fd = new FormData();
          fd.append("name", fullNameEn || user?.name || "");
          fd.append("full_name_bn", fullNameBn);
          fd.append("full_name_en", fullNameEn);
          fd.append("father_name", fatherName);
          fd.append("mother_name", motherName);
          fd.append("date_of_birth", dob);
          fd.append("gender", gender);
          fd.append("marital_status", maritalStatus);
          fd.append("nationality", nationality);
          fd.append("national_id", nationalId);
          fd.append("birth_reg_no", birthRegNo);
          if (avatarFile) fd.append("avatar", avatarFile);
          const res = await api.post("/candidate/profile-update", fd);
          if (res.data?.user) setUser(res.data.user);
          break;
        }
        case "contact": {
          const fd = new FormData();
          fd.append("phone", phone); fd.append("alt_phone", altPhone);
          fd.append("present_address", presentAddress); fd.append("permanent_address", permanentAddress);
          fd.append("district", district); fd.append("division", division);
          fd.append("upazila", upazila); fd.append("union", unionName);
          fd.append("post_office", postOffice); fd.append("postal_code", postalCode);
          fd.append("email", email);
          await api.post("/candidate/profile-update", fd);
          break;
        }
        case "career": {
          const fd = new FormData();
          fd.append("career_objective", careerObjective);
          fd.append("current_profession", currentProfession);
          fd.append("expected_job_category", expectedJobCategory);
          fd.append("preferred_location", preferredLocation);
          fd.append("expected_salary", expectedSalary);
          fd.append("available_remote", String(availableRemote));
          fd.append("available_relocation", String(availableRelocation));
          await api.post("/candidate/profile-update", fd);
          break;
        }
        case "education": {
          const res = await api.post("/candidate/profile/educations", { educations });
          if (Array.isArray(res.data.educations)) setEducations(res.data.educations);
          break;
        }
        case "experience": {
          const res = await api.post("/candidate/profile/experiences", { experiences });
          if (Array.isArray(res.data.experiences)) setExperiences(res.data.experiences);
          break;
        }
        case "skills": {
          const fd = new FormData();
          fd.append("skills", JSON.stringify(skills.split(",").map((s) => s.trim()).filter(Boolean)));
          await api.post("/candidate/profile-update", fd); break;
        }
        case "languages": {
          const fd = new FormData();
          fd.append("language_proficiency", JSON.stringify(languages));
          await api.post("/candidate/profile-update", fd); break;
        }
        case "training": {
          const res = await api.post("/candidate/profile/trainings", { trainings });
          if (Array.isArray(res.data.trainings)) setTrainings(res.data.trainings);
          break;
        }
        case "certifications": {
          const fd = new FormData();
          fd.append("certifications", JSON.stringify(certifications.map(({ _cert_file, ...rest }) => rest)));
          certifications.forEach((c, i) => { if (c._cert_file) fd.append(`cert_file_${i}`, c._cert_file); });
          const res = await api.post("/candidate/profile/certifications", fd);
          if (Array.isArray(res.data.certifications)) setCertifications(res.data.certifications);
          break;
        }
        case "documents": {
          const toUpload = documents.filter((d) => d._file);
          if (toUpload.length > 0) {
            const results = await Promise.all(toUpload.map(async (d) => {
              const fd = new FormData();
              fd.append("type", d.type);
              fd.append("file", d._file!);
              const res = await api.post("/candidate/profile/documents", fd);
              return { type: d.type, path: res.data.path, url: res.data.url };
            }));
            const updatedDocs = documents.map((d) => {
              const r = results.find((x) => x.type === d.type);
              if (r) return { ...d, file_path: r.path, url: r.url, _file: undefined };
              return { ...d, _file: undefined };
            });
            setDocuments(updatedDocs);
          } else if (documents.length === 0) {
            throw new Error(isBn ? "কোনো ফাইল নেই" : "No files to upload");
          }
          break;
        }
        case "social": {
          const fd = new FormData();
          fd.append("linkedin_url", linkedinUrl); fd.append("github_url", githubUrl);
          fd.append("facebook_url", facebookUrl); fd.append("portfolio_url", portfolioUrl);
          fd.append("social_links", JSON.stringify({
            twitter_url: twitterUrl, instagram_url: instagramUrl,
            youtube_url: youtubeUrl, stackoverflow_url: stackoverflowUrl,
            whatsapp_url: whatsappUrl, telegram_url: telegramUrl,
          }));
          await api.post("/candidate/profile-update", fd); break;
        }
      }
      toast.success(isBn ? "সংরক্ষিত হয়েছে!" : "Saved!");
      window.dispatchEvent(new Event("candidate-profile-saved"));
      return true;
    } catch (error: any) {
      const data = error.response?.data;
      let msg = data?.message || "Failed to save";
      if (error.response?.status === 413) msg = isBn ? "ফাইল বড় (সর্বোচ্চ ৪০০KB)" : "File too large (max 400KB)";
      else if (error.response?.status === 422 && data?.errors) {
        const k = Object.keys(data.errors)[0];
        if (k) msg = Array.isArray(data.errors[k]) ? data.errors[k][0] : data.errors[k];
      }
      toast.error(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const isStepCompleted = (key: string): boolean => {
    const skillCount = skills.split(",").map((s) => s.trim()).filter(Boolean).length;
    switch (key) {
      case "personal":
        return Boolean(fullNameEn || fullNameBn) && Boolean(gender) && Boolean(dob);
      case "contact":
        return Boolean(phone) && Boolean(email) && Boolean(presentAddress) && Boolean(district);
      case "career":
        return Boolean(careerObjective) && Boolean(currentProfession);
      case "education":
        return educations.some((e) => e.level && e.institute_name);
      case "experience":
        return experiences.some((e) => e.company_name && e.designation);
      case "skills":
        return skillCount >= 1;
      case "languages":
        return languages.length > 0;
      case "training":
        return trainings.some((t) => t.title && t.institute_name);
      case "certifications":
        return certifications.length > 0;
      case "documents":
        return documents.length > 0;
      case "social":
        return [linkedinUrl, githubUrl, facebookUrl, portfolioUrl, twitterUrl, instagramUrl, youtubeUrl, stackoverflowUrl, whatsappUrl, telegramUrl].some(Boolean);
      default:
        return false;
    }
  };

  const getCompletedSteps = (): number[] =>
    STEPS_KEYS.map((key, i) => (isStepCompleted(key) ? i : -1)).filter((i) => i >= 0);

  const getCompletionPct = () => {
    const weights: Record<string, number> = {
      personal: 15, contact: 15, career: 10, education: 10, experience: 10,
      skills: 10, languages: 5, training: 5, certifications: 5, documents: 5, social: 10,
    };
    return Math.min(100, STEPS_KEYS.reduce((sum, key) => sum + (isStepCompleted(key) ? weights[key] : 0), 0));
  };

  return {
    loading, saving,
    handleSave: saveSection,
    avatarExisting,
    getCompletionPct,
    getCompletedSteps,
    // Personal
    fullNameBn, setFullNameBn, fullNameEn, setFullNameEn,
    fatherName, setFatherName, motherName, setMotherName,
    dob, setDob, gender, setGender,
    maritalStatus, setMaritalStatus, nationality, setNationality,
    nationalId, setNationalId, birthRegNo, setBirthRegNo,
    // Contact
    phone, setPhone, altPhone, setAltPhone, email, setEmail,
    presentAddress, setPresentAddress, permanentAddress, setPermanentAddress,
    district, setDistrict, division, setDivision,
    upazila, setUpazila, unionName, setUnionName,
    postOffice, setPostOffice, postalCode, setPostalCode,
    // Career
    careerObjective, setCareerObjective,
    currentProfession, setCurrentProfession,
    expectedJobCategory, setExpectedJobCategory,
    preferredLocation, setPreferredLocation,
    expectedSalary, setExpectedSalary,
    availableRemote, setAvailableRemote,
    availableRelocation, setAvailableRelocation,
    // Arrays
    educations, updateEducation, removeEducation, addEducation,
    experiences, updateExperience, removeExperience, addExperience,
    skills, setSkills,
    languages, toggleLanguage, updateLangProficiency,
    trainings, updateTraining, removeTraining, addTraining,
    certifications, updateCertification, removeCertification, addCertification, setCertFile,
    documents, setDocuments,
    // Social
    linkedinUrl, setLinkedinUrl, githubUrl, setGithubUrl,
    facebookUrl, setFacebookUrl, portfolioUrl, setPortfolioUrl,
    twitterUrl, setTwitterUrl, instagramUrl, setInstagramUrl,
    youtubeUrl, setYoutubeUrl, stackoverflowUrl, setStackoverflowUrl,
    whatsappUrl, setWhatsappUrl, telegramUrl, setTelegramUrl,
  };
}