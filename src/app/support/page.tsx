"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  MessageCircle,
  Mail,
  HelpCircle,
  Phone,
  Clock,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle,
} from "lucide-react";
import { SiteNav } from "@/components/site-nav";

const faqs = [
  {
    q: "How does escrow protection work?",
    a: "When a buyer initiates a transaction, funds are deposited into a secure escrow account managed by TrustChain. The funds are only released to the seller after the buyer confirms delivery. If there is a dispute, the funds remain in escrow until the issue is resolved.",
  },
  {
    q: "What happens if I don\u2019t receive my goods?",
    a: "If goods are not delivered within the agreed timeline, you can raise a dispute from your dashboard. This extends the escrow holding period by 45 days. If the seller cannot prove delivery, you will receive a full refund.",
  },
  {
    q: "How long does a dispute take to resolve?",
    a: "Most disputes are resolved within 7\u201314 business days. Complex cases may take up to 45 days. Both parties are required to submit evidence within 7 business days of a dispute being raised.",
  },
  {
    q: "What verification documents do I need?",
    a: "For Indian companies, you need a valid CIN (21 characters) and GSTIN (15 characters). International companies require equivalent business registration documentation. All documents are verified before your first transaction.",
  },
  {
    q: "Is my payment information secure?",
    a: "Yes. TrustChain uses TLS 1.3 encryption for all data in transit and AES-256 encryption for data at rest. We are compliant with PCI-DSS standards and conduct regular security audits.",
  },
  {
    q: "Can I cancel a transaction?",
    a: "Transactions can be cancelled before the payment step. Once funds are deposited into escrow, cancellation requires mutual agreement from both parties or a formal dispute resolution.",
  },
  {
    q: "What are the platform fees?",
    a: "TrustChain charges a service fee of up to 2.5% per transaction. The exact fee is displayed before payment confirmation and varies based on transaction value and your account tier.",
  },
  {
    q: "How do escrow tokens work?",
    a: "Unique verification tokens are generated for both the buyer and seller during each transaction. These tokens authenticate both parties and must be entered to proceed through the escrow workflow. They are single-use and tied to a specific transaction.",
  },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/support/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data?.error === "string" ? data.error : "Failed to send message.");
      }
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
      setContactForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Support Center
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Get help, find answers, or contact our team
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              {
                icon: Mail,
                title: "Email Us",
                desc: "trustchainescrow@gmail.com",
                sub: "Typically respond within 24 hours",
              },
              {
                icon: Phone,
                title: "Call Us",
                desc: "8547328377",
                sub: "Mon–Fri, 9 AM – 6 PM IST",
              },
              {
                icon: Clock,
                title: "Business Hours",
                desc: "Monday – Friday",
                sub: "9:00 AM – 6:00 PM IST",
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{card.title}</h3>
                <p className="text-sm text-primary font-semibold">{card.desc}</p>
                <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Help */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              { icon: HelpCircle, title: "Forgot Password?", desc: "Reset your account password securely via OTP.", link: "/forgot-password", linkText: "Reset password →" },
              { icon: MessageCircle, title: "Live Chat", desc: "Chat with our team for quick answers. (Coming soon)", link: null, linkText: null },
              { icon: Mail, title: "Report a Bug", desc: "Found something broken? Let us know.", link: "mailto:bugs@trustchain.example.com", linkText: "Report bug →" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 + i * 0.08 }}
                className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                    {item.link && (
                      <Link href={item.link} className="text-primary font-semibold hover:underline text-xs mt-2 inline-block">
                        {item.linkText}
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.03 }}
                  className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left"
                  >
                    <span className="font-semibold text-sm text-slate-900 dark:text-white pr-4">{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="px-5 pb-4"
                    >
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Send Us a Message</h2>
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-6">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8 space-y-3"
                >
                  <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white text-lg">Message Sent!</p>
                  <p className="text-sm text-slate-500">We&apos;ll get back to you within 24 hours.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-primary/40 outline-none text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))}
                        placeholder="john@company.com"
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-primary/40 outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subject</label>
                    <input
                      type="text"
                      required
                      value={contactForm.subject}
                      onChange={(e) => setContactForm((p) => ({ ...p, subject: e.target.value }))}
                      placeholder="What can we help with?"
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-primary/40 outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
                      placeholder="Describe your issue or question in detail..."
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-primary/40 outline-none text-sm resize-none"
                    />
                  </div>
                  {submitError ? (
                    <p className="text-sm text-red-500 font-medium">{submitError}</p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg text-sm flex items-center gap-2 transition-all"
                  >
                    <Send className="w-4 h-4" /> {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="flex gap-6">
            <Link href="/privacy-policy" className="text-primary font-semibold hover:underline text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-primary font-semibold hover:underline text-sm">
              Terms of Service
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
