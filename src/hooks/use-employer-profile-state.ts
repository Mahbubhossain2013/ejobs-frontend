"use client";

import { useState, useEffect } from "react";
import { useEmployerCompany } from "./use-employer-company";

export function useEmployerProfileState() {
  const { company: hookCompany, loading: hookLoading } = useEmployerCompany();

  const [companyName, setCompanyName] = useState("");
  const [companyNameBn, setCompanyNameBn] = useState("");
  const [tagline, setTagline] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [industry, setIndustry] = useState("");
  const [businessRegNo, setBusinessRegNo] = useState("");
  const [tradeLicenseNo, setTradeLicenseNo] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");

  const [contactPerson, setContactPerson] = useState("");
  const [contactDesignation, setContactDesignation] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactAltPhone, setContactAltPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [website, setWebsite] = useState("");

  const [headOffice, setHeadOffice] = useState("");
  const [country, setCountry] = useState("Bangladesh");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [googleMap, setGoogleMap] = useState("");

  const [mission, setMission] = useState("");
  const [vision, setVision] = useState("");
  const [values, setValues] = useState("");
  const [servicesProducts, setServicesProducts] = useState("");
  const [workingCulture, setWorkingCulture] = useState("");
  const [whyJoinUs, setWhyJoinUs] = useState<string[]>([]);
  const [topSkills, setTopSkills] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);

  const [hrName, setHrName] = useState("");
  const [hrPhone, setHrPhone] = useState("");
  const [hrEmail, setHrEmail] = useState("");
  const [recruitmentPolicy, setRecruitmentPolicy] = useState("");
  const [hiringProcess, setHiringProcess] = useState("");

  const [allowJobPosting, setAllowJobPosting] = useState(true);
  const [postingLimit, setPostingLimit] = useState("");
  const [featuredAllowed, setFeaturedAllowed] = useState(false);
  const [autoApproval, setAutoApproval] = useState(false);
  const [expiryDays, setExpiryDays] = useState("30");

  const [tradeLicenseFile, setTradeLicenseFile] = useState<File | null>(null);
  const [nidFile, setNidFile] = useState<File | null>(null);
  const [regCertFile, setRegCertFile] = useState<File | null>(null);
  const [tinNumber, setTinNumber] = useState("");
  const [tradeLicensePath, setTradeLicensePath] = useState("");
  const [nidPath, setNidPath] = useState("");
  const [regCertPath, setRegCertPath] = useState("");

  const [videoUrl, setVideoUrl] = useState("");
  const [youtubeChannel, setYoutubeChannel] = useState("");
  const [instagramProfile, setInstagramProfile] = useState("");

  const [facebookPage, setFacebookPage] = useState("");
  const [linkedinPage, setLinkedinPage] = useState("");

  const [hrTeam, setHrTeam] = useState<{ name: string; email: string; phone: string; designation: string }[]>([]);

  useEffect(() => {
    if (hookLoading || !hookCompany) return;
    const c = hookCompany;
    setCompanyName(c.name || "");
    setCompanyNameBn(c.name_bn || "");
    setTagline(c.tagline || "");
    setCompanyType(c.company_type || "");
    setIndustry(c.industry || "");
    setBusinessRegNo(c.business_registration_number || "");
    setTradeLicenseNo(c.trade_license_number || "");
    setFoundedYear(c.founded_year || "");
    setCompanySize(c.size || "");
    setEmployeeCount(c.employee_count || "");
    setDescription(c.description || "");
    setLogoPreview(c.logo || "");
    setCoverPreview(c.cover_photo || "");
    setContactPerson(c.contact_person_name || "");
    setContactDesignation(c.contact_person_designation || "");
    setContactPhone(c.contact_phone || "");
    setContactAltPhone(c.contact_alt_phone || "");
    setContactEmail(c.contact_email || "");
    setWebsite(c.website || "");
    setFacebookPage(c.facebook || "");
    setLinkedinPage(c.linkedin || "");
    setHeadOffice(c.head_office_address || c.location || "");
    setCountry(c.address_country || "Bangladesh");
    setDivision(c.address_division || "");
    setDistrict(c.address_district || "");
    setPostalCode(c.address_postal_code || "");
    setGoogleMap(c.google_map_embed || "");
    setMission(c.mission || "");
    setVision(c.vision || "");
    setValues(c.values || "");
    setServicesProducts(c.services_products || "");
    setWorkingCulture(c.working_culture || "");
    const wju = c.why_join_us;
    if (Array.isArray(wju)) setWhyJoinUs(wju);
    else if (wju?.benefits && Array.isArray(wju.benefits)) setWhyJoinUs(wju.benefits);
    else setWhyJoinUs([]);
    setTopSkills(Array.isArray(c.top_skills) ? c.top_skills : []);
    setHighlights(Array.isArray(c.highlights) ? c.highlights : []);
    setHrName(c.hr_manager_name || "");
    setHrPhone(c.hr_contact_number || "");
    setHrEmail(c.hr_email || "");
    setRecruitmentPolicy(c.recruitment_policy || "");
    setHiringProcess(c.hiring_process || "");
    setAllowJobPosting(c.allow_job_posting !== false);
    setPostingLimit(c.job_posting_limit_monthly || "");
    setFeaturedAllowed(c.featured_job_allowed || false);
    setAutoApproval(c.auto_approval || false);
    setExpiryDays(String(c.job_expiry_days || 30));
    setTinNumber(c.tin_number || "");
    setTradeLicensePath(c.trade_license_document || "");
    setNidPath(c.nid_document || "");
    setRegCertPath(c.registration_certificate || "");
    setVideoUrl(c.company_video_url || "");
    setYoutubeChannel(c.youtube_channel || "");
    setInstagramProfile(c.instagram_profile || "");
    if (c.hr_team && Array.isArray(c.hr_team)) {
      setHrTeam(c.hr_team.map((h: any) => ({
        name: h.name || "",
        email: h.email || "",
        phone: h.phone || "",
        designation: h.designation || "recruiter",
      })));
    }
  }, [hookCompany, hookLoading]);

  const buildFormData = (): FormData => {
    const fd = new FormData();
    fd.append("company_name", companyName);
    fd.append("name_bn", companyNameBn);
    fd.append("tagline", tagline);
    fd.append("company_type", companyType);
    fd.append("industry", industry);
    fd.append("business_registration_number", businessRegNo);
    fd.append("trade_license_number", tradeLicenseNo);
    fd.append("founded_year", foundedYear);
    fd.append("size", companySize);
    fd.append("employee_count", employeeCount);
    fd.append("description", description);
    fd.append("contact_person_name", contactPerson);
    fd.append("contact_person_designation", contactDesignation);
    fd.append("contact_phone", contactPhone);
    fd.append("contact_alt_phone", contactAltPhone);
    fd.append("contact_email", contactEmail);
    fd.append("website", website);
    fd.append("facebook", facebookPage);
    fd.append("linkedin", linkedinPage);
    fd.append("head_office_address", headOffice);
    fd.append("address_country", country);
    fd.append("address_division", division);
    fd.append("address_district", district);
    fd.append("address_postal_code", postalCode);
    fd.append("google_map_embed", googleMap);
    fd.append("location", headOffice);
    fd.append("mission", mission);
    fd.append("vision", vision);
    fd.append("values", values);
    fd.append("services_products", servicesProducts);
    fd.append("working_culture", workingCulture);
    fd.append("why_join_us", JSON.stringify(whyJoinUs));
    fd.append("top_skills", JSON.stringify(topSkills));
    fd.append("highlights", JSON.stringify(highlights));
    fd.append("city", district);
    fd.append("hr_manager_name", hrName);
    fd.append("hr_contact_number", hrPhone);
    fd.append("hr_email", hrEmail);
    fd.append("recruitment_policy", recruitmentPolicy);
    fd.append("hiring_process", hiringProcess);
    fd.append("allow_job_posting", String(allowJobPosting));
    fd.append("job_posting_limit_monthly", postingLimit);
    fd.append("featured_job_allowed", String(featuredAllowed));
    fd.append("auto_approval", String(autoApproval));
    fd.append("job_expiry_days", expiryDays);
    fd.append("tin_number", tinNumber);
    fd.append("company_video_url", videoUrl);
    fd.append("youtube_channel", youtubeChannel);
    fd.append("instagram_profile", instagramProfile);
    if (logoFile) fd.append("logo", logoFile);
    if (coverFile) fd.append("cover_photo", coverFile);
    if (tradeLicenseFile) fd.append("trade_license_document", tradeLicenseFile);
    if (nidFile) fd.append("nid_document", nidFile);
    if (regCertFile) fd.append("registration_certificate", regCertFile);
    return fd;
  };

  return {
    companyName, setCompanyName,
    companyNameBn, setCompanyNameBn,
    tagline, setTagline,
    companyType, setCompanyType,
    industry, setIndustry,
    businessRegNo, setBusinessRegNo,
    tradeLicenseNo, setTradeLicenseNo,
    foundedYear, setFoundedYear,
    companySize, setCompanySize,
    employeeCount, setEmployeeCount,
    description, setDescription,
    logoFile, setLogoFile, logoPreview, setLogoPreview,
    coverFile, setCoverFile, coverPreview, setCoverPreview,
    contactPerson, setContactPerson,
    contactDesignation, setContactDesignation,
    contactPhone, setContactPhone,
    contactAltPhone, setContactAltPhone,
    contactEmail, setContactEmail,
    website, setWebsite,
    headOffice, setHeadOffice,
    country, setCountry,
    division, setDivision,
    district, setDistrict,
    postalCode, setPostalCode,
    googleMap, setGoogleMap,
    mission, setMission,
    vision, setVision,
    values, setValues,
    servicesProducts, setServicesProducts,
    workingCulture, setWorkingCulture,
    whyJoinUs, setWhyJoinUs,
    topSkills, setTopSkills,
    highlights, setHighlights,
    hrName, setHrName,
    hrPhone, setHrPhone,
    hrEmail, setHrEmail,
    recruitmentPolicy, setRecruitmentPolicy,
    hiringProcess, setHiringProcess,
    allowJobPosting, setAllowJobPosting,
    postingLimit, setPostingLimit,
    featuredAllowed, setFeaturedAllowed,
    autoApproval, setAutoApproval,
    expiryDays, setExpiryDays,
    tradeLicenseFile, setTradeLicenseFile,
    nidFile, setNidFile,
    regCertFile, setRegCertFile,
    tinNumber, setTinNumber,
    tradeLicensePath, nidPath, regCertPath,
    videoUrl, setVideoUrl,
    youtubeChannel, setYoutubeChannel,
    instagramProfile, setInstagramProfile,
    facebookPage, setFacebookPage,
    linkedinPage, setLinkedinPage,
    hrTeam, setHrTeam,
    buildFormData,
  };
}
