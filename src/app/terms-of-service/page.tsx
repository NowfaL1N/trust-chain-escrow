"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Scale, Ban, AlertTriangle, CreditCard, ShieldAlert, Gavel, RefreshCw, Mail } from "lucide-react";
import { SiteNav } from "@/components/site-nav";

const sections = [
  {
    icon: Scale,
    title: "1. Acceptance of Terms",
    items: [
      "By accessing or using the TrustChain platform, you agree to be bound by these Terms of Service and all applicable laws and regulations.",
      "If you are using TrustChain on behalf of a company or organization, you represent that you have the authority to bind that entity to these terms.",
      "We reserve the right to update these terms at any time. Continued use of the platform after modifications constitutes acceptance of the revised terms.",
      "You must be at least 18 years of age and have the legal capacity to enter into binding contracts to use this platform.",
    ],
  },
  {
    icon: CreditCard,
    title: "2. Escrow Services",
    items: [
      "TrustChain acts as a neutral third-party intermediary to facilitate secure B2B transactions between buyers and sellers.",
      "Funds deposited into escrow are held in designated trust accounts and are not commingled with TrustChain\u2019s operational funds.",
      "Escrow funds will only be released upon confirmation of delivery by the buyer, resolution of a dispute, or expiration of the auto-release timer (15 days by default).",
      "TrustChain charges a service fee of up to 2.5% per transaction, which is disclosed before payment confirmation.",
      "TrustChain does not guarantee the quality, safety, or legality of goods or services transacted through the platform.",
    ],
  },
  {
    icon: ShieldAlert,
    title: "3. User Accounts & Verification",
    items: [
      "You must provide accurate, current, and complete information during registration and keep your account information up to date.",
      "Company verification requires valid CIN (21 characters) and GSTIN (15 characters) for Indian-registered entities, or equivalent documentation for international companies.",
      "You are responsible for maintaining the confidentiality of your account credentials and escrow verification tokens.",
      "You must notify TrustChain immediately of any unauthorized access to your account or suspected security breaches.",
      "TrustChain reserves the right to suspend or terminate accounts that provide false information or fail verification checks.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "4. Disputes & Resolution",
    items: [
      "Buyers may raise a dispute within 15 days of delivery confirmation if the goods received do not match the agreed specifications.",
      "Upon raising a dispute, the escrow holding period is extended by 45 days to allow for investigation and resolution.",
      "Both parties must cooperate in good faith during the dispute resolution process and provide requested evidence within 7 business days.",
      "If a return is requested and approved by the seller, TrustChain will process the refund within 5 business days of receiving the returned goods.",
      "If a dispute cannot be resolved through the platform, it will be referred to binding arbitration under the rules of the relevant jurisdiction.",
      "TrustChain\u2019s decision in dispute resolution is made based on available evidence and is final, except where applicable law provides otherwise.",
    ],
  },
  {
    icon: Ban,
    title: "5. Prohibited Activities",
    items: [
      "Using the platform for any unlawful purpose or to transact in prohibited goods including weapons, drugs, counterfeit products, or stolen property.",
      "Attempting to manipulate, interfere with, or reverse-engineer the platform\u2019s security features, token generation, or payment mechanisms.",
      "Creating multiple accounts to circumvent restrictions, avoid fees, or engage in fraudulent transactions.",
      "Engaging in money laundering, terrorist financing, or any other financial crime through the platform.",
      "Harassing, threatening, or impersonating other users or TrustChain personnel.",
      "Transmitting malware, viruses, or any code designed to disrupt, damage, or gain unauthorized access to the platform.",
    ],
  },
  {
    icon: Gavel,
    title: "6. Limitation of Liability",
    items: [
      "TrustChain provides the platform \u201cas is\u201d and does not warrant uninterrupted, error-free, or completely secure operation of the service.",
      "TrustChain\u2019s total liability for any claims arising from the use of the platform shall not exceed the fees paid by you in the 12 months preceding the claim.",
      "TrustChain is not liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.",
      "TrustChain is not responsible for losses resulting from force majeure events including natural disasters, war, government actions, or internet outages.",
      "Users assume all risk associated with the goods and services transacted through the platform.",
    ],
  },
  {
    icon: RefreshCw,
    title: "7. Termination",
    items: [
      "You may terminate your account at any time by contacting support. Active escrow transactions must be completed or cancelled before account closure.",
      "TrustChain may suspend or terminate your account immediately if you violate these terms, engage in fraudulent activity, or pose a risk to other users.",
      "Upon termination, your right to use the platform ceases immediately. TrustChain will retain transaction records as required by law.",
      "Any funds held in escrow at the time of termination will be handled according to the terms of the applicable transaction or returned to the buyer.",
    ],
  },
];

export default function TermsOfServicePage() {
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
                <FileText className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Terms of Service
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Last updated: March 9, 2026
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-4 text-sm leading-relaxed">
              These Terms of Service (&quot;Terms&quot;) govern your use of the TrustChain B2B escrow platform.
              By accessing or using TrustChain, you agree to comply with and be bound by these Terms.
              Please read them carefully before using our services.
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
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">8. Contact</h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                For questions about these Terms, contact us at{" "}
                <a href="mailto:legal@trustchain.example.com" className="text-primary font-semibold hover:underline">
                  legal@trustchain.example.com
                </a>{" "}
                or visit our{" "}
                <Link href="/support" className="text-primary font-semibold hover:underline">
                  Support page
                </Link>.
              </p>
            </div>
          </div>

          <div className="mt-10 flex gap-6">
            <Link href="/privacy-policy" className="text-primary font-semibold hover:underline text-sm">
              ← Privacy Policy
            </Link>
            <Link href="/support" className="text-primary font-semibold hover:underline text-sm">
              Support →
            </Link>
            <Link href="/" className="text-primary font-semibold hover:underline text-sm">
              Home
            </Link>
          </div>
        </motion.div>
      </main>

      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent z-10 opacity-30 pointer-events-none" />
    </div>
  );
}
