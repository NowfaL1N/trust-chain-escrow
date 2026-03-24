"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Search, ArrowDownAZ, Download, Calendar, AlertCircle } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";

interface ContactRequest {
  company: string;
  industry: string;
  status: string;
  message: string;
  date: string;
}

const INITIAL_RECEIVED: ContactRequest[] = [];
const INITIAL_SENT: ContactRequest[] = [];

export default function BuyerContactsPage() {
  const [tab, setTab] = useState<"received" | "sent">("received");
  const [received] = useState<ContactRequest[]>(INITIAL_RECEIVED);
  const [sent, setSent] = useState<ContactRequest[]>(INITIAL_SENT);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteCompany, setInviteCompany] = useState("");
  const [inviteIndustry, setInviteIndustry] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteError, setInviteError] = useState("");

  const list = tab === "received" ? received : sent;

  function handleOpenInvite() {
    setInviteError("");
    setInviteCompany("");
    setInviteIndustry("");
    setInviteMessage("");
    setIsInviteOpen(true);
  }

  function handleCreateInvite(e: React.FormEvent) {
    e.preventDefault();
    const company = inviteCompany.trim();
    const industry = inviteIndustry.trim();
    const message = inviteMessage.trim();
    if (!company) {
      setInviteError("Please enter a company name.");
      return;
    }
    const today = new Date().toLocaleDateString();
    const newRequest: ContactRequest = {
      company,
      industry: industry || "—",
      message: message || "Partnership enquiry via TrustChain Escrow.",
      status: "Pending",
      date: today,
    };
    setSent((prev) => [newRequest, ...prev]);
    setTab("sent");
    setIsInviteOpen(false);
  }

  return (
    <DashboardShell
      role="buyer"
      title="Contact Management"
      breadcrumbs={[{ href: "/dashboard/buyer", label: "Buyer Home" }, { label: "Contacts" }]}
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-slate-500 dark:text-slate-400">Review and manage your B2B networking pipeline.</p>
          <Button
            type="button"
            onClick={handleOpenInvite}
            className="bg-primary hover:bg-primary/90 text-white font-bold flex items-center gap-2 w-fit"
          >
            Invite New Contact
          </Button>
        </div>

        <div className="border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-8">
            <button
              type="button"
              onClick={() => setTab("received")}
              className={`flex items-center gap-2 border-b-2 pb-4 px-2 font-bold transition-all ${
                tab === "received"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Received Requests
              <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">0</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("sent")}
              className={`flex items-center gap-2 border-b-2 pb-4 px-2 font-bold transition-all ${
                tab === "sent"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Sent Requests
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs px-2 py-0.5 rounded-full">0</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by company name, industry, or status..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-2">
              <ArrowDownAZ className="w-4 h-4" /> Sort
            </Button>
            <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-2">
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((card, i) => (
            <motion.div
              key={card.company}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-primary/40 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Building2 className="w-7 h-7 text-primary" />
                </div>
                <span className="px-3 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {card.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{card.company}</h3>
              <p className="text-slate-400 text-sm mb-4">{card.industry}</p>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 mb-6">
                <p className="text-slate-400 text-xs italic leading-relaxed">&quot;{card.message}&quot;</p>
              </div>
              {tab === "received" && card.status === "Pending" && (
                <div className="flex gap-3 mb-4">
                  <Button className="flex-1 bg-primary hover:bg-primary/90 text-white text-sm font-bold">Accept</Button>
                  <Button variant="outline" className="flex-1 border-slate-300 text-slate-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50">
                    Reject
                  </Button>
                </div>
              )}
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Requested on {card.date}
              </p>
            </motion.div>
          ))}
          {list.length === 0 && (
            <p className="text-slate-500 dark:text-slate-400 col-span-full text-sm">
              No contacts yet. New requests will appear here when you start
              connecting with partners.
            </p>
          )}
        </div>
      </motion.div>

      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Invite a new contact</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Send a connection request to a supplier or buyer you want to work with.
            </p>
            <form onSubmit={handleCreateInvite} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Company name
                </label>
                <input
                  type="text"
                  value={inviteCompany}
                  onChange={(e) => {
                    setInviteCompany(e.target.value);
                    if (inviteError) setInviteError("");
                  }}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-sm"
                  placeholder="Acme Exports Pvt Ltd"
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Industry (optional)
                </label>
                <input
                  type="text"
                  value={inviteIndustry}
                  onChange={(e) => setInviteIndustry(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-sm"
                  placeholder="Textiles, electronics, logistics…"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Message (optional)
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-sm resize-none"
                  placeholder="Add a short note about why you want to connect."
                />
              </div>
              {inviteError && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {inviteError}
                </p>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-300 text-slate-600 hover:bg-slate-50"
                  onClick={() => setIsInviteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white font-bold px-4"
                >
                  Send Invite
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
