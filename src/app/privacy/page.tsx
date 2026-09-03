"use client";

import { useEffect, useState } from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import api from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { useThemeStore } from "@/store/theme-store";
import DOMPurify from "isomorphic-dompurify";

export default function PrivacyPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const { settings } = useThemeStore();
  const siteName = settings.site_name || process.env.NEXT_PUBLIC_APP_NAME || "eJobs";
  const domain = siteName.toLowerCase().replaceAll(" ", "") + ".bd";
  const supportEmail = settings.support_email || `support@${domain}`;

  useEffect(() => {
    api
      .get("/pages/privacy")
      .then((res) => setContent(res.data?.data?.content || ""))
      .catch(() => setContent(""))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          {loading ? (
            <div className="space-y-4">
               {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          ) : content ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
            />
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
              <p>Last updated: June 2025</p>
              <p>
                Welcome to {domain} (&quot;{siteName},&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our job portal platform and related services. We are committed to protecting your privacy in compliance with the Bangladesh Digital Protection Act 2018 (DPA), the forthcoming Bangladesh Data Protection Act (DPDPA), and applicable international data protection regulations.
              </p>

              <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>

              <h3 className="text-lg font-medium text-foreground">Personal Information</h3>
              <p>
                When you create an account, apply for jobs, or interact with our platform, we may collect:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Full name, email address, phone number, and physical address</li>
                <li>National ID number (NID), date of birth, and gender (where required by employers)</li>
                <li>Professional title, work experience, and employment history</li>
                <li>Profile photographs and profile biographies</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground">Resume &amp; Career Data</h3>
              <p>
                We collect information you voluntarily provide through our resume builder and job application features, including:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Education history, certifications, and professional qualifications</li>
                <li>Skills, competencies, and language proficiencies</li>
                <li>Portfolio links, project descriptions, and professional references</li>
                <li>Salary expectations and job preferences</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground">Usage &amp; Technical Data</h3>
              <p>
                We automatically collect certain information when you access our platform:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>IP address, browser type, operating system, and device identifiers</li>
                <li>Pages visited, time spent on pages, click patterns, and search queries</li>
                <li>Referring URLs and exit pages</li>
                <li>Geographic location data (city/region level only)</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground">Cookies &amp; Tracking Data</h3>
              <p>
                We use cookies, web beacons, and similar technologies to collect information about your browsing behavior. This includes session cookies, persistent cookies, and analytics cookies provided by third-party services such as Google Analytics. For full details, see Section 6 below.
              </p>

              <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
              <p>We use the information we collect for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Service Delivery:</strong> To provide, operate, and maintain the {siteName} platform, including account management, job search, and application processing.</li>
                <li><strong>Job Matching:</strong> To match candidates with relevant job opportunities and recommend positions based on skills, experience, and preferences.</li>
                <li><strong>Communication:</strong> To send you job alerts, application status updates, platform notifications, and administrative messages.</li>
                <li><strong>Improvement:</strong> To analyze usage patterns, conduct research, and improve our platform features, user experience, and service quality.</li>
                <li><strong>Security:</strong> To detect, prevent, and address fraud, unauthorized access, and other malicious activities.</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes in Bangladesh.</li>
                <li><strong>Marketing:</strong> To send promotional materials and newsletters (only with your explicit consent, which you may withdraw at any time).</li>
              </ul>

              <h2 className="text-xl font-semibold text-foreground">3. Data Retention</h2>
              <p>
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Specifically:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Active Accounts:</strong> Your data is retained for the duration of your active account.</li>
                <li><strong>Inactive Accounts:</strong> If your account has been inactive for more than 24 months, we will send you a notification. Accounts inactive for 36 months may be subject to deactivation.</li>
                <li><strong>Job Applications:</strong> Application data is retained for 12 months after the job listing expires, unless you request earlier deletion.</li>
                <li><strong>Resume Data:</strong> If you use our resume builder, your resume data is retained until you delete it or close your account.</li>
                <li><strong>Legal Obligations:</strong> Certain data may be retained longer to comply with legal obligations, resolve disputes, and enforce our agreements.</li>
              </ul>

              <h2 className="text-xl font-semibold text-foreground">4. Data Sharing &amp; Third Parties</h2>
              <p>We may share your information with the following categories of third parties:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Employers:</strong> When you apply for a job, your profile information and application materials are shared with the prospective employer for recruitment purposes.</li>
                <li><strong>Service Providers:</strong> We engage trusted third-party companies for hosting, analytics, payment processing, email delivery, and customer support. These providers are contractually bound to use your data only for the services they provide to us.</li>
                <li><strong>Legal Authorities:</strong> We may disclose your information if required by law, court order, or governmental regulation under the Bangladesh Digital Protection Act 2018.</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred to the successor entity with appropriate notice.</li>
              </ul>
              <p>
                We do <strong>not</strong> sell your personal information to third parties for their independent marketing purposes. We do not share your data with any party without a lawful basis as defined under the DPA and DPDPA.
              </p>

              <h2 className="text-xl font-semibold text-foreground">5. Your Rights Under Bangladesh Law</h2>
              <p>
                Under the Bangladesh Digital Protection Act 2018 and the forthcoming Data Protection Act (DPDPA), you have the following rights with respect to your personal data:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Right of Access:</strong> You may request a copy of all personal data we hold about you.</li>
                <li><strong>Right to Rectification:</strong> You may request correction of inaccurate or incomplete personal data.</li>
                <li><strong>Right to Erasure:</strong> You may request deletion of your personal data, subject to our legal retention obligations.</li>
                <li><strong>Right to Restrict Processing:</strong> You may request that we limit the processing of your personal data in certain circumstances.</li>
                <li><strong>Right to Data Portability:</strong> You may request your personal data in a structured, commonly used, machine-readable format.</li>
                <li><strong>Right to Withdraw Consent:</strong> Where we process your data based on consent, you may withdraw that consent at any time.</li>
                <li><strong>Right to Object:</strong> You may object to the processing of your personal data for direct marketing purposes.</li>
                <li><strong>Right to Lodge a Complaint:</strong> If you believe your data protection rights have been violated, you may file a complaint with the relevant authority in Bangladesh.</li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at <a href={`mailto:${supportEmail}`} className="underline">{supportEmail}</a>. We will respond to your request within 30 days.
              </p>

              <h2 className="text-xl font-semibold text-foreground">6. Cookies &amp; Tracking Technologies</h2>
              <p>We use the following types of cookies:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Essential Cookies:</strong> Required for the platform to function properly (e.g., session management, authentication). These cannot be disabled.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our platform (e.g., Google Analytics). These collect anonymized data.</li>
                <li><strong>Functional Cookies:</strong> Enable enhanced functionality such as remembering your preferences and settings.</li>
                <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements and track campaign performance. These are only set with your explicit consent.</li>
              </ul>
              <p>
                You can manage your cookie preferences through our Cookie Consent banner or by adjusting your browser settings. Please note that disabling certain cookies may affect platform functionality.
              </p>

              <h2 className="text-xl font-semibold text-foreground">7. Data Security</h2>
              <p>
                We implement robust technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction, including:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Encryption of data in transit (TLS 1.2+) and at rest (AES-256)</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Role-based access controls for internal systems</li>
                <li>Employee training on data protection and privacy practices</li>
                <li>Incident response procedures aligned with the Bangladesh Digital Protection Act 2018</li>
              </ul>
              <p>
                While we strive to protect your data, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security but will promptly notify affected users and relevant authorities in the event of a data breach, as required by law.
              </p>

              <h2 className="text-xl font-semibold text-foreground">8. Children&apos;s Privacy</h2>
              <p>
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal data from a child under 18 without verification of parental consent, we will take steps to delete that information promptly. If you are a parent or guardian and believe your child has provided us with personal data, please contact us at <a href={`mailto:${supportEmail}`} className="underline">{supportEmail}</a>.
              </p>

              <h2 className="text-xl font-semibold text-foreground">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by posting the updated policy on this page with a revised &quot;Last updated&quot; date and, where appropriate, sending you an email notification. We encourage you to review this page periodically for the latest information on our privacy practices.
              </p>

              <h2 className="text-xl font-semibold text-foreground">10. Contact Information</h2>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Email:</strong> <a href={`mailto:${supportEmail}`} className="underline">{supportEmail}</a></li>
                <li><strong>Website:</strong> <a href={`https://${domain}`} className="underline">https://{domain}</a></li>
              </ul>
              <p>
                We aim to respond to all privacy-related inquiries within 30 business days.
              </p>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
