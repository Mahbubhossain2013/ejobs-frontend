"use client";

import PersonalSectionForm from "./sections/PersonalSectionForm";
import ExperienceSectionForm from "./sections/ExperienceSectionForm";
import EducationSectionForm from "./sections/EducationSectionForm";
import SkillsSectionForm from "./sections/SkillsSectionForm";
import CertificationsSectionForm from "./sections/CertificationsSectionForm";
import LanguagesSectionForm from "./sections/LanguagesSectionForm";
import ProjectsSectionForm from "./sections/ProjectsSectionForm";
import AwardsSectionForm from "./sections/AwardsSectionForm";
import HobbiesSectionForm from "./sections/HobbiesSectionForm";
import SocialSectionForm from "./sections/SocialSectionForm";
import ReferencesSectionForm from "./sections/ReferencesSectionForm";
import TrainingSectionForm from "./sections/TrainingSectionForm";

export default function SectionForm({ section, data, onChange, isBn }: { section: string; data: any; onChange: (d: any) => void; isBn: boolean }) {
  switch (section) {
    case "personal":        return <PersonalSectionForm data={data || {}} onChange={onChange} isBn={isBn} />;
    case "experience":      return <ExperienceSectionForm data={data || []} onChange={onChange} isBn={isBn} />;
    case "education":       return <EducationSectionForm data={data || []} onChange={onChange} isBn={isBn} />;
    case "skills":          return <SkillsSectionForm data={data || []} onChange={onChange} isBn={isBn} />;
    case "certifications":  return <CertificationsSectionForm data={data || []} onChange={onChange} isBn={isBn} />;
    case "languages":       return <LanguagesSectionForm data={data || []} onChange={onChange} isBn={isBn} />;
    case "projects":        return <ProjectsSectionForm data={data || []} onChange={onChange} isBn={isBn} />;
    case "awards":          return <AwardsSectionForm data={data || []} onChange={onChange} isBn={isBn} />;
    case "hobbies":         return <HobbiesSectionForm data={data || []} onChange={onChange} isBn={isBn} />;
    case "social_links":    return <SocialSectionForm data={data || {}} onChange={onChange} isBn={isBn} />;
    case "references":      return <ReferencesSectionForm data={data || []} onChange={onChange} isBn={isBn} />;
    case "training":        return <TrainingSectionForm data={data || []} onChange={onChange} isBn={isBn} />;
    default:                return <p className="text-sm text-muted-foreground">{isBn ? "এই সেকশনটি শীঘ্রই আসছে..." : "Coming soon..."}</p>;
  }
}