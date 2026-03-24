"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, Lock, Eye, Server, Globe, UserCheck, Clock, Mail } from "lucide-react";
import { SiteNav } from "@/components/site-nav";

const sections = [
  {
    icon: Eye,
    title: "1. Information We Collect",
    items: [
      "Account Information: When you register, we collect your name, email address, company name, phone number, and business registration details (CIN, GSTIN).",
      "Transaction Data: Details of escrow transactions including product descriptions, quantities, pricing, delivery timelines, and transaction status.",
      "Verification Data: Company verification documents, authorized representative information, and authentication tokens generated during escrow workflows.",
      "Usage Data: Log data such as IP addresses, browser type, pages visited, time spent, and referring URLs collected automatically when you use our platform.",
      "Communication Data: Messages exchanged through our support channels, dispute resolution communications, and feedback you provide.",
    ],
  },
  {
    icon: Server,
    title: "2. How We Use Your Information",
    items: [
      "To create and manage your account, verify your identity, and authenticate your access to the platform.",
      "To facilitate escrow transactions between buyers and sellers, including token generation, payment processing, and delivery confirmation.",
      "To communicate with you regarding transaction updates, security alerts, service announcements, and support inquiries.",
      "To detect, prevent, and address fraud, unauthorized access, and other security threats to protect you and our platform.",
      "To comply with applicable legal obligations, resolve disputes, and enforce our Terms of Service.",
      "To improve our platform, develop new features, and analyze usage patterns to enhance user experience.",
    ],
  },
  {
    icon: Globe,
    title: "3. Information Sharing & Disclosure",
    items: [
      "Transaction Counterparties: We share relevant transaction details with the buyer or seller involved in a specific escrow transaction.",
      "Service Providers: We may share data with third-party vendors who assist us in operating the platform (e.g., cloud hosting, email delivery, payment processing).",
      "Legal Requirements: We may disclose information if required by law, court order, or government regulation, or to protect the rights and safety of TrustChain and its users.",
      "Business Transfers: In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.",
      "We do not sell your personal information to third parties for advertising or marketing purposes.",
    ],
  },
  {
    icon: Lock,
    title: "4. Data Security",
    items: [
      "We implement industry-standard encryption (TLS 1.3) for all data transmitted between your browser and our servers.",
      "Sensitive data such as authentication tokens and verification documents are encrypted at rest using AES-256 encryption.",
      "Access to personal information is restricted to authorized personnel who require it for legitimate business purposes.",
      "We conduct regular security audits, penetration testing, and vulnerability assessments to maintain platform integrity.",
      "In the event of a data breach, we will notify affected users and relevant authorities within 72 hours as required by applicable law.",
    ],
  },
  {
    icon: UserCheck,
    title: "5. Your Rights & Choices",
    items: [
      "Access & Portability: You can request a copy of all personal data we hold about you in a structured, machine-readable format.",
      "Correction: You can update or correct inaccurate personal information through your account settings or by contacting support.",
      "Deletion: You can request deletion of your account and associated personal data, subject to legal retention requirements.",
      "Opt-Out: You can opt out of non-essential communications at any time through your notification preferences.",
      "Restriction: You can request that we limit the processing of your personal data under certain circumstances.",
    ],
  },
  {
    icon: Clock,
    title: "6. Data Retention",
    items: [
      "Active account data is retained for the duration of your account relationship with TrustChain.",
      "Transaction records are retained for a minimum of 7 years to comply with financial regulatory requirements.",
      "Dispute-related records are retained for 5 years after resolution to support any potential legal proceedings.",
      "Upon account deletion, personal data is purged within 30 days, except where retention is required by law.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col text-slate-900 dark:text-slate-100 font-display">
      <div className="fixed inset-0 z-0 bg-pattern pointer-events-none" />
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] gradient-sphere z-0 pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] gradient-sphere z-0 pointer-events-none" />

      <SiteNav showRegister showLogin />

      <main className="relative z-10 flex-1 p-6 lg:p-12 max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Privacy Policy
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Last updated: March 9, 2026
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-4 text-sm leading-relaxed">
              At TrustChain, we are committed to protecting your privacy and ensuring the security of your personal information.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our B2B escrow platform.
              By using TrustChain, you agree to the collection and use of information in accordance with this policy.
            </p>
          </div>

          <div className="space-y-8">
            {sections.map((section, idx) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <section.icon className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{section.title}</h2>
                </div>
                <ul className="space-y-3">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      <span className="text-primary mt-1 shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            {/* Contact */}
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">7. Contact Us</h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us at{" "}
                <a href="mailto:privacy@trustchain.example.com" className="text-primary font-semibold hover:underline">
                  privacy@trustchain.example.com
                </a>{" "}
                or visit our{" "}
                <Link href="/support" className="text-primary font-semibold hover:underline">
                  Support page
                </Link>.
              </p>
            </div>
          </div>

          <div className="mt-10 flex gap-6">
            <Link href="/terms-of-service" className="text-primary font-semibold hover:underline text-sm">
              Terms of Service →
            </Link>
            <Link href="/support" className="text-primary font-semibold hover:underline text-sm">
              Support →
            </Link>
            <Link href="/" className="text-primary font-semibold hover:underline text-sm">
              ← Home
            </Link>
          </div>
        </motion.div>
      </main>

      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent z-10 opacity-30 pointer-events-none" />
    </div>
  );
}
