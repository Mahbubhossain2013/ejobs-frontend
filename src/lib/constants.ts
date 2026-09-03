export const FEATURE_LABELS: Record<string, (isBn: boolean) => string> = {
  // Candidate features (by slug/key)
  job_applications_limit: (b) => b ? "চাকরি আবেদন" : "Job Applications",
  ai_chat_messages: (b) => b ? "AI চ্যাট" : "AI Chat Messages",
  ai_cover_letters: (b) => b ? "AI কভার লেটার" : "AI Cover Letters",
  ai_resume_score: (b) => b ? "AI সিভি স্কোর" : "AI Resume Score",
  cv_templates: (b) => b ? "সিভি টেমপ্লেট" : "CV Templates",
  job_boost: (b) => b ? "চাকরি বুস্ট" : "Job Boost",
  priority_support: (b) => b ? "অগ্রাধিকার সাপোর্ট" : "Priority Support",
  featured_profile: (b) => b ? "বৈশিষ্ট্যযুক্ত প্রোফাইল" : "Featured Profile",
  unlimited_applications: (b) => b ? "অসীমিত আবেদন" : "Unlimited Applications",
  featured_freelancer: (b) => b ? "বৈশিষ্ট্যযুক্ত ফ্রিল্যান্সার" : "Featured Freelancer",

  // Employer features (by slug/key)
  job_posts: (b) => b ? "চাকরি পোস্ট" : "Job Posts",
  ai_career_tools: (b) => b ? "এআই ক্যারিয়ার টুলস" : "AI Career Tools",
  candidate_database_access: (b) => b ? "ক্যান্ডিডেট ডাটাবেস" : "Candidate Database",
  job_boosts: (b) => b ? "চাকরি বুস্ট" : "Job Boosts",
  promoted_listings: (b) => b ? "প্রমোটেড লিস্টিং" : "Promoted Listings",
  messages_per_day: (b) => b ? "বার্তা / দিন" : "Messages / Day",
  ai_resume_scoring: (b) => b ? "এআই রিজিউম স্কোরিং" : "AI Resume Scoring",
  ai_job_descriptions: (b) => b ? "এআই চাকরি বর্ণনা" : "AI Job Descriptions",

  // Shared features (by display name from API)
  "AI Career Tools": (b) => b ? "এআই ক্যারিয়ার টুলস" : "AI Career Tools",
  "Premium Cv Templates": (b) => b ? "প্রিমিয়াম সিভি টেমপ্লেট" : "Premium CV Templates",
  "Profile Boosting": (b) => b ? "প্রোফাইল বুস্টিং" : "Profile Boosting",
  "Advanced Analytics": (b) => b ? "অ্যাডভান্সড অ্যানালিটিক্স" : "Advanced Analytics",
  "Job Applications": (b) => b ? "চাকরি আবেদন" : "Job Applications",
  "Featured Freelancer": (b) => b ? "বৈশিষ্ট্যযুক্ত ফ্রিল্যান্সার" : "Featured Freelancer",
  "Ai Cv Builder": (b) => b ? "এআই সিভি বিল্ডার" : "AI CV Builder",
  "AI CV Builder": (b) => b ? "এআই সিভি বিল্ডার" : "AI CV Builder",
  "Ai Skill Assessment": (b) => b ? "এআই স্কিল অ্যাসেসমেন্ট" : "AI Skill Assessment",
  "AI Skill Assessment": (b) => b ? "এআই স্কিল অ্যাসেসমেন্ট" : "AI Skill Assessment",
  "Certificate Generation": (b) => b ? "সার্টিফিকেট জেনারেশন" : "Certificate Generation",
  "AI Interview Prep": (b) => b ? "এআই ইন্টারভিউ প্রিপ" : "AI Interview Prep",
  "AI Cover Letters": (b) => b ? "এআই কভার লেটার" : "AI Cover Letters",
  "AI Resume Score": (b) => b ? "এআই রিজিউম স্কোর" : "AI Resume Score",
  "CV Templates": (b) => b ? "সিভি টেমপ্লেট" : "CV Templates",
  "Priority Support": (b) => b ? "অগ্রাধিকার সাপোর্ট" : "Priority Support",
  "Featured Profile": (b) => b ? "বৈশিষ্ট্যযুক্ত প্রোফাইল" : "Featured Profile",
  "Job Boost": (b) => b ? "চাকরি বুস্ট" : "Job Boost",
  "Job Posts": (b) => b ? "চাকরি পোস্ট" : "Job Posts",
  "Candidate Database": (b) => b ? "ক্যান্ডিডেট ডাটাবেস" : "Candidate Database",
  "Promoted Listings": (b) => b ? "প্রমোটেড লিস্টিং" : "Promoted Listings",
  "Messages / Day": (b) => b ? "বার্তা / দিন" : "Messages / Day",
  "AI Resume Scoring": (b) => b ? "এআই রিজিউম স্কোরিং" : "AI Resume Scoring",
  "AI Job Descriptions": (b) => b ? "এআই চাকরি বর্ণনা" : "AI Job Descriptions",
  "Unlimited Applications": (b) => b ? "অসীমিত আবেদন" : "Unlimited Applications",
};

export const QUOTA_FEATURE_LABELS: Record<string, (isBn: boolean) => string> = {
  job_applications_limit: (b) => b ? "চাকরি আবেদন" : "Job Applications",
  ai_chat_messages: (b) => b ? "AI চ্যাট" : "AI Chat Messages",
  ai_cover_letters: (b) => b ? "AI কভার লেটার" : "AI Cover Letters",
  ai_resume_score: (b) => b ? "AI সিভি স্কোর" : "AI Resume Score",
  cv_templates: (b) => b ? "সিভি টেমপ্লেট" : "CV Templates",
  job_boost: (b) => b ? "চাকরি বুস্ট" : "Job Boost",
  certificate_generation: (b) => b ? "সার্টিফিকেট জেনারেশন" : "Certificate Generation",
  ai_skill_assessment: (b) => b ? "AI স্কিল অ্যাসেসমেন্ট" : "AI Skill Assessment",
  ai_interview_prep: (b) => b ? "AI ইন্টারভিউ প্রিপ" : "AI Interview Prep",
  ai_cv_builder: (b) => b ? "AI CV Builder" : "AI CV Builder",
  job_posts: (b) => b ? "চাকরি পোস্ট" : "Job Posts",
  ai_career_tools: (b) => b ? "এআই ক্যারিয়ার টুলস" : "AI Career Tools",
  candidate_database_access: (b) => b ? "ক্যান্ডিডেট ডাটাবেস" : "Candidate Database",
  job_boosts: (b) => b ? "চাকরি বুস্ট" : "Job Boosts",
  promoted_listings: (b) => b ? "প্রমোটেড লিস্টিং" : "Promoted Listings",
  messages_per_day: (b) => b ? "বার্তা / দিন" : "Messages / Day",
  ai_resume_scoring: (b) => b ? "এআই রিজিউম স্কোরিং" : "AI Resume Scoring",
  ai_job_descriptions: (b) => b ? "এআই চাকরি বর্ণনা" : "AI Job Descriptions",
};

export type PlanButtonAction = "current" | "upgrade" | "downgrade" | "subscribe" | "login";

export interface PlanButtonState {
  label: string;
  disabled: boolean;
  variant: "default" | "outline" | "ghost" | "destructive" | "secondary";
  action: PlanButtonAction;
}
