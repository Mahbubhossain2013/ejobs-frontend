import { User, Briefcase, GraduationCap, Zap, Award, Languages, Code, Star, Heart, Globe, Users, BookOpen } from "lucide-react";

export const RESUME_STORAGE_KEY = "user_resumes";

export const TEMPLATE_GRADIENTS = [
  "from-blue-600 to-indigo-700",
  "from-emerald-500 to-teal-600",
  "from-orange-400 to-red-500",
  "from-pink-500 to-rose-600",
  "from-cyan-400 to-blue-500",
  "from-violet-500 to-purple-600",
  "from-amber-400 to-orange-500",
  "from-teal-400 to-emerald-500",
];

export const CV_SECTIONS = [
  { key: "personal", label_en: "Personal Details", label_bn: "ব্যক্তিগত তথ্য", icon: User },
  { key: "experience", label_en: "Work Experience", label_bn: "কাজের অভিজ্ঞতা", icon: Briefcase },
  { key: "education", label_en: "Education", label_bn: "শিক্ষা", icon: GraduationCap },
  { key: "skills", label_en: "Key Skills", label_bn: "মূল দক্ষতা", icon: Zap },
  { key: "certifications", label_en: "Certifications", label_bn: "সার্টিফিকেশন", icon: Award },
  { key: "languages", label_en: "Languages", label_bn: "ভাষা", icon: Languages },
  { key: "projects", label_en: "Projects", label_bn: "প্রকল্প", icon: Code },
  { key: "awards", label_en: "Awards & Honors", label_bn: "পুরস্কার", icon: Star },
  { key: "hobbies", label_en: "Hobbies & Interests", label_bn: "শখ ও আগ্রহ", icon: Heart },
  { key: "social_links", label_en: "Social Links", label_bn: "সামাজিক সংযোগ", icon: Globe },
  { key: "references", label_en: "References", label_bn: "রেফারেন্স", icon: Users },
  { key: "training", label_en: "Training", label_bn: "প্রশিক্ষণ", icon: BookOpen },
];

export const FAQ_ITEMS = [
  {
    q_en: "What is the CV Builder?",
    q_bn: "সিভি বিল্ডার কী?",
    a_en: "Our CV Builder is a professional resume creation tool that helps you build a polished, ATS-friendly CV using pre-designed templates. You can fill in your details through an easy form interface and see a live preview as you type.",
    a_bn: "আমাদের সিভি বিল্ডার একটি পেশাদার রিজিউমে তৈরির সরঞ্জাম যা আপনাকে পূর্ব-নকশা করা টেমপ্লেট ব্যবহার করে একটি পরিষ্কার, ATS-বান্ধব CV তৈরি করতে সাহায্য করে।",
  },
  {
    q_en: "Are these templates ATS-friendly?",
    q_bn: "এই টেমপ্লেটগুলো কি ATS-বান্ধব?",
    a_en: "Yes! Most of our templates are designed to be ATS (Applicant Tracking System) friendly. They use clean HTML structures that parsing software can easily read, ensuring your CV gets through automated screening.",
    a_bn: "হ্যাঁ! আমাদের বেশিরভাগ টেমপ্লেট ATS (Applicant Tracking System) বান্ধব হিসেবে ডিজাইন করা হয়েছে।",
  },
  {
    q_en: "Can I download my CV as PDF?",
    q_bn: "আমি কি আমার CV PDF হিসেবে ডাউনলোড করতে পারি?",
    a_en: "Absolutely! Once you've filled in your details and chosen a template, you can download your CV as a high-quality PDF file ready to send to employers.",
    a_bn: "অবশ্যই! আপনার তথ্য পূরণ করা ও টেমপ্লেট বাছাই করার পর, আপনি আপনার CV একটি উচ্চ মানের PDF ফাইল হিসেবে ডাউনলোড করতে পারবেন।",
  },
  {
    q_en: "Is the AI CV generation free?",
    q_bn: "AI CV জেনারেশন কি বিনামূল্যে?",
    a_en: "AI CV generation uses your plan's AI quota. Free plans get limited AI usage, while premium plans include more AI-powered features including CV generation, cover letters, and career coaching.",
    a_bn: "AI CV জেনারেশন আপনার প্ল্যানের AI কোটা ব্যবহার করে।",
  },
];
