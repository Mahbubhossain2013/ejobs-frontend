export const COMPANY_TYPES = ["Private", "Government", "NGO", "Startup", "Multinational", "Sole Proprietorship", "Partnership", "Public Limited"];
export const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5000+"];
export const HR_DESIGNATIONS = [
  { value: "admin", label: "Admin" },
  { value: "hr_manager", label: "HR Manager" },
  { value: "recruiter", label: "Recruiter" },
];

export interface ProfileState {
  companyName: string; setCompanyName: (v: string) => void;
  companyNameBn: string; setCompanyNameBn: (v: string) => void;
  tagline: string; setTagline: (v: string) => void;
  companyType: string; setCompanyType: (v: string) => void;
  industry: string; setIndustry: (v: string) => void;
  businessRegNo: string; setBusinessRegNo: (v: string) => void;
  tradeLicenseNo: string; setTradeLicenseNo: (v: string) => void;
  foundedYear: string; setFoundedYear: (v: string) => void;
  companySize: string; setCompanySize: (v: string) => void;
  employeeCount: string; setEmployeeCount: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  logoFile: File | null; setLogoFile: (f: File | null) => void;
  logoPreview: string; setLogoPreview: (v: string) => void;
  coverFile: File | null; setCoverFile: (f: File | null) => void;
  coverPreview: string; setCoverPreview: (v: string) => void;

  contactPerson: string; setContactPerson: (v: string) => void;
  contactDesignation: string; setContactDesignation: (v: string) => void;
  contactPhone: string; setContactPhone: (v: string) => void;
  contactAltPhone: string; setContactAltPhone: (v: string) => void;
  contactEmail: string; setContactEmail: (v: string) => void;
  website: string; setWebsite: (v: string) => void;

  headOffice: string; setHeadOffice: (v: string) => void;
  country: string; setCountry: (v: string) => void;
  division: string; setDivision: (v: string) => void;
  district: string; setDistrict: (v: string) => void;
  postalCode: string; setPostalCode: (v: string) => void;
  googleMap: string; setGoogleMap: (v: string) => void;

  mission: string; setMission: (v: string) => void;
  vision: string; setVision: (v: string) => void;
  values: string; setValues: (v: string) => void;
  servicesProducts: string; setServicesProducts: (v: string) => void;
  workingCulture: string; setWorkingCulture: (v: string) => void;
  whyJoinUs: string[]; setWhyJoinUs: (v: string[]) => void;
  whyJoinUsInput: string; setWhyJoinUsInput: (v: string) => void;
  topSkills: string[]; setTopSkills: (v: string[]) => void;
  topSkillsInput: string; setTopSkillsInput: (v: string) => void;
  highlights: string[]; setHighlights: (v: string[]) => void;
  highlightsInput: string; setHighlightsInput: (v: string) => void;

  hrName: string; setHrName: (v: string) => void;
  hrPhone: string; setHrPhone: (v: string) => void;
  hrEmail: string; setHrEmail: (v: string) => void;
  recruitmentPolicy: string; setRecruitmentPolicy: (v: string) => void;
  hiringProcess: string; setHiringProcess: (v: string) => void;

  allowJobPosting: boolean; setAllowJobPosting: (v: boolean) => void;
  postingLimit: string; setPostingLimit: (v: string) => void;
  featuredAllowed: boolean; setFeaturedAllowed: (v: boolean) => void;
  autoApproval: boolean; setAutoApproval: (v: boolean) => void;
  expiryDays: string; setExpiryDays: (v: string) => void;

  tradeLicenseFile: File | null; setTradeLicenseFile: (f: File | null) => void;
  nidFile: File | null; setNidFile: (f: File | null) => void;
  regCertFile: File | null; setRegCertFile: (f: File | null) => void;
  tinNumber: string; setTinNumber: (v: string) => void;
  tradeLicensePath: string; nidPath: string; regCertPath: string;

  videoUrl: string; setVideoUrl: (v: string) => void;
  youtubeChannel: string; setYoutubeChannel: (v: string) => void;
  instagramProfile: string; setInstagramProfile: (v: string) => void;

  facebookPage: string; setFacebookPage: (v: string) => void;
  linkedinPage: string; setLinkedinPage: (v: string) => void;
}