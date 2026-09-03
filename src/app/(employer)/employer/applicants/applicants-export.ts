import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { JobApplication } from "@/types";
import { getStatusLabel } from "./applicants-utils";

type ExportRow = {
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  appliedAt: string;
  profileStrength: string;
  coverLetter: string;
};

function batchToRows(apps: JobApplication[], isBn: boolean): ExportRow[] {
  const rows: ExportRow[] = [];
  for (const app of apps) {
    const user = (app as any).user || {};
    rows.push({
      jobTitle: (app as any).job?.title || `#${app.job_id}`,
      name: user.name || "Candidate",
      email: user.email || "",
      phone: user.phone || "",
      status: getStatusLabel(app.status || "pending", isBn),
      appliedAt: app.created_at || app.applied_at || "",
      profileStrength: app.profile_strength != null ? `${app.profile_strength}%` : "",
      coverLetter: app.cover_letter || "",
    });
  }
  return rows;
}

function headers(isBn: boolean): string[] {
  return isBn
    ? ["চাকরি", "নাম", "ইমেইল", "ফোন", "স্ট্যাটাস", "আবেদনের তারিখ", "প্রোফাইল শক্তি", "কভার লেটার"]
    : ["Job", "Name", "Email", "Phone", "Status", "Applied Date", "Profile Strength", "Cover Letter"];
}

export function exportApplicantsExcel(apps: JobApplication[], isBn: boolean) {
  const rows = batchToRows(apps, isBn);
  const sheet = XLSX.utils.json_to_sheet(rows.map((r) => ({
    [headers(isBn)[0]]: r.jobTitle,
    [headers(isBn)[1]]: r.name,
    [headers(isBn)[2]]: r.email,
    [headers(isBn)[3]]: r.phone,
    [headers(isBn)[4]]: r.status,
    [headers(isBn)[5]]: r.appliedAt,
    [headers(isBn)[6]]: r.profileStrength,
    [headers(isBn)[7]]: r.coverLetter,
  })));
  sheet["!cols"] = [
    { wch: 40 }, { wch: 22 }, { wch: 28 }, { wch: 16 },
    { wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 45 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, isBn ? "আবেদনকারী" : "Applicants");
  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `applicants_${date}.xlsx`);
}

export function exportApplicantsPdf(apps: JobApplication[], isBn: boolean) {
  const doc = new jsPDF({ orientation: "landscape" });
  const title = isBn ? "আবেদনকারী তালিকা" : "Applicants List";
  const date = new Date().toLocaleDateString();
  doc.text(title, 14, 14);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`${isBn ? "মোট" : "Total"}: ${apps.length}  |  ${date}`, 14, 20);
  doc.setTextColor(0);

  const rows = batchToRows(apps, isBn).map((r) => [
    r.jobTitle,
    r.name,
    r.email,
    r.phone,
    r.status,
    r.appliedAt,
    r.profileStrength,
    r.coverLetter,
  ]);

  autoTable(doc, {
    head: [headers(isBn)],
    body: rows,
    startY: 24,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 30 },
      2: { cellWidth: 45 },
      3: { cellWidth: 28 },
      4: { cellWidth: 22 },
      5: { cellWidth: 28 },
      6: { cellWidth: 20 },
      7: { cellWidth: 55 },
    },
  });

  const filename = `applicants_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
  return filename;
}