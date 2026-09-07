"use client";

import { useState, useEffect, useCallback } from "react";

interface Personal {
  full_name: string;
  first_name: string;
  last_name: string;
  current_position: string;
  email: string;
  phone: string;
  alt_phone?: string;
  address: string;
  permanent_address?: string;
  zip_code: string;
  city: string;
  photo_url: string;
  dob: string;
  place_of_birth: string;
  driving_license: string;
  gender: string;
  nationality: string;
  marital_status: string;
  father_name?: string;
  mother_name?: string;
  religion?: string;
  blood_group?: string;
  nid?: string;
  linkedin: string;
  github: string;
  website: string;
  additional_info: string;
  signature_url?: string;
}

interface ResumeObjective {
  description: string;
}

interface Education {
  degree: string;
  field_of_study?: string;
  board?: string;
  grade?: string;
  city: string;
  school: string;
  start_date: string;
  end_date: string;
  description: string;
}

interface Interest {
  hobby: string;
}

interface Skill {
  skill: string;
  level: string;
}

interface WorkExperience {
  job_title: string;
  employment_type?: string;
  city: string;
  employer: string;
  start_date: string;
  end_date: string;
  is_current?: boolean;
  description: string;
}

interface Language {
  language: string;
  level: string;
}

interface Achievement {
  description: string;
}

interface CustomSection {
  title: string;
  description: string;
}

interface Reference {
  name: string;
  designation: string;
  organization: string;
  phone: string;
  email: string;
  relation?: string;
}

interface Training {
  title: string;
  institute: string;
  duration: string;
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
}

interface Project {
  name: string;
  description: string;
  url: string;
}

export interface ResumeData {
  personal: Personal;
  resume_objective: ResumeObjective;
  education: Education[];
  interests: Interest[];
  skills: Skill[];
  work_experience: WorkExperience[];
  languages: Language[];
  achievements: Achievement[];
  custom_sections: CustomSection[];
  references: Reference[];
  training: Training[];
  certifications: Certification[];
  projects: Project[];
  template_slug: string | null;
}

const EMPTY_PERSONAL: Personal = {
  full_name: "", first_name: "", last_name: "", current_position: "", email: "",
  phone: "", alt_phone: "", address: "", permanent_address: "", zip_code: "", city: "", photo_url: "",
  dob: "", place_of_birth: "", driving_license: "", gender: "",
  nationality: "Bangladeshi", marital_status: "", father_name: "", mother_name: "",
  religion: "", blood_group: "", nid: "", linkedin: "", github: "", website: "", additional_info: "",
  signature_url: "",
};

const STORAGE_KEY = "resume_wizard_data";

function getStoredData(): Partial<ResumeData> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function storeData(data: ResumeData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function useResumeWizard() {
  const [data, setData] = useState<ResumeData>({
    personal: { ...EMPTY_PERSONAL },
    resume_objective: { description: "" },
    education: [],
    interests: [],
    skills: [],
    work_experience: [],
    languages: [],
    achievements: [{ description: "" }],
    custom_sections: [],
    references: [],
    training: [],
    certifications: [],
    projects: [],
    template_slug: null,
  });

  const [step, setStep] = useState(1);
  const [activeExpView, setActiveExpView] = useState<"details" | "qualifications" | "extras">("details");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredData();
    if (stored) {
      setData((prev) => ({
        ...prev,
        ...stored,
        personal: { ...EMPTY_PERSONAL, ...(stored.personal || {}) },
      }));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) storeData(data);
  }, [data, loading]);

  const updatePersonal = useCallback((updates: Partial<Personal>) => {
    setData((prev) => ({ ...prev, personal: { ...prev.personal, ...updates } }));
  }, []);

  const setSectionData = useCallback(<K extends keyof ResumeData>(section: K, value: ResumeData[K]) => {
    setData((prev) => ({ ...prev, [section]: value }));
  }, []);

  const progress = Math.round(((step - 1 + (activeExpView === "qualifications" ? 0.5 : 0)) / 3) * 100);

  return {
    data, step, setStep, activeExpView, setActiveExpView,
    loading, updatePersonal, setSectionData, progress,
  };
}