// ============================================
// Core Types for Job Portal
// ============================================

export type UserRole = "candidate" | "employer" | "admin";

export interface ApiResponse<T = any> {
  status: boolean;
  message?: string;
  data?: T;
}

// Auth
export interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  role: UserRole;
  phone?: string;
  wallet_balance?: number;
  created_at?: string;
  [key: string]: any;
}

// Theme
export interface ThemeSettings {
  primary_color?: string;
  accent_color?: string;
  [key: string]: any;
}

// CV Profile
export interface PersonalInfo {
  full_name: string;
  title?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
  date_of_birth?: string;
  nationality?: string;
  photo_url?: string;
  father_name?: string;
  mother_name?: string;
  gender?: string;
  marital_status?: string;
  religion?: string;
  blood_group?: string;
  postal_code?: string;
  [key: string]: any;
}

export interface Experience {
  id?: string | number;
  company: string;
  position: string;
  location?: string;
  department?: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
  achievements?: string[];
  [key: string]: any;
}

export interface Education {
  id?: string | number;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date: string;
  end_date?: string;
  grade?: string;
  description?: string;
  registration_number?: string;
  [key: string]: any;
}

export interface Project {
  id?: string | number;
  name: string;
  description?: string;
  url?: string;
  technologies?: string[];
  supervisor?: string;
  start_date?: string;
  end_date?: string;
  [key: string]: any;
}

export interface CvProfile {
  id?: number;
  personal_info: PersonalInfo;
  experiences?: Experience[];
  educations?: Education[];
  projects?: Project[];
  skills?: (string | { name: string; level?: string | null; category?: string | null })[];
  languages?: { name: string; proficiency: string }[];
  certifications?: { name: string; issuer: string; date: string }[];
  references?: { name: string; designation?: string; organization?: string; phone?: string; email?: string }[];
  training?: { institute: string; title: string; duration?: string }[];
  [key: string]: any;
}

// ─── Comprehensive Candidate Profile Types ───

export interface CandidateEducationEntry {
  id?: number;
  level: string; // ssc, hsc, graduation, post_graduation
  board?: string;
  group_or_subject?: string;
  degree_name?: string;
  institute_name?: string;
  passing_year?: number;
  gpa_or_cgpa?: number;
  order?: number;
}

export interface CandidateExperienceEntry {
  id?: number;
  company_name: string;
  designation: string;
  employment_type?: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  responsibilities?: string;
  salary?: string;
  order?: number;
}

export interface CandidateTrainingEntry {
  id?: number;
  title: string;
  institute_name?: string;
  duration?: string;
  year?: number;
  certificate_path?: string;
}

export interface CandidateCertificationEntry {
  id?: number;
  name: string;
  organization?: string;
  issue_date?: string;
  expiry_date?: string;
  certificate_path?: string;
}

export interface CandidateReferenceEntry {
  id?: number;
  name: string;
  designation?: string;
  organization?: string;
  phone?: string;
  email?: string;
}

export interface CandidateDocumentEntry {
  id?: number;
  type: string; // cv, nid_front, nid_back, passport, academic_cert, experience_cert, photo
  label?: string;
  file_path: string;
  url?: string;
  _file?: File;
}

export interface LanguageProficiency {
  name: string;
  read: boolean;
  write: boolean;
  speak: boolean;
}

// CV Templates
export interface CvTemplate {
  id: number;
  name: string;
  slug: string;
  category: string;
  is_premium: boolean;
  price?: number;
  thumbnail?: string;
  preview_image_path?: string;
  description?: string;
  is_ats_friendly?: boolean;
  is_active?: boolean;
  is_featured?: boolean;
  ats_compatible?: boolean;
  [key: string]: any;
}

// Resume
export interface Resume {
  uuid: string;
  title: string;
  template_slug?: string;
  template_name?: string;
  status?: string;
  is_public?: boolean;
  share_url?: string;
  created_at: string;
  updated_at?: string;
  [key: string]: any;
}

// CV Credit Balance
export interface CvCreditBalance {
  balance: number;
  cv_generate_cost: number;
  cv_edit_cost: number;
}

// Subscription & Plans
export interface Plan {
  id: number;
  name: string;
  slug?: string;
  price: number;
  currency?: string;
  billing_cycle: string;
  is_popular?: boolean;
  features?: { id: string | number; name: string; value?: any }[];
  features_mapped?: Record<string, any>;
  [key: string]: any;
}

export interface Subscription {
  id: number;
  plan_id: number;
  plan_name?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  [key: string]: any;
}

// Wallet
export interface Wallet {
  balance: number;
  currency?: string;
}

export interface DepositMethod {
  id: number;
  name: string;
  display_name?: string;
  percent_charge?: number;
  [key: string]: any;
}

// Jobs
export interface JobCompany {
  id?: number;
  name?: string;
  logo?: string;
  slug?: string;
  description?: string;
  location?: string;
  trust_score?: number;
  industry?: string;
  size?: string;
  is_verified?: boolean;
}

export interface Job {
  id: number;
  title: string;
  company?: string | JobCompany;
  company_name?: string;
  location?: string;
  description?: string;
  salary_min?: number;
  salary_max?: number;
  job_type?: string;
  category?: string | { id?: number; name?: string };
  is_remote?: boolean;
  is_active?: boolean;
  created_at?: string;
  [key: string]: any;
}

export interface JobApplication {
  id: number;
  job_id: number;
  candidate_id?: number;
  status?: string;
  applied_at?: string;
  [key: string]: any;
}

export interface SearchFilters {
  query?: string;
  location?: string;
  job_type?: string;
  min_salary?: number;
  max_salary?: number;
  is_remote?: boolean;
  [key: string]: any;
}

// Companies
export interface Company {
  id: number;
  name: string;
  slug?: string;
  logo?: string;
  description?: string;
  industry?: string;
  website?: string;
  location?: string;
  size?: string;
  cover_image?: string;
  cover_photo?: string;
  founded_year?: number;
  is_verified?: boolean;
  is_featured?: boolean;
  rating?: number;
  reviews_count?: number;
  followers_count?: number;
  user_id?: number;
  active_jobs_count?: number;
  jobs_count?: number;
  jobs?: CompanyJob[];
  // Social
  facebook?: string;
  linkedin?: string;
  youtube_channel?: string;
  instagram_profile?: string;
  // About section
  mission?: string;
  vision?: string;
  values?: string;
  why_join_us?: string[] | { benefits?: string[] };
  services_products?: string;
  working_culture?: string;
  head_office_address?: string;
  address_postal_code?: string;
  top_skills?: string[];
  highlights?: string[];
}

export interface CompanyJob {
  id: number;
  title: string;
  location?: string;
  job_type?: string;
  salary_min?: number;
  salary_max?: number;
  created_at?: string;
}

export interface CompanyReview {
  id: number;
  user_id: number;
  company_id: number;
  rating: number;
  rating_work_culture?: number;
  rating_salary?: number;
  rating_management?: number;
  rating_growth?: number;
  rating_work_life_balance?: number;
  comment: string;
  is_anonymous: boolean;
  status: string;
  user?: User;
  created_at: string;
  [key: string]: any;
}

// Messages
export interface Message {
  id: number;
  sender_id?: number;
  receiver_id?: number;
  content: string;
  is_read?: boolean;
  created_at?: string;
  [key: string]: any;
}

export interface Conversation {
  id: number;
  participant?: User;
  last_message?: Message;
  unread_count?: number;
  updated_at?: string;
  [key: string]: any;
}

// Notifications
export interface Notification {
  id: number;
  type?: string;
  title?: string;
  message?: string;
  is_read?: boolean;
  created_at?: string;
  [key: string]: any;
}

// Pagination
export interface PaginatedResponse<T = any> {
  data: T[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

export interface Interview {
  id: number;
  job_id: number;
  application_id: number;
  employer_id: number;
  candidate_id: number;
  type: "in_person" | "video" | "phone";
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  notes: string | null;
  candidate_response: "pending" | "accepted" | "declined";
  candidate_note: string | null;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  outcome: string | null;
  created_at: string;
  updated_at: string;
  job?: { id: number; title: string; company_id?: number };
  candidate?: User;
  employer?: User;
  application?: JobApplication;
}
