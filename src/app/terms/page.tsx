"use client";

import { useEffect, useState } from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import api from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { useThemeStore } from "@/store/theme-store";
import DOMPurify from "isomorphic-dompurify";

export default function TermsPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const { settings } = useThemeStore();
  const siteName = settings.site_name || process.env.NEXT_PUBLIC_APP_NAME || "eJobs";
  const domain = siteName.toLowerCase().replaceAll(" ", "") + ".bd";
  const supportEmail = settings.support_email || `support@${domain}`;

  useEffect(() => {
    api
      .get("/pages/terms")
      .then((res) => setContent(res.data?.data?.content || ""))
      .catch(() => setContent(""))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
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
                Welcome to {domain} (&quot;{siteName},&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). These Terms of Service (&quot;Terms&quot;) govern your access to and use of our job portal platform, including all features, tools, and services offered through <a href={`https://${domain}`} className="underline">{domain}</a> (the &quot;Platform&quot;). By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree, please do not use the Platform.
              </p>

              <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p>
                By creating an account, browsing, applying for jobs, posting listings, or otherwise using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and our <a href="/privacy" className="underline">Privacy Policy</a>. These Terms constitute a legally binding agreement between you and {siteName}.
              </p>
              <p>
                We reserve the right to modify these Terms at any time. Material changes will be communicated via email or a prominent notice on the Platform. Your continued use of the Platform after such changes constitutes acceptance of the updated Terms.
              </p>

              <h2 className="text-xl font-semibold text-foreground">2. User Accounts</h2>
              <p>
                <strong>Eligibility:</strong> You must be at least 18 years of age to create an account and use the Platform. By creating an account, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these Terms.
              </p>
              <p>
                <strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials (email and password) and for all activities that occur under your account. You agree to immediately notify us at <a href={`mailto:${supportEmail}`} className="underline">{supportEmail}</a> of any unauthorized use of your account.
              </p>
              <p>
                <strong>Account Accuracy:</strong> You agree to provide accurate, current, and complete information during registration and to keep your account information up to date. Providing false, misleading, or fraudulent information is a violation of these Terms and may result in immediate account termination.
              </p>
              <p>
                <strong>One Account Per User:</strong> Each individual may maintain only one active account. Creating multiple accounts to circumvent restrictions, quotas, or policies is strictly prohibited.
              </p>

              <h2 className="text-xl font-semibold text-foreground">3. Job Listings &amp; Applications</h2>
              <p>
                <strong>For Employers:</strong> When posting a job listing, you agree that:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>All job listings are accurate, current, and reflect genuine employment opportunities.</li>
                <li>Listings do not discriminate on the basis of race, religion, gender, age, disability, national origin, or any other characteristic protected by Bangladeshi law.</li>
                <li>You will respond to applications in a timely and professional manner.</li>
                <li>Job listings do not violate any applicable laws or regulations.</li>
                <li>You have the legal authority to offer the positions described.</li>
              </ul>
              <p>
                <strong>For Job Seekers:</strong> When applying for jobs, you agree that:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>All information in your applications and profile is truthful, accurate, and current.</li>
                <li>You will not submit spam, fake applications, or otherwise abuse the application system.</li>
                <li>You understand that {siteName} does not guarantee job placement or employment.</li>
              </ul>
              <p>
                <strong>Content Moderation:</strong> We reserve the right to review, edit, or remove any job listing or application that violates these Terms or applicable law, without prior notice.
              </p>

              <h2 className="text-xl font-semibold text-foreground">4. Payment &amp; Wallet Terms</h2>
              <p>
                The Platform offers premium services, subscriptions, and promotional features that require payment. The following terms apply to all financial transactions on the Platform:
              </p>

              <h3 className="text-lg font-medium text-foreground">Escrow System</h3>
              <p>
                Certain transactions (including job boosts, premium listings, and CV template purchases) are processed through our secure escrow system. Funds are held in escrow by {siteName} until the service has been delivered or the transaction is confirmed. This protects both buyers and sellers on the Platform.
              </p>

              <h3 className="text-lg font-medium text-foreground">Wallet Deposits</h3>
              <p>
                You may add funds to your {siteName} wallet via supported payment methods. Deposited funds are non-transferable between accounts and are subject to the following:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Minimum deposit amount: 100 BDT</li>
                <li>Funds are available in your wallet immediately upon successful payment processing.</li>
                <li>Wallet balances do not earn interest.</li>
                <li>You are responsible for maintaining the security of your wallet access.</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground">Withdrawals</h3>
              <p>
                If you are an employer with funds earned through the Platform (e.g., refund credits), you may request a withdrawal to your registered bank account or mobile financial service (bKash, Nagad, etc.). Withdrawals are subject to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Minimum withdrawal amount: 500 BDT</li>
                <li>Processing time: 3-7 business days</li>
                <li>Identity verification may be required for withdrawals exceeding 10,000 BDT</li>
                <li>A transaction fee of 2% may apply</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground">Refund Policy</h3>
              <p>
                All payments made on the Platform are generally <strong>non-refundable</strong> once the service has been delivered. Refunds may be issued in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>The purchased service was not delivered as described.</li>
                <li>A duplicate charge was made due to a technical error.</li>
                <li>The transaction was unauthorized (subject to investigation).</li>
              </ul>
              <p>
                Refund requests must be submitted within 7 days of the transaction via <a href={`mailto:${supportEmail}`} className="underline">{supportEmail}</a>. Approved refunds will be credited to your {siteName} wallet within 5-10 business days. We do not issue cash refunds except where required by Bangladeshi consumer protection law.
              </p>

              <h2 className="text-xl font-semibold text-foreground">5. Dispute Resolution</h2>
              <p>
                If a dispute arises between you and another user on the Platform, we encourage you to first attempt to resolve it directly. If direct resolution fails, you may file a dispute through our built-in dispute resolution system.
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Disputes must be filed within 14 days of the transaction or event in question.</li>
                <li>Both parties will be given an opportunity to present their case with supporting evidence.</li>
                <li>{siteName} will review the dispute and issue a decision within 10 business days.</li>
                <li>{siteName}&apos;s decision is final and binding for matters conducted through the Platform&apos;s escrow system.</li>
                <li>For disputes involving amounts exceeding 50,000 BDT, either party may seek resolution through the courts of Bangladesh.</li>
              </ul>

              <h2 className="text-xl font-semibold text-foreground">6. Intellectual Property</h2>
              <p>
                All content, trademarks, logos, graphics, software, and other materials on the Platform are the property of {siteName} or its licensors and are protected by applicable intellectual property laws of Bangladesh.
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>You may not copy, reproduce, distribute, modify, or create derivative works from any content on the Platform without our prior written consent.</li>
                <li>You retain ownership of content you upload (resumes, profile photos, etc.), but you grant {siteName} a non-exclusive, worldwide license to use, display, and distribute such content solely for the purpose of operating and improving the Platform.</li>
                <li>You may not use {siteName}&apos;s name, logo, or branding in any manner that implies endorsement or affiliation without written permission.</li>
                <li>Automated scraping, crawling, or data extraction from the Platform is strictly prohibited.</li>
              </ul>

              <h2 className="text-xl font-semibold text-foreground">7. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable law:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>The Platform is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether express or implied.</li>
                <li>{siteName} does not guarantee the accuracy, completeness, or reliability of any job listings, employer information, or candidate profiles.</li>
                <li>We are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform.</li>
                <li>Our total liability to you shall not exceed the amount you paid to us in the 12 months preceding the claim.</li>
                <li>We are not responsible for the actions, content, or services of third parties accessed through or linked from the Platform.</li>
              </ul>

              <h2 className="text-xl font-semibold text-foreground">8. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless {siteName}, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys&apos; fees) arising from or relating to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your use of the Platform or any services obtained through it.</li>
                <li>Your violation of these Terms or any applicable law or regulation.</li>
                <li>Your violation of any third-party rights, including intellectual property, privacy, or publicity rights.</li>
                <li>Any content you submit, post, or transmit through the Platform.</li>
              </ul>

              <h2 className="text-xl font-semibold text-foreground">9. Governing Law</h2>
              <p>
                These Terms are governed by and construed in accordance with the laws of the People&apos;s Republic of Bangladesh. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Dhaka, Bangladesh. Both parties agree to submit to the personal jurisdiction of such courts.
              </p>

              <h2 className="text-xl font-semibold text-foreground">10. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account and access to the Platform at our sole discretion, with or without notice, for any reason, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Violation of these Terms or any applicable law.</li>
                <li>Fraudulent, deceptive, or harmful conduct.</li>
                <li>Non-payment of fees or charges.</li>
                <li>Extended inactivity (accounts inactive for 36+ months).</li>
                <li>Requests by law enforcement or government agencies.</li>
              </ul>
              <p>
                Upon termination:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your right to access and use the Platform ceases immediately.</li>
                <li>Any outstanding wallet balance (excluding earned credits from disputes) may be withdrawn within 30 days of termination notice.</li>
                <li>We may retain certain data as required by law or for legitimate business purposes, as described in our Privacy Policy.</li>
                <li>Sections 6, 7, 8, and 9 of these Terms survive termination.</li>
              </ul>

              <h2 className="text-xl font-semibold text-foreground">11. Contact Information</h2>
              <p>
                If you have any questions, concerns, or feedback about these Terms, please contact us:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Email:</strong> <a href={`mailto:${supportEmail}`} className="underline">{supportEmail}</a></li>
                <li><strong>Website:</strong> <a href={`https://${domain}`} className="underline">https://{domain}</a></li>
              </ul>
              <p>
                We aim to respond to all inquiries within 3 business days.
              </p>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
