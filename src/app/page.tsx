"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useThemeStore } from "@/store/theme-store";
import { useTheme as useNextTheme } from "next-themes";
import api from "@/lib/api-client";
import { getStorageUrl, formatCurrency } from "@/lib/utils";
import PublicLayout from "@/components/layout/PublicLayout";
import { useHomepageData } from "@/hooks/use-homepage-data";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  MapPin,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Building2,
  Users,
  BellRing,
  Star,
  Sparkles,
  Layers,
  ArrowRight,
  MonitorPlay,
  FileText,
  Bell,
  Presentation,
  Rocket,
  Megaphone,
  Landmark,
  Target,
  Globe,
  LayoutTemplate,
  Mail,
  CheckCircle2,
  Flame,
  Clock,
  Code,
  Palette,
  Cpu,
  TrendingUp,
  PenTool,
  Smartphone,
  Server,
  Brush,
  Film,
  Wifi,
  Calculator,
  GraduationCap,
  Settings,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import type { Job, Company } from "@/types";

/* ─────────────────────────────────────────────
   Divisions of Bangladesh
   ───────────────────────────────────────────── */
const DIVISIONS_BN = [
  "ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "সিলেট", "বরিশাল", "রংপুর", "ময়মনসিংহ",
];
const DIVISIONS_EN = [
  "Dhaka", "Chattagram", "Rajshahi", "Khulna", "Sylhet", "Barishal", "Rangpur", "Mymensingh",
];

const DISTRICTS_BN: Record<string, string[]> = {
  "ঢাকা": ["ঢাকা", "গাজীপুর", "নারায়ণগঞ্জ", "মানিকগঞ্জ", "মুন্সিগঞ্জ", "টঙ্গী", "সাভার", "কেরানীগঞ্জ"],
  "চট্টগ্রাম": ["চট্টগ্রাম", "কক্সবাজার", "রাঙ্গামাটি", "বান্দরবান", "খাগড়াছড়ি", "ফেনী", "লাক্সামপুর", "চাঁদপুর", "কুমিল্লা"],
  "রাজশাহী": ["রাজশাহী", "বগুড়া", "পাবনা", "নাটোর", "সিরাজগঞ্জ", "চাঁপাইনবাবগঞ্জ", "নওগাঁ", "জয়পুরহাট"],
  "খুলনা": ["খুলনা", "বাগেরহাট", "সাতক্ষীরা", "যশোর", "মাগুরা", "নড়াইল", "কুষ্টিয়া", "মেহেরপুর", "চুয়াডাঙ্গা"],
  "সিলেট": ["সিলেট", "মৌলভীবাজার", "হবিগঞ্জ", "সুনামগঞ্জ"],
  "বরিশাল": ["বরিশাল", "পটুয়াখালী", "পিরোজপুর", "ভোলা", "বরগুনা", "ঝালকাঠি"],
  "রংপুর": ["রংপুর", "দিনাজপুর", "কুড়িগ্রাম", "লালমনিরহাট", "নীলফামারি", "পঞ্চগড়", "ঠাকুরগাঁও", "গাইবান্ধা"],
  "ময়মনসিংহ": ["ময়মনসিংহ", "শেরপুর", "জামালপুর", "নেত্রকোণা", "টাঙ্গাইল"],
};
const DISTRICTS_EN: Record<string, string[]> = {
  "Dhaka": ["Dhaka", "Gazipur", "Narayanganj", "Manikganj", "Munshiganj", "Tongi", "Savar", "Keraniganj"],
  "Chattagram": ["Chattagram", "Cox's Bazar", "Rangamati", "Bandarban", "Khagrachhari", "Feni", "Lakshmipur", "Chandpur", "Comilla"],
  "Rajshahi": ["Rajshahi", "Bogura", "Pabna", "Natore", "Sirajganj", "Chapainawabganj", "Naogaon", "Joypurhat"],
  "Khulna": ["Khulna", "Bagerhat", "Satkhira", "Jashore", "Magura", "Narail", "Kushtia", "Meherpur", "Chuadanga"],
  "Sylhet": ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
  "Barishal": ["Barishal", "Patuakhali", "Pirojpur", "Bhola", "Barguna", "Jhalakathi"],
  "Rangpur": ["Rangpur", "Dinajpur", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Thakurgaon", "Gaibandha"],
  "Mymensingh": ["Mymensingh", "Sherpur", "Jamalpur", "Netrokona", "Tangail"],
};

/* ── Upazilla / Thana data keyed by district name ── */
const THANAS_BN: Record<string, string[]> = {
  "ঢাকা": ["ধানমন্ডি", "গুলশান", "বনানী", "মিরপুর", "উত্তরা", "মতিঝিল", "তেজগাঁও", "ফার্মগেট", "মোহাম্মদপুর", "লালমাটিয়া", "শাহবাগ", "রমনা", "কোতোয়ালি", "লালবাগ", "নিউমার্কেট", "পল্লবী", "বাড্ডা", "রামপুরা", "খিলগাঁও", "যাত্রাবাড়ী", "দেমরা", "ক্যান্টনমেন্ট"],
  "গাজীপুর": ["গাজীপুর সদর", "টঙ্গী", "কোনাবাড়ী", "কালিয়াকৈর", "শ্রীপুর", "কাপাসিয়া"],
  "নারায়ণগঞ্জ": ["নারায়ণগঞ্জ সদর", "সোনারগাঁও", "বন্দর", "ফতুল্লা", "আড়াইহাজার", "রূপগঞ্জ"],
  "চট্টগ্রাম": ["কোতোয়ালি", "পাহারতলী", "কর্ণফুলী", "হাতহাজারী", "সান্দ্বীপ", "মীরসারাই", "সিতাকুণ্ড", "বাঁশখালী", "পতেঙ্গা"],
  "কুমিল্লা": ["কুমিল্লা সদর", "দাউদকান্দি", "মনোহরগঞ্জ", "দেবিদ্বার", "বরুড়া", "লাক্সাম", "চান্দিনা", "মুরাদনগর"],
  "কক্সবাজার": ["কক্সবাজার সদর", "চকরিয়া", "টেকনাফ", "উখিয়া", "রামু", "মহেশখালী", "পেকুয়া"],
  "সিলেট": ["কোতোয়ালি", "কোম্পানীগঞ্জ", "গোলাপগঞ্জ", "জকীগঞ্জ", "কানাইঘাট", "ফেঞ্চুগঞ্জ", "বিশ্বনাথ"],
  "রাজশাহী": ["বোয়ালিয়া", "মতিঝিল", "রাজপাড়া", "পুঠিয়া", "দুর্গাপুর", "চারঘাট", "পাবা"],
  "খুলনা": ["খান জাহান আলী", "খালিশপুর", "সোনাদানা", "দৌলতপুর", "বাটিয়াঘাটা", "দুমুরিয়া", "রূপসা"],
  "বরিশাল": ["কোতোয়ালি", "বাবুগঞ্জ", "বাকেরগঞ্জ", "মেহেন্দীগঞ্জ", "মুলাদী"],
  "রংপুর": ["রংপুর সদর", "গাঙ্গাচরা", "তারাগঞ্জ", "বাদারগঞ্জ", "কাউনিয়া", "মিঠাপুকুর"],
  "ময়মনসিংহ": ["ময়মনসিংহ সদর", "মুক্তাগাছা", "ঈশ্বরগঞ্জ", "নন্দাইল", "গফরগাঁও", "ফুলপুর"],
  "বগুড়া": ["বগুড়া সদর", "শেরপুর", "শিবগঞ্জ", "নন্দিগ্রাম", "সোনাতলা", "গাবতলী", "সারিয়াকান্দি"],
  "যশোর": ["যশোর সদর", "ঝিকারগঞ্জ", "মণিরামপুর", "অভয়নগর", "বাঘা পাড়া", "কেশবপুর"],
  "রাঙ্গামাটি": ["রাঙ্গামাটি সদর", "বাঘাইছড়ি", "বরকল", "লাঙ্গাদু", "নানিয়ারচর"],
  "হবিগঞ্জ": ["হবিগঞ্জ সদর", "লাখাই", "চুনারুঘাট", "নবীগঞ্জ", "বাহুবল"],
  "টাঙ্গাইল": ["টাঙ্গাইল সদর", "মিরজাপুর", "গোপালপুর", "ধানবাড়ি", "নাগরপুর", "শাখিমপুর"],
};
const THANAS_EN: Record<string, string[]> = {
  "Dhaka": ["Dhanmondi", "Gulshan", "Banani", "Mirpur", "Uttara", "Motijheel", "Tejgaon", "Farmgate", "Mohammadpur", "Lalmatia", "Shahbagh", "Ramna", "Kotwali", "Lalbagh", "New Market", "Pallabi", "Badda", "Rampura", "Khilgaon", "Jatrabari", "Demra", "Cantonment"],
  "Gazipur": ["Gazipur Sadar", "Tongi", "Konabari", "Kaliakair", "Sreepur", "Kapasia"],
  "Narayanganj": ["Narayanganj Sadar", "Sonargaon", "Bandar", "Fatulla", "Araihazar", "Rupganj"],
  "Chattagram": ["Kotwali", "Pahartali", "Karnafully", "Hathazari", "Sandwip", "Mirsharai", "Sitakunda", "Banshkhali", "Patenga"],
  "Comilla": ["Comilla Sadar", "Daudkandi", "Monohorgonj", "Debidwar", "Barura", "Laksham", "Chandina", "Muradnagar"],
  "Cox's Bazar": ["Cox's Bazar Sadar", "Chakaria", "Teknaf", "Ukhia", "Ramu", "Maheshkhali", "Pekua"],
  "Sylhet": ["Kotwali", "Companiganj", "Golapganj", "Jakiganj", "Kanaighat", "Fenchuganj", "Bishwanath"],
  "Rajshahi": ["Boalia", "Motijheel", "Rajpara", "Puthia", "Durgapur", "Charghat", "Paba"],
  "Khulna": ["Khan Jahan Ali", "Khalishpur", "Sonadanga", "Daulatpur", "Batiaghata", "Dumuria", "Rupsa"],
  "Barishal": ["Kotwali", "Babuganj", "Bakerganj", "Mehendiganj", "Muladi"],
  "Rangpur": ["Rangpur Sadar", "Gangachara", "Taraganj", "Badarganj", "Kaunia", "Mithapukur"],
  "Mymensingh": ["Mymensingh Sadar", "Muktagachha", "Ishwarganj", "Nandail", "Gaffargaon", "Phulpur"],
  "Bogura": ["Bogura Sadar", "Sherpur", "Shibganj", "Nandigram", "Sonatala", "Gabtali", "Sariakandi"],
  "Jashore": ["Jashore Sadar", "Jhikargacha", "Monirampur", "Abhaynagar", "Bagha Para", "Keshabpur"],
  "Rangamati": ["Rangamati Sadar", "Baghaichhari", "Barkal", "Langadu", "Naniarchar"],
  "Habiganj": ["Habiganj Sadar", "Lakhai", "Chunarughat", "Nabiganj", "Bahubal"],
  "Tangail": ["Tangail Sadar", "Mirzapur", "Gopalpur", "Dhanbari", "Nagarpur", "Shakhimpur"],
};

/* ─────────────────────────────────────────────
   Category Icon Map (synced with admin DB icons)
   ───────────────────────────────────────────── */
const CATEGORY_ICON_MAP: Record<string, { icon: typeof Briefcase; bg: string; text: string }> = {
  'briefcase':     { icon: Briefcase,     bg: "bg-teal-50 dark:bg-teal-950/20",     text: "text-teal-600 dark:text-teal-400" },
  'building-2':    { icon: Building2,     bg: "bg-blue-50 dark:bg-blue-950/20",     text: "text-blue-600 dark:text-blue-400" },
  'users':         { icon: Users,          bg: "bg-purple-50 dark:bg-purple-950/20", text: "text-purple-600 dark:text-purple-400" },
  'bell-ring':     { icon: BellRing,      bg: "bg-orange-50 dark:bg-orange-950/20", text: "text-orange-500 dark:text-orange-400" },
  'star':          { icon: Star,           bg: "bg-pink-50 dark:bg-pink-950/20",     text: "text-pink-500 dark:text-pink-400" },
  'layers':        { icon: Layers,         bg: "bg-indigo-50 dark:bg-indigo-950/20", text: "text-indigo-600 dark:text-indigo-400" },
  'code':          { icon: Code,           bg: "bg-cyan-50 dark:bg-cyan-950/20",     text: "text-cyan-600 dark:text-cyan-400" },
  'palette':       { icon: Palette,        bg: "bg-fuchsia-50 dark:bg-fuchsia-950/20", text: "text-fuchsia-600 dark:text-fuchsia-400" },
  'cpu':           { icon: Cpu,            bg: "bg-emerald-50 dark:bg-emerald-950/20", text: "text-emerald-600 dark:text-emerald-400" },
  'trending-up':   { icon: TrendingUp,    bg: "bg-amber-50 dark:bg-amber-950/20",   text: "text-amber-600 dark:text-amber-400" },
  'pen-tool':      { icon: PenTool,        bg: "bg-rose-50 dark:bg-rose-950/20",     text: "text-rose-600 dark:text-rose-400" },
  'smartphone':    { icon: Smartphone,     bg: "bg-violet-50 dark:bg-violet-950/20", text: "text-violet-600 dark:text-violet-400" },
  'server':        { icon: Server,         bg: "bg-sky-50 dark:bg-sky-950/20",       text: "text-sky-600 dark:text-sky-400" },
  'brush':         { icon: Brush,          bg: "bg-orange-50 dark:bg-orange-950/20", text: "text-orange-600 dark:text-orange-400" },
  'film':          { icon: Film,           bg: "bg-slate-50 dark:bg-slate-950/20",   text: "text-slate-600 dark:text-slate-400" },
  'wifi':          { icon: Wifi,           bg: "bg-blue-50 dark:bg-blue-950/20",     text: "text-blue-500 dark:text-blue-400" },
  'calculator':    { icon: Calculator,     bg: "bg-green-50 dark:bg-green-950/20",   text: "text-green-600 dark:text-green-400" },
  'graduation-cap':{ icon: GraduationCap,  bg: "bg-yellow-50 dark:bg-yellow-950/20", text: "text-yellow-600 dark:text-yellow-400" },
  'settings':      { icon: Settings,       bg: "bg-zinc-50 dark:bg-zinc-950/20",     text: "text-zinc-600 dark:text-zinc-400" },
  'heart':         { icon: Heart,          bg: "bg-red-50 dark:bg-red-950/20",       text: "text-red-500 dark:text-red-400" },
  'monitor-play':  { icon: MonitorPlay,    bg: "bg-cyan-50 dark:bg-cyan-950/20",     text: "text-cyan-600 dark:text-cyan-400" },
};

const CATEGORY_FALLBACK_STYLE = { icon: Briefcase, bg: "bg-teal-50 dark:bg-teal-950/20", text: "text-teal-600 dark:text-teal-400" };

const CATEGORY_URL_MAP: Record<string, string> = {
  'bell-ring': '/dashboard/job-alerts',
};

/* ─────────────────────────────────────────────
   Service Features
   ───────────────────────────────────────────── */
const DEFAULT_SERVICE_FEATURES = [
  {
    title: "Video CV",
    title_bn: "ভিডিও সিভি",
    description: "Present yourself through video and boost job opportunities",
    description_bn: "ভিডিওর মাধ্যমে নিজেকে উপস্থাপন করুন এবং চাকরির সুযোগ বাড়ান",
    bg_color: "#E6F4EA",
    text_color: "#1F2937",
    bg_color_dark: "#064E3B",
    text_color_dark: "#F3F4F6",
    button_text: "Create Video CV",
    button_text_bn: "ভিডিও সিভি তৈরি করুন",
    button_bg: "#059669",
    button_text_color: "#FFFFFF",
    button_bg_dark: "#059669",
    button_text_color_dark: "#FFFFFF",
    icon: "monitor-play",
    url: "/resume-builder/new",
    enabled: true,
  },
  {
    title: "CV Builder",
    title_bn: "সিভি তৈরি",
    description: "Create professional CVs easily!",
    description_bn: "প্রফেশনাল সিভি তৈরি করুন খুব সহজেই!",
    bg_color: "#EBF5FF",
    text_color: "#1F2937",
    bg_color_dark: "#1E3A8A",
    text_color_dark: "#F3F4F6",
    button_text: "Build CV",
    button_text_bn: "সিভি তৈরি করুন",
    button_bg: "#2563EB",
    button_text_color: "#FFFFFF",
    button_bg_dark: "#1D4ED8",
    button_text_color_dark: "#FFFFFF",
    icon: "file-text",
    url: "/resume-builder/new",
    enabled: true,
  },
  {
    title: "Post a Job",
    title_bn: "চাকরি পোস্ট করুন",
    description: "Find the best candidates for your organization",
    description_bn: "আপনার প্রতিষ্ঠানের জন্য সেরা প্রার্থী খুঁজে নিন সহজেই",
    bg_color: "#F3E8FF",
    text_color: "#1F2937",
    bg_color_dark: "#581C87",
    text_color_dark: "#F3F4F6",
    button_text: "Post Job",
    button_text_bn: "চাকরি পোস্ট করুন",
    button_bg: "#7C3AED",
    button_text_color: "#FFFFFF",
    button_bg_dark: "#7E22CE",
    button_text_color_dark: "#FFFFFF",
    icon: "briefcase",
    url: "/login",
    enabled: true,
  },
  {
    title: "Job Alert",
    title_bn: "জব এলার্ট",
    description: "Set job alerts for your preferred positions.",
    description_bn: "আপনার পছন্দের চাকরির জন্য জব এলার্ট সেট করুন।",
    bg_color: "#FFF7ED",
    text_color: "#1F2937",
    bg_color_dark: "#78350F",
    text_color_dark: "#F3F4F6",
    button_text: "Set Alert",
    button_text_bn: "এলার্ট সেট করুন",
    button_bg: "#EA580C",
    button_text_color: "#FFFFFF",
    button_bg_dark: "#B45309",
    button_text_color_dark: "#FFFFFF",
    icon: "bell",
    url: "/dashboard/job-alerts",
    enabled: true,
  },
  {
    title: "Premium Banner",
    title_bn: "প্রিমিয়াম ব্যানার",
    description: "Boost your branding with premium banner slots.",
    description_bn: "আপনার ব্র্যান্ডিং বাড়ান প্রিমিয়াম ব্যানারের মাধ্যমে",
    bg_color: "#EFF6FF",
    text_color: "#1F2937",
    bg_color_dark: "#0C4A6E",
    text_color_dark: "#F3F4F6",
    button_text: "Advertise",
    button_text_bn: "বিজ্ঞাপন দিন",
    button_bg: "#3B82F6",
    button_text_color: "#FFFFFF",
    button_bg_dark: "#0284C7",
    button_text_color_dark: "#FFFFFF",
    icon: "presentation",
    url: "/pricing",
    enabled: true,
  },
  {
    title: "AI Career Assistant",
    title_bn: "এআই ক্যারিয়ার সহকারী",
    description: "Get personalized career guidance from our AI assistant.",
    description_bn: "আমাদের এআই সহকারী থেকে ক্যারিয়ার পরামর্শ পান।",
    bg_color: "#F3E8FF",
    text_color: "#1F2937",
    bg_color_dark: "#581C87",
    text_color_dark: "#F3F4F6",
    button_text: "Chat with AI",
    button_text_bn: "এআই এর সাথে কথা বলুন",
    button_bg: "#7C3AED",
    button_text_color: "#FFFFFF",
    button_bg_dark: "#6D28D9",
    button_text_color_dark: "#FFFFFF",
    icon: "sparkles",
    url: "/ai-assistant",
    enabled: true,
  },
  {
    title: "Find Jobs",
    title_bn: "চাকরি খুঁজুন",
    description: "Search thousands of job listings from top companies.",
    description_bn: "শীর্ষ কোম্পানি থেকে হাজার হাজার চাকরির খোঁজ করুন।",
    bg_color: "#ECFDF5",
    text_color: "#1F2937",
    bg_color_dark: "#064E3B",
    text_color_dark: "#F3F4F6",
    button_text: "Browse Jobs",
    button_text_bn: "চাকরি দেখুন",
    button_bg: "#059669",
    button_text_color: "#FFFFFF",
    button_bg_dark: "#047857",
    button_text_color_dark: "#FFFFFF",
    icon: "search",
    url: "/jobs",
    enabled: true,
  },
  {
    title: "Company Directory",
    title_bn: "কোম্পানির তালিকা",
    description: "Explore top employers and their open positions.",
    description_bn: "শীর্ষ নিয়োগদাতাদের পদগুলো অনুসন্ধান করুন।",
    bg_color: "#FFF7ED",
    text_color: "#1F2937",
    bg_color_dark: "#7C2D12",
    text_color_dark: "#F3F4F6",
    button_text: "View Companies",
    button_text_bn: "কোম্পানি দেখুন",
    button_bg: "#EA580C",
    button_text_color: "#FFFFFF",
    button_bg_dark: "#C2410C",
    button_text_color_dark: "#FFFFFF",
    icon: "building-2",
    url: "/companies",
    enabled: true,
  },
  {
    title: "Salary Insights",
    title_bn: "বেতন তথ্য",
    description: "Compare salary ranges for different roles.",
    description_bn: "বিভিন্ন পদের বেতন পরিসীমা তুলনা করুন।",
    bg_color: "#FEF2F2",
    text_color: "#1F2937",
    bg_color_dark: "#7F1D1D",
    text_color_dark: "#F3F4F6",
    button_text: "Check Salaries",
    button_text_bn: "বেতন দেখুন",
    button_bg: "#DC2626",
    button_text_color: "#FFFFFF",
    button_bg_dark: "#B91C1C",
    button_text_color_dark: "#FFFFFF",
    icon: "trending-up",
    url: "/salary-insights",
    enabled: true,
  },
];

const ICON_MAP: Record<string, any> = {
  "monitor-play": MonitorPlay,
  "file-text": FileText,
  "briefcase": Briefcase,
  "bell": Bell,
  "presentation": Presentation,
  "megaphone": Megaphone,
  "target": Target,
  "landmark": Landmark,
  "users": Users,
  "book-open": FileText,
  "globe": Globe,
  "layout-template": LayoutTemplate,
  "map-pin": MapPin,
  "sparkles": Sparkles,
  "search": Search,
  "building-2": Building2,
  "trending-up": Sparkles,
};

/* ─────────────────────────────────────────────
   Important Links
   ───────────────────────────────────────────── */
const IMPORTANT_LINKS = [
  { icon: FileText, href: "/jobs?type=govt", bn: "সরকারি চাকরির সকল নোটিশ", en: "All Govt Job Notices" },
  { icon: Landmark, href: "/jobs?search=bank", bn: "ব্যাংক চাকরির নিয়োগ বিজ্ঞপ্তি", en: "Bank Job Notices" },
  { icon: Users, href: "/jobs?type=ngo", bn: "এনজিও চাকরির খবর", en: "NGO Job News" },
  { icon: Globe, href: "/jobs?search=teacher", bn: "শিক্ষক নিয়োগ ও বিজ্ঞপ্তি", en: "Teacher Recruitment" },
  { icon: Target, href: "/jobs", bn: "চাকরির প্রস্তুতি গাইড", en: "Job Prep Guide" },
  { icon: MapPin, href: "/jobs", bn: "বিভিন্ন জেলা ও রেজাল্ট", en: "Districts & Results" },
  { icon: Globe, href: "/jobs?remote=true", bn: "বিদেশে চাকরির সুযোগ", en: "Foreign Job Opportunities" },
  { icon: LayoutTemplate, href: "/resume-builder/template", bn: "ফ্রি সিভি টেমপ্লেট", en: "Free CV Templates" },
];

/* ═══════════════════════════════════════════════
   Homepage Component
   ═══════════════════════════════════════════════ */
export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { language, settings } = useThemeStore();
  const isBn = language === "bn";
  const { resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  /* ── Search State ── */
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedUpozilla, setSelectedUpozilla] = useState("");
  const [location, setLocation] = useState("");
  const [keyword, setKeyword] = useState("");

  /* ── Data (React Query cached) ── */
  const {
    categories, categoriesLoading, categoriesError,
    companies, notices, jobs, hpData, hotJobs, remoteJobs, loading,
  } = useHomepageData();

  /* ── Derived data ── */
  const trending: string[] = isBn
    ? hpData.homepage_trending_searches_bn || hpData.homepage_trending_searches || []
    : hpData.homepage_trending_searches || hpData.homepage_trending_searches_bn || [];

  const divisions = isBn ? DIVISIONS_BN : DIVISIONS_EN;
  const districts = isBn ? DISTRICTS_BN : DISTRICTS_EN;
  const thanas = isBn ? THANAS_BN : THANAS_EN;
  const availableDistricts = selectedDivision ? (districts[selectedDivision] || []) : [];
  const availableUpozillas = selectedDistrict ? (thanas[selectedDistrict] || []) : [];

  /* ── Handle Search ── */
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (selectedDivision) params.set("division", selectedDivision);
    if (selectedDistrict) params.set("district", selectedDistrict);
    if (selectedUpozilla) params.set("upazila", selectedUpozilla);
    if (location) params.set("location", location);
    router.push(`/jobs?${params.toString()}`);
  };

  /* ── Handle Trending Click ── */
  const handleTrendingClick = (term: string) => {
    router.push(`/jobs?keyword=${encodeURIComponent(term)}`);
  };

  /* ── Get Category Name ── */
  const getCategoryName = (cat: any): string => {
    if (isBn) return cat.name_bn || cat.name_en || "";
    return cat.name_en || cat.name_bn || "";
  };

  /* ── Get Company Location ── */
  const getCompanyLocation = (company: Company): string => {
    return company.location || (isBn ? "ঢাকা" : "Dhaka");
  };

  const hero = hpData?.homepage_hero_section;
  const heroImage = hero?.image;
  const heroBg = heroImage
    ? `linear-gradient(to right, rgba(28,37,65,0.95), rgba(28,37,65,0.8)), url(${getStorageUrl(heroImage)})`
    : `linear-gradient(to right, rgba(28,37,65,0.95), rgba(28,37,65,0.8)), linear-gradient(135deg, #1C2541, #0B132B)`;
  const heroT1 = isBn ? (hero?.title_line1_bn || "বাংলাদেশের সেরা") : (hero?.title_line1 || "Bangladesh's Best");
  const heroT2 = isBn ? (hero?.title_line2_bn || "চাকরির খোঁজ এখানেই") : (hero?.title_line2 || "Job Search Here");
  const heroSub = isBn ? (hero?.subtitle_bn || "সহজে খুঁজুন, দ্রুত আবেদন করুন, স্বপ্নের ক্যারিয়ার গড়ুন") : (hero?.subtitle || "Search easily, apply fast, build your dream career");
  const heroBoxTitle = isBn ? (hero?.box_title_bn || "আমাদের সাথে কেন থাকবেন?") : (hero?.box_title || "Why join us?");
  const heroBullets = hero?.bullet_points?.length
    ? hero.bullet_points
    : [
        { text: "All types of job updates", text_bn: "সকল ধরনের চাকরির আপডেট" },
        { text: "Direct hiring from top companies", text_bn: "শীর্ষ কোম্পানির সরাসরি নিয়োগ" },
        { text: "Easy CV creation & application process", text_bn: "সহজে সিভি তৈরি ও আবেদন প্রক্রিয়া" },
        { text: "Quick connection with employers", text_bn: "নিয়োগকর্তাদের সাথে দ্রুত সংযোগ" },
      ];
  const heroShowBox = hero?.show_box !== false;
  const heroBoxOffset = hero?.box_offset ?? -64;

  return (
    <PublicLayout>
      {/* ═══ Hero Section (hidden on mobile) ═══ */}
      <div className="hidden md:block">
        <section
          className="relative pb-24 pt-16 px-4"
          style={{
            backgroundImage: heroBg,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="md:w-1/2 text-white">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                <>{heroT1} <br />
                  <span className="text-[#F59E0B]">{heroT2}</span></>
              </h1>
              <p className="text-gray-300 text-lg mb-8">{heroSub}</p>
            </div>

            {/* Glass Morphism Box — shifted slightly left */}
            {heroShowBox && (
              <div className="md:w-[320px] bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/20 z-10 transition-transform duration-300" style={{ transform: `translateX(${heroBoxOffset}px)` }}>
                <h3 className="text-[#F59E0B] font-bold text-base mb-3">{heroBoxTitle}</h3>
                <ul className="text-white space-y-2 text-xs">
                  {heroBullets.map((b: any, i: number) => (
                    <li key={i} className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                      <span>{isBn ? (b.text_bn || b.text) : (b.text || b.text_bn)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* ═══ Floating Search Bar ═══ */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
          <div className="bg-card rounded-xl shadow-lg p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {/* Division Select */}
              <div className="relative">
                <select
                  value={selectedDivision}
                  onChange={(e) => {
                    setSelectedDivision(e.target.value);
                    setSelectedDistrict("");
                    setSelectedUpozilla("");
                  }}
                  className="w-full bg-muted border border-border text-foreground py-3 px-4 rounded focus:outline-none focus:border-[#059669] focus-visible:ring-2 focus-visible:ring-[#059669]/50 appearance-none cursor-pointer text-sm"
                >
                  <option value="">
                    {isBn ? "বিভাগ নির্বাচন করুন" : "Select Division"}
                  </option>
                  {divisions.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-3.5 text-muted-foreground pointer-events-none" />
              </div>

              {/* District Select */}
              <div className="relative">
                <select
                  value={selectedDistrict}
                  onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedUpozilla(""); }}
                  disabled={!selectedDivision}
                  className="w-full bg-muted border border-border text-foreground py-3 px-4 rounded focus:outline-none focus:border-[#059669] focus-visible:ring-2 focus-visible:ring-[#059669]/50 appearance-none cursor-pointer text-sm disabled:opacity-50"
                >
                  <option value="">
                    {isBn ? "জেলা নির্বাচন করুন" : "Select District"}
                  </option>
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-3.5 text-muted-foreground pointer-events-none" />
              </div>

              {/* Upozilla / Thana Select */}
              <div className="relative">
                <select
                  value={selectedUpozilla}
                  onChange={(e) => setSelectedUpozilla(e.target.value)}
                  disabled={!selectedDistrict || availableUpozillas.length === 0}
                  className="w-full bg-muted border border-border text-foreground py-3 px-4 rounded focus:outline-none focus:border-[#059669] focus-visible:ring-2 focus-visible:ring-[#059669]/50 appearance-none cursor-pointer text-sm disabled:opacity-50"
                >
                  <option value="">
                    {isBn ? "উপজেলা/থানা" : "Upozilla / Thana"}
                  </option>
                  {availableUpozillas.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-3.5 text-muted-foreground pointer-events-none" />
              </div>

              {/* Location Input */}
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={isBn ? "লোকেশন" : "Location"}
                  className="w-full bg-muted border border-border text-foreground py-3 pl-10 pr-4 rounded focus:outline-none focus:border-[#059669] focus-visible:ring-2 focus-visible:ring-[#059669]/50 text-sm"
                />
              </div>

              {/* Keyword Input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={isBn ? "চাকরির পদ বা কীওয়ার্ড" : "Job title or keyword"}
                  className="w-full bg-muted border border-border text-foreground py-3 pl-10 pr-4 rounded focus:outline-none focus:border-[#059669] focus-visible:ring-2 focus-visible:ring-[#059669]/50 text-sm"
                />
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="bg-[#059669] hover:bg-[#047857] text-white font-medium py-3 px-4 rounded flex items-center justify-center space-x-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#059669]"
              >
                <Search className="w-4 h-4" />
                <span>{isBn ? "চাকরি খুঁজুন" : "Search Jobs"}</span>
              </button>
            </div>
          </div>

          {/* Trending Searches */}
          {trending.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center text-xs text-muted-foreground gap-2">
              <span className="font-bold text-foreground">
                {isBn ? "জনপ্রিয় অনুসন্ধান:" : "Trending:"}
              </span>
              {trending.slice(0, 8).map((term: string, i: number) => (
                <button
                  key={i}
                  onClick={() => handleTrendingClick(term)}
                  className="bg-primary/10 text-foreground px-3 py-1 rounded-full hover:bg-primary/20 transition cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* ═══ Category Grid ═══ */}
      {(() => {
        const catSettings = hpData?.homepage_categories || {};
        if (catSettings.enabled === false) return null;
        const catCardText = catSettings.card_text || '#1F2937';
        const catCardTextDark = catSettings.card_text_dark || '#F3F4F6';
        const catIconBg = catSettings.icon_bg || '#FFFFFF';
        const catIconColor = catSettings.icon_color || '#059669';
        const catBtnBorder = catSettings.button_border || '#059669';
        const catBtnText = catSettings.button_text || '#059669';
        const catHeading = catSettings.heading_color || '#1F2937';
        const catCount = catSettings.count_color || '#6B7280';
        const catGradFrom = catSettings.gradient_from;
        const catGradVia = catSettings.gradient_via;
        const catGradTo = catSettings.gradient_to;
        const catGradFromDark = catSettings.gradient_from_dark;
        const catGradViaDark = catSettings.gradient_via_dark;
        const catGradToDark = catSettings.gradient_to_dark;
        const catLightBg = catGradFrom && catGradVia && catGradTo ? `linear-gradient(to right, ${catGradFrom}, ${catGradVia}, ${catGradTo})` : catSettings.card_bg || '#F0FDF4';
        const catDarkBg = catGradFromDark && catGradViaDark && catGradToDark ? `linear-gradient(to right, ${catGradFromDark}, ${catGradViaDark}, ${catGradToDark})` : catSettings.card_bg_dark || '#022C22';
        return (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((cat: any) => {
                const style = CATEGORY_ICON_MAP[cat.icon] || CATEGORY_FALLBACK_STYLE;
                const IconComp = style.icon;
                const catName = getCategoryName(cat);
                const jobCount = cat.jobs_count ?? cat.count;
                const catUrl = CATEGORY_URL_MAP[cat.icon] || `/jobs/category/${cat.id}`;

                return (
                  <Link key={cat.id} href={catUrl}>
                    <div className="border border-border rounded-lg p-5 text-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer h-full dark:hidden" style={{ background: catLightBg, color: catCardText }}>
                      <div className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-3 shadow-sm" style={{ backgroundColor: catIconBg, color: catIconColor }}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-sm">{catName}</h4>
                      <p className="text-xs mb-3" style={{ color: catCount }}>
                        {jobCount ? `${jobCount.toLocaleString()}+ ${isBn ? "পোস্ট" : "posts"}` : isBn ? "পোস্ট" : "posts"}
                      </p>
                      <button className="w-full py-1 rounded text-xs transition-all duration-200 cursor-pointer" style={{ borderColor: catBtnBorder, color: catBtnText, borderWidth: 1 }}>
                        {isBn ? "দেখুন" : "View"}
                      </button>
                    </div>
                    <div className="border border-border rounded-lg p-5 text-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer h-full hidden dark:block" style={{ background: catDarkBg, color: catCardTextDark }}>
                      <div className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-3 shadow-sm" style={{ backgroundColor: catIconBg, color: catIconColor }}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-sm">{catName}</h4>
                      <p className="text-xs mb-3" style={{ color: catCount }}>
                        {jobCount ? `${jobCount.toLocaleString()}+ ${isBn ? "পোস্ট" : "posts"}` : isBn ? "পোস্ট" : "posts"}
                      </p>
                      <button className="w-full py-1 rounded text-xs transition-all duration-200 cursor-pointer" style={{ borderColor: catBtnBorder, color: catBtnText, borderWidth: 1 }}>
                        {isBn ? "দেখুন" : "View"}
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* ── Subcategories List ── */}
            {categories.some((cat: any) => cat.children && cat.children.length > 0) && (
              <div className="mt-8">
                <h3 className="text-base font-bold mb-4" style={{ color: catHeading }}>
                  {isBn ? "ক্যাটাগরি অনুযায়ী ব্রাউজ করুন" : "Browse by Subcategory"}
                </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-0">
              {categories.filter((cat: any) => cat.children && cat.children.length > 0).map((cat: any) => (
                <div key={cat.id}>
                  <Link
                    href={`/jobs/category/${cat.slug || cat.id}`}
                    className="flex items-center justify-between py-2.5 border-b border-border/60 hover:text-[#059669] transition-colors group"
                  >
                    <span className="flex items-center gap-1.5 text-sm font-medium text-foreground group-hover:text-[#059669]">
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      {getCategoryName(cat)}
                    </span>
                    {cat.jobs_count != null && (
                      <span className="text-xs text-muted-foreground">({cat.jobs_count})</span>
                    )}
                  </Link>
                  <div className="pl-5">
                    {cat.children.map((child: any) => (
                      <Link
                        key={child.id}
                        href={`/jobs/category/${child.id}`}
                        className="flex items-center justify-between py-2 border-b border-border/40 hover:text-[#059669] transition-colors group"
                      >
                        <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground group-hover:text-[#059669]">
                          <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
                          {getCategoryName(child)}
                        </span>
                        {child.jobs_count != null && (
                          <span className="text-[11px] text-muted-foreground">({child.jobs_count})</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  })()}

      {/* ═══ Hot Jobs Section ═══ */}
      {(() => {
        const hjSettings = hpData?.homepage_hot_jobs || {};
        if (hjSettings.enabled === false) return null;
        const hjHeading = hjSettings.heading_color || '#1F2937';
        const hjIconColor = hjSettings.heading_icon_color || '#F97316';
        const hjCardBg = hjSettings.card_bg || '#FFFFFF';
        const hjCardText = hjSettings.card_text || '#1F2937';
        const hjCardBgDark = hjSettings.card_bg_dark || '#18181B';
        const hjCardTextDark = hjSettings.card_text_dark || '#F3F4F6';
        const hjSalary = hjSettings.salary_color || '#059669';
        const hjBadgeBg = hjSettings.badge_bg || '#FEF3C7';
        const hjBadgeText = hjSettings.badge_text || '#D97706';
        const hjViewAll = hjSettings.view_all_color || '#059669';
        return (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: hjHeading }}>
                <Flame className="w-5 h-5" style={{ color: hjIconColor }} />
                {isBn ? "হট জবস" : "Hot Jobs"}
              </h2>
              <Link href="/jobs" className="text-sm font-medium hover:underline flex items-center" style={{ color: hjViewAll }}>
                {isBn ? "সব চাকরি দেখুন" : "View All Jobs"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-card border border-border rounded-lg p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-3 w-2/3 mb-3" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            ) : hotJobs.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {hotJobs.slice(0, 30).map((job: any) => (
                  <Link key={job.id} href={`/jobs/${job.id}`} className="block h-full">
                    <div className="border border-border rounded-xl p-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer h-full flex flex-col dark:hidden" style={{ backgroundColor: hjCardBg, color: hjCardText }}>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-sm line-clamp-2 flex-1">{job.title}</h3>
                        {!!job.is_promoted && (
                          <span className="shrink-0 ml-2 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-0.5" style={{ backgroundColor: hjBadgeBg, color: hjBadgeText }}>
                            <Flame className="w-3 h-3" /> {isBn ? "হট" : "HOT"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs mb-2 flex items-center gap-1" style={{ opacity: 0.7 }}>
                        <Building2 className="w-3 h-3" />
                        {typeof job.company === "object" && job.company ? (job.company as any).name : job.company_name || ""}
                      </p>
                      <div className="mt-auto space-y-1">
                        <p className="text-xs flex items-center gap-1" style={{ opacity: 0.7 }}>
                          <MapPin className="w-3 h-3" />
                          {job.location || (isBn ? "যেকোনো স্থান" : "Anywhere")}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold" style={{ color: hjSalary }}>
                            {job.salary_min && job.salary_max
                              ? `${formatCurrency(job.salary_min)} - ${formatCurrency(job.salary_max)}`
                              : job.salary_min
                                ? `${formatCurrency(job.salary_min)}+`
                                : job.budget
                                  ? formatCurrency(job.budget)
                                  : isBn ? "আলোচনা সাপেক্ষে" : "Negotiable"}
                          </span>
                          <span className="text-[10px] flex items-center gap-1" style={{ opacity: 0.5 }}>
                            <Clock className="w-3 h-3" />
                            {job.created_at
                              ? new Date(job.created_at).toLocaleDateString(isBn ? "bn-BD" : "en-US", { month: "short", day: "numeric" })
                              : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="border border-border rounded-xl p-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer h-full hidden dark:flex flex-col" style={{ backgroundColor: hjCardBgDark, color: hjCardTextDark }}>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-sm line-clamp-2 flex-1">{job.title}</h3>
                        {!!job.is_promoted && (
                          <span className="shrink-0 ml-2 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-0.5" style={{ backgroundColor: hjBadgeBg, color: hjBadgeText }}>
                            <Flame className="w-3 h-3" /> {isBn ? "হট" : "HOT"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs mb-2 flex items-center gap-1" style={{ opacity: 0.7 }}>
                        <Building2 className="w-3 h-3" />
                        {typeof job.company === "object" && job.company ? (job.company as any).name : job.company_name || ""}
                      </p>
                      <div className="mt-auto space-y-1">
                        <p className="text-xs flex items-center gap-1" style={{ opacity: 0.7 }}>
                          <MapPin className="w-3 h-3" />
                          {job.location || (isBn ? "যেকোনো স্থান" : "Anywhere")}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold" style={{ color: hjSalary }}>
                            {job.salary_min && job.salary_max
                              ? `${formatCurrency(job.salary_min)} - ${formatCurrency(job.salary_max)}`
                              : job.salary_min
                                ? `${formatCurrency(job.salary_min)}+`
                                : job.budget
                                  ? formatCurrency(job.budget)
                                  : isBn ? "আলোচনা সাপেক্ষে" : "Negotiable"}
                          </span>
                          <span className="text-[10px] flex items-center gap-1" style={{ opacity: 0.5 }}>
                            <Clock className="w-3 h-3" />
                            {job.created_at
                              ? new Date(job.created_at).toLocaleDateString(isBn ? "bn-BD" : "en-US", { month: "short", day: "numeric" })
                              : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}

          {/* ── Remote Jobs Sub-section ── */}
          {remoteJobs.length > 0 && (() => {
          const rjSettings = hpData?.homepage_remote_jobs || {};
          if (rjSettings.enabled === false) return null;
          const rjHeading = rjSettings.heading_color || '#1F2937';
          const rjIconColor = rjSettings.heading_icon_color || '#3B82F6';
          const rjCardBg = rjSettings.card_bg || '#FFFFFF';
          const rjCardText = rjSettings.card_text || '#1F2937';
          const rjCardBgDark = rjSettings.card_bg_dark || '#18181B';
          const rjCardTextDark = rjSettings.card_text_dark || '#F3F4F6';
          const rjSalary = rjSettings.salary_color || '#059669';
          const rjDateColor = rjSettings.date_color || '#6B7280';
          const rjBadgeBg = rjSettings.badge_bg || '#DBEAFE';
          const rjBadgeText = rjSettings.badge_text || '#1D4ED8';
          return (
          <div className="mt-10">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: rjHeading }}>
                <Globe className="w-5 h-5" style={{ color: rjIconColor }} />
                {isBn ? "রিমোট চাকরি" : "Remote Jobs"}
              </h3>
              <Link href="/jobs/remote" className="text-sm font-medium hover:underline flex items-center" style={{ color: rjSalary }}>
                {isBn ? "সব রিমোট চাকরি দেখুন" : "View All Remote Jobs"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {remoteJobs.slice(0, 30).map((job: any) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block h-full">
                  <div className="border border-border rounded-lg p-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer h-full flex flex-col dark:hidden" style={{ background: rjCardBg, color: rjCardText }}>
                    <h4 className="font-bold text-xs line-clamp-2 mb-1">{job.title}</h4>
                    <p className="text-[11px] mb-1 flex items-center gap-1" style={{ opacity: 0.7 }}>
                      <Building2 className="w-3 h-3 shrink-0" />
                      <span className="truncate">{typeof job.company === "object" && job.company ? (job.company as any).name : job.company_name || ""}</span>
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-[11px] font-semibold" style={{ color: rjSalary }}>
                        {job.salary_min && job.salary_max
                          ? `${formatCurrency(job.salary_min)} - ${formatCurrency(job.salary_max)}`
                          : job.budget
                          ? formatCurrency(job.budget)
                          : isBn ? "আলোচনা" : "Negotiable"}
                      </span>
                      <span className="text-[10px] flex items-center gap-0.5" style={{ color: rjDateColor }}>
                        <Clock className="w-2.5 h-2.5" />
                        {job.created_at
                          ? new Date(job.created_at).toLocaleDateString(isBn ? "bn-BD" : "en-US", { month: "short", day: "numeric" })
                          : ""}
                      </span>
                    </div>
                  </div>
                  <div className="border border-border rounded-lg p-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer h-full hidden dark:flex flex-col" style={{ background: rjCardBgDark, color: rjCardTextDark }}>
                    <h4 className="font-bold text-xs line-clamp-2 mb-1">{job.title}</h4>
                    <p className="text-[11px] mb-1 flex items-center gap-1" style={{ opacity: 0.7 }}>
                      <Building2 className="w-3 h-3 shrink-0" />
                      <span className="truncate">{typeof job.company === "object" && job.company ? (job.company as any).name : job.company_name || ""}</span>
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-[11px] font-semibold" style={{ color: rjSalary }}>
                        {job.salary_min && job.salary_max
                          ? `${formatCurrency(job.salary_min)} - ${formatCurrency(job.salary_max)}`
                          : job.budget
                          ? formatCurrency(job.budget)
                          : isBn ? "আলোচনা" : "Negotiable"}
                      </span>
                      <span className="text-[10px] flex items-center gap-0.5" style={{ color: rjDateColor }}>
                        <Clock className="w-2.5 h-2.5" />
                        {job.created_at
                          ? new Date(job.created_at).toLocaleDateString(isBn ? "bn-BD" : "en-US", { month: "short", day: "numeric" })
                          : ""}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          );
        })()}
          </section>
          );
        })()}

      {/* ═══ Company Section ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-foreground">
            {isBn ? "বিভিন্ন কোম্পানির বিজ্ঞাপন" : "Company Listings"}
          </h2>
          <Link href="/companies" className="text-[#059669] text-sm font-medium hover:underline flex items-center">
            {isBn ? "সব কোম্পানি দেখুন" : "View All Companies"}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4">
                <Skeleton className="h-12 w-24 mx-auto mb-2" />
                <Skeleton className="h-4 w-3/4 mx-auto mb-1" />
                <Skeleton className="h-3 w-1/2 mx-auto mb-3" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : companies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {companies.map((company: any, i: number) => {
              const cardColors = [
                "bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800",
                "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
                "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
                "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
                "bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800",
                "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
              ];
              return (
                <Link key={company.id} href={`/companies/${company.slug || company.id}`}>
                  <div className={`${cardColors[i % cardColors.length]} border rounded-xl p-4 text-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer`}>
                    {company.logo ? (
                      <div className="h-12 flex items-center justify-center mb-2">
                        <img
                          src={getStorageUrl(company.logo)!}
                          alt={company.name}
                          className="max-h-10 max-w-[80px] object-contain"
                        />
                      </div>
                    ) : (
                      <div className="h-12 flex items-center justify-center mb-2 font-bold text-muted-foreground text-lg">
                        {company.name.slice(0, 10)}
                      </div>
                    )}
                    <h4 className="font-bold text-foreground text-sm">{company.name}</h4>
                    {"jobs_count" in company && (company as Company).jobs_count != null && (
                      <p className="text-xs text-muted-foreground mb-2 font-medium">
                        {(company as Company).jobs_count}+ {isBn ? "পদে নিয়োগ" : "open positions"}
                      </p>
                    )}
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {(company as any).rating ? Number((company as any).rating).toFixed(1) : "0.0"}
                      </span>
                      <span className="text-muted-foreground/50">|</span>
                      <span>{(company as any).reviews_count ?? 0} {isBn ? "রিভিউ" : "reviews"}</span>
                    </div>
                    <button className="w-full border border-[#059669] text-[#059669] py-1.5 rounded-lg text-xs font-semibold hover:bg-[#059669] hover:text-white transition-all duration-200 cursor-pointer">
                      {isBn ? "বিস্তারিত দেখুন" : "Details"}
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {/* Fallback static company cards */}
            {(isBn ? [
              { name: "BRAC", color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-950/50", border: "border-pink-200 dark:border-pink-800", jobs: "20+" },
              { name: "Grameenphone", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/50", border: "border-blue-200 dark:border-blue-800", jobs: "15+" },
              { name: "IDLC", color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/50", border: "border-red-200 dark:border-red-800", jobs: "10+" },
              { name: "ACI", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/50", border: "border-emerald-200 dark:border-emerald-800", jobs: "18+" },
              { name: "Robi", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/50", border: "border-orange-200 dark:border-orange-800", jobs: "12+" },
              { name: "Evaly", color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/50", border: "border-violet-200 dark:border-violet-800", jobs: "12+" },
            ] : [
              { name: "BRAC", color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-950/50", border: "border-pink-200 dark:border-pink-800", jobs: "20+" },
              { name: "Grameenphone", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/50", border: "border-blue-200 dark:border-blue-800", jobs: "15+" },
              { name: "IDLC", color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/50", border: "border-red-200 dark:border-red-800", jobs: "10+" },
              { name: "ACI", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/50", border: "border-emerald-200 dark:border-emerald-800", jobs: "18+" },
              { name: "Robi", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/50", border: "border-orange-200 dark:border-orange-800", jobs: "12+" },
              { name: "Evaly", color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/50", border: "border-violet-200 dark:border-violet-800", jobs: "12+" },
            ]).map((c, i) => (
              <div key={i} className={`${c.bg} ${c.border} border rounded-xl p-4 text-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`}>
                <div className={`h-12 flex items-center justify-center mb-2 font-bold ${c.color} text-xl`}>
                  {c.name}
                </div>
                <h4 className="font-bold text-foreground text-sm">{c.name}</h4>
                <p className="text-xs text-muted-foreground mb-2 font-medium">{c.jobs} {isBn ? "পদে নিয়োগ" : "open positions"}</p>
                <p className="text-xs text-muted-foreground mb-3 flex items-center justify-center">
                  <MapPin className="w-3 h-3 mr-1" /> {isBn ? "ঢাকা" : "Dhaka"}
                </p>
                <button className="w-full border border-[#059669] text-[#059669] py-1.5 rounded-lg text-xs font-semibold hover:bg-[#059669] hover:text-white transition-all duration-200 cursor-pointer">
                  {isBn ? "বিস্তারিত দেখুন" : "Details"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ═══ Service Features Grid ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {(() => {
            const features = (hpData?.homepage_features_grid && Array.isArray(hpData.homepage_features_grid))
              ? hpData.homepage_features_grid.filter((item: any) => item.enabled !== false)
              : DEFAULT_SERVICE_FEATURES;

            return features.map((card: any, idx: number) => {
              const IconComp = ICON_MAP[card.icon] || Briefcase;
              const cardBg = isDark ? card.bg_color_dark : card.bg_color;
              const cardText = isDark ? card.text_color_dark : card.text_color;
              const btnBg = isDark ? card.button_bg_dark : card.button_bg;
              const btnText = isDark ? card.button_text_color_dark : card.button_text_color;

              const featGradFrom = card.gradient_from;
              const featGradVia = card.gradient_via;
              const featGradTo = card.gradient_to;
              const featBg = featGradFrom && featGradVia && featGradTo ? `linear-gradient(to right, ${featGradFrom}, ${featGradVia}, ${featGradTo})` : cardBg;
              return (
                <div
                  key={idx}
                  className="rounded-xl p-5 flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                  style={{ background: featBg, color: cardText }}
                >
                  <div>
                    <h3 className="font-bold mb-1">
                      {isBn ? card.title_bn : card.title}
                    </h3>
                    <p className="text-xs mb-4 opacity-80">
                      {isBn ? card.description_bn : card.description}
                    </p>
                    <div className="h-24 bg-white/50 dark:bg-white/10 rounded flex items-center justify-center mb-4">
                      <IconComp className="w-10 h-10" style={{ color: btnBg }} />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                    let targetUrl = card.url;
                    if (!targetUrl || targetUrl === "/resume-builder" || targetUrl === "/cv-builder" || targetUrl === "/dashboard/cv-builder" || targetUrl === "/candidate/resume/create" || targetUrl.includes("cv") || targetUrl.includes("resume")) {
                      if (!targetUrl.includes("/dashboard/job-alerts") && !targetUrl.includes("/pricing") && !targetUrl.includes("/jobs")) {
                        targetUrl = "/resume-builder/template";
                      }
                    }
                    router.push(targetUrl);
                  }}
                    className="w-full py-2 rounded text-sm font-medium transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{ backgroundColor: btnBg, color: btnText }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    {isBn ? card.button_text_bn : card.button_text}
                  </button>
                </div>
              );
            });
          })()}
        </div>
      </section>

      {/* ═══ AI Assistant Section ═══ */}
      {(() => {
        const ai = hpData?.homepage_ai_assistant;
        if (ai && ai.enabled === false) return null;
        const aiBadge = isBn ? (ai?.badge_bn || "নতুন ফিচার") : (ai?.badge || "New Feature");
        const aiTitle = isBn ? (ai?.title_bn || "স্মার্ট এআই ক্যারিয়ার সহকারী") : (ai?.title || "Smart AI Career Assistant");
        const aiDesc = isBn ? (ai?.description_bn || "আপনার জীবনবৃত্তান্ত তৈরি, ইন্টারভিউ প্রস্তুতি, বেতন সম্পর্কে ধারণা এবং ক্যারিয়ার গাইডেন্সের জন্য চ্যাট করুন আমাদের এআই সহকারীর সাথে।") : (ai?.description || "Chat with our AI career assistant to prepare for interviews, optimize your CV, predict salaries, and receive personalized career guidance.");
        const aiBtn1 = isBn ? (ai?.button_text_bn || "এআই এর সাথে কথা বলুন") : (ai?.button_text || "Chat with AI Now");
        const aiBtn2 = isBn ? (ai?.button2_text_bn || "ক্যারিয়ার রোডম্যাপ") : (ai?.button2_text || "Career Roadmap");
        const aiUrl = ai?.button_url || "/ai-assistant";
        const aiUrl2 = ai?.button2_url || "/ai-assistant";
        const gFrom = ai?.gradient_from || '#6366F1';
        const gVia = ai?.gradient_via || '#7C3AED';
        const gTo = ai?.gradient_to || '#D946EF';
        return (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="relative overflow-hidden rounded-2xl p-8 md:p-12 shadow-xl hover:shadow-2xl transition-all duration-300 group" style={{ background: `linear-gradient(to right, ${gFrom}, ${gVia}, ${gTo})` }}>
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-black/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-white max-w-2xl text-center md:text-left">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white mb-4 uppercase tracking-wider animate-bounce">
                    <Sparkles className="w-3.5 h-3.5 fill-white" />
                    {aiBadge}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4 tracking-tight">{aiTitle}</h2>
                  <p className="text-white/90 text-base md:text-lg mb-6 font-medium">{aiDesc}</p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <button
                      onClick={() => router.push(aiUrl)}
                      className="bg-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 active:scale-95 transition-all duration-200 flex items-center gap-2 text-sm md:text-base cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/50"
                      style={{ color: gVia }}
                    >
                      {aiBtn1}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => router.push(aiUrl2)}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-5 py-3 rounded-xl active:scale-95 transition-all duration-200 text-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/50"
                    >
                      {aiBtn2}
                    </button>
                  </div>
                </div>
                <div className="relative flex items-center justify-center w-40 h-40 md:w-48 md:h-48 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-inner group-hover:rotate-6 transition-transform duration-500">
                  <Sparkles className="w-20 h-20 text-white animate-pulse" />
                  <div className="absolute inset-0 rounded-full border border-dashed border-white/30 animate-[spin_20s_linear_infinite]" />
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ═══ Promo Banner ═══ */}
      {(() => {
        const banner = hpData?.homepage_offer_banner;
        const bTitle = isBn ? (banner?.title_bn || "আপনার প্রতিষ্ঠানের বিজ্ঞাপন দিন") : (banner?.title || "Advertise Your Organization");
        const bSubtitle = isBn ? (banner?.subtitle_bn || "লক্ষ লক্ষ প্রার্থীর কাছে পৌঁছে যান") : (banner?.subtitle || "Reach Millions of Candidates");
        const bBtn = isBn ? (banner?.button_text_bn || "বিজ্ঞাপন দিন") : (banner?.button_text || "Advertise Now");
        const bBg = banner?.bg_color || '#1C2541';
        const bTextColor = banner?.text_color || '#FFFFFF';
        const bDiscountTag = isBn ? (banner?.discount_tag_bn || "বিশেষ অফার") : (banner?.discount_tag || "Special Offer");
        const bDiscountText = banner?.discount_text || "50% OFF";
        const bDiscountSub = isBn ? (banner?.discount_subtext_bn || "সীমিত সময়ের জন্য") : (banner?.discount_subtext || "Limited Time Offer");
        return (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="rounded-xl flex flex-col md:flex-row items-center justify-between p-6 overflow-hidden relative" style={{ backgroundColor: bBg, color: bTextColor }}>
              <div className="z-10 md:w-1/2 mb-4 md:mb-0">
                <h2 className="text-2xl font-bold mb-1">{bTitle}</h2>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#FACC15' }}>{bSubtitle}</h2>
                <button
                  onClick={() => router.push("/pricing")}
                  className="bg-yellow-400 text-[#0B132B] font-bold px-6 py-2 rounded shadow hover:bg-yellow-300 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-400"
                >
                  {bBtn}
                </button>
              </div>
              <div className="z-10 flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-white text-sm font-bold">{bDiscountTag}</p>
                  <p className="text-green-400 text-3xl font-bold">{bDiscountText}</p>
                </div>
                <div className="text-white border-l border-white/20 pl-6">
                  <p className="text-sm">{bDiscountSub}</p>
                </div>
              </div>
              <Rocket className="absolute right-1/2 bottom-0 w-32 h-32 text-white/10 transform translate-x-1/2 translate-y-4 -rotate-45" />
            </div>
          </section>
        );
      })()}

      {/* ═══ Bottom Info Section ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Important Links */}
          {(() => {
            const qlBg = hpData?.homepage_quick_links?.[0]?.bg_color || '#ECFDF5';
            const qlText = hpData?.homepage_quick_links?.[0]?.text_color || '#065F46';
            const qlIcon = hpData?.homepage_quick_links?.[0]?.icon_color || '#059669';
            return (
              <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: qlBg, color: qlText, border: `1px solid ${qlIcon}33` }}>
                <h3 className="text-lg font-bold border-b pb-2 mb-4" style={{ borderColor: `${qlIcon}33` }}>
                  {isBn ? "গুরুত্বপূর্ণ লিংক" : "Important Links"}
                </h3>
                <ul className="space-y-3 text-sm">
                  {(hpData?.homepage_quick_links || IMPORTANT_LINKS).map((link: any, i: number) => {
                    const LinkIcon = link.icon ? (ICON_MAP[link.icon] || FileText) : (link.icon ? FileText : IMPORTANT_LINKS[i]?.icon || FileText);
                    const href = link.url || link.href || "#";
                    const label = isBn ? (link.title_bn || link.bn || link.title || "") : (link.title || link.en || "");
                    const linkIconColor = link.icon_color || qlIcon;
                    return (
                      <li key={i}>
                        <Link
                          href={href}
                          className="flex items-center justify-between cursor-pointer transition-colors group hover:opacity-80"
                        >
                          <div className="flex items-center">
                            <LinkIcon className="w-4 h-4 mr-2 shrink-0" style={{ color: linkIconColor }} />
                            <span className="font-medium">{label}</span>
                          </div>
                          <ChevronRight className="w-3 h-3 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <button
                  onClick={() => router.push("/jobs")}
                  className="w-full mt-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm text-white"
                  style={{ backgroundColor: qlIcon }}
                >
                  {isBn ? "সব লিংক দেখুন" : "View All Links"}
                </button>
              </div>
            );
          })()}

          {/* Notice Board */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm">
            <div className="flex justify-between items-center border-b border-blue-200 dark:border-blue-700 pb-2 mb-4">
              <h3 className="text-lg font-bold text-foreground">
                {isBn ? "নোটিশ বোর্ড" : "Notice Board"}
              </h3>
              <Link href="/notices" className="text-[#059669] text-xs font-semibold hover:underline flex items-center">
                {isBn ? "সব নোটিশ দেখুন" : "View All"}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <Skeleton className="h-5 w-14 mt-0.5" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                    <Skeleton className="h-3 w-16 ml-2" />
                  </div>
                ))
              ) : notices.length > 0 ? (
                notices.map((notice: any, i: number) => {
                  const categoryColors: Record<string, string> = {
                    "নিয়োগ": "bg-blue-50 text-blue-600",
                    "recruitment": "bg-blue-50 text-blue-600",
                    "নোটিশ": "bg-purple-50 text-purple-600",
                    "notice": "bg-purple-50 text-purple-600",
                    "ফলাফল": "bg-green-50 text-green-600",
                    "result": "bg-green-50 text-green-600",
                  };
                  const cat = isBn ? notice.category_bn : notice.category;
                  const catClass = categoryColors[cat] || "bg-blue-50 text-blue-600";

                  return (
                    <Link key={i} href={`/notices#${notice.id || notice.slug || ""}`} className="flex items-start justify-between hover:bg-muted rounded p-1 transition-colors">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <span className={`${catClass} text-[10px] px-2 py-0.5 rounded font-bold mt-0.5 shrink-0`}>
                          {cat}
                        </span>
                        <p className="text-sm text-foreground hover:text-[#059669] line-clamp-2">
                          {isBn ? notice.title_bn : notice.title}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2 shrink-0">
                        {notice.published_at}
                      </span>
                    </Link>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {isBn ? "কোনো নোটিশ নেই" : "No notices yet"}
                </p>
              )}
            </div>
          </div>

          {/* Ad / CTA Card */}
          {(() => {
            const callout = hpData?.homepage_recruitment_callout;
            const cTitle = isBn ? (callout?.title_bn || "প্রতিভা খুঁজছেন?") : (callout?.title || "Looking for Talent?");
            const cDesc = isBn ? (callout?.description_bn || "সেরা প্রার্থীদের সাথে ক্যারিয়ার গড়ুন") : (callout?.description || "Build careers with top candidates");
            const cBtn = isBn ? (callout?.button_text_bn || "পোস্ট জব করুন") : (callout?.button_text || "Post a Job");
            const cUrl = callout?.button_url || "/employer/register";
            const cBg = callout?.bg_color || '#12684F';
            const cTextColor = callout?.text_color || '#FFFFFF';
            const IconComp = callout?.icon ? (ICON_MAP[callout.icon] || Megaphone) : Megaphone;
            return (
              <div className="rounded-lg p-6 flex flex-col justify-between relative overflow-hidden min-h-[300px]" style={{ backgroundColor: cBg, color: cTextColor }}>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-1">{cTitle}</h3>
                  <p className="text-lg">{cDesc}</p>
                </div>
                <div className="mt-8 relative z-10">
                  <button
                    onClick={() => router.push(cUrl)}
                    className="bg-transparent border border-white text-white hover:bg-white px-6 py-2 rounded transition-colors text-sm font-medium"
                    style={{ ['--tw-hover-text' as any]: cBg }}
                  >
                    {cBtn}
                  </button>
                </div>
                <IconComp className="absolute right-2 bottom-4 w-24 h-24 text-white/20" />
              </div>
            );
          })()}
        </div>
      </section>

      {/* ═══ Newsletter ═══ */}
      {(() => {
        const nl = hpData?.homepage_newsletter;
        if (nl && nl.enabled === false) return null;
        const nlTitle = isBn ? (nl?.title_bn || "চাকরির খবর পেতে সাবস্ক্রাইব করুন") : (nl?.title || "Subscribe for Job Updates");
        const nlDesc = isBn ? (nl?.description_bn || "নিয়মিত চাকরির খবর ও আপডেট পেতে এখনই সাবস্ক্রাইব করুন") : (nl?.description || "Subscribe now to get regular job news and updates");
        const nlBtn = isBn ? (nl?.button_text_bn || "সাবস্ক্রাইব করুন") : (nl?.button_text || "Subscribe");
        const nlBg = nl?.bg_color || '#059669';
        const nlTextColor = nl?.text_color || '#FFFFFF';
        const nlBtnColor = nl?.button_color || '#FFFFFF';
        return (
          <section style={{ backgroundColor: nlBg, color: nlTextColor }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-4">
                <Mail className="w-8 h-8 opacity-80 shrink-0" />
                <div>
                  <h3 className="font-bold text-lg">{nlTitle}</h3>
                  <p className="text-xs opacity-90">{nlDesc}</p>
                </div>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const email = (e.target as HTMLFormElement).email.value;
                  if (!email) return;
                  try {
                    await api.post("/subscribers", { email });
                    toast.success(isBn ? "সাবস্ক্রিপশন সফল!" : "Subscribed successfully!");
                    (e.target as HTMLFormElement).reset();
                  } catch {
                    toast.error(isBn ? "সাবস্ক্রিপশন ব্যর্থ" : "Subscription failed");
                  }
                }}
                className="flex w-full md:w-auto bg-white dark:bg-zinc-900 p-1 rounded-xl shadow-md border border-white/20 focus-within:ring-2 focus-within:ring-white/40 transition-all"
              >
                <input
                  name="email"
                  type="email"
                  required
                  placeholder={isBn ? "আপনার ইমেইল দিন" : "Enter your email"}
                  className="w-full md:w-72 px-4 py-2 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
                />
                <button type="submit" className="hover:opacity-90 px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 shadow-sm active:scale-95 whitespace-nowrap" style={{ backgroundColor: nlBtnColor, color: nlBtnColor === '#FFFFFF' ? '#1C2541' : '#FFFFFF' }}>
                  {nlBtn}
                </button>
              </form>
            </div>
          </section>
        );
      })()}
    </PublicLayout>
  );
}
