"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileEdit, Wallet, Truck, CheckCircle, Plus } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import EscrowWizard from "@/components/escrow/EscrowWizard";
import { getTransactions, type EscrowTransaction } from "@/services/transactionService";

const TIMELINE = [
  { id: 1, label: "Initiated", sub: "Start here", icon: FileEdit },
  { id: 2, label: "Funded", sub: "Pending", icon: Wallet },
  { id: 3, label: "In Transit", sub: "Pending", icon: Truck },
  { id: 4, label: "Completed", sub: "Pending", icon: CheckCircle },
];

export default function BuyerNewTransactionPage() {
  const [showWizard, setShowWizard] = useState(false);
  const [resumeTx, setResumeTx] = useState<EscrowTransaction | null>(null);

  const handleLaunchNew = () => {
    setResumeTx(null);
    setShowWizard(true);
  };

  const handleResume = async () => {
    try {
      const txns = await getTransactions();
      const active = txns.filter(
        (t) => !["completed", "rejected", "refunded"].includes(t.status)
      );
      if (active.length === 0) {
        window.alert("No active transaction to resume. Start a new one instead.");
        return;
      }
      // API returns newest-first
      setResumeTx(active[0]);
      setShowWizard(true);
    } catch (err) {
      console.error("Failed to load transactions for resume", err);
      window.alert("Could not load existing transactions. Please try again.");
    }
  };

  return (
    <DashboardShell
      role="buyer"
      title="Initiate Escrow Transaction"
      breadcrumbs={[
        { href: "/dashboard/buyer", label: "Buyer Home" },
        { href: "/dashboard/buyer/transactions", label: "Transactions" },
        { label: "New Transaction" },
      ]}
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl space-y-8">
        <p className="text-slate-500 dark:text-slate-400">
          Launch a guided escrow workflow to securely trade with a verified seller.
        </p>

        {/* Transaction Timeline Overview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {TIMELINE.map((step, i) => (
              <div key={step.id} className="flex items-center gap-2">
                <div className={`flex flex-col items-center gap-2 z-10 ${i === 0 ? "opacity-100" : "opacity-50"}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${i === 0 ? "bg-primary text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-400"}`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-bold ${i === 0 ? "text-primary" : "text-slate-500"}`}>{step.label}</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{step.sub}</p>
                  </div>
                </div>
                {i < TIMELINE.length - 1 && (
                  <div className="h-0.5 flex-1 min-w-[24px] bg-slate-200 dark:bg-slate-700 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Launch / Resume Buttons */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white">Start New Escrow</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Click below to launch the step-by-step escrow wizard. You&apos;ll verify your company, select a seller, generate secure tokens, and complete the full trade process.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleLaunchNew}
              className="bg-primary text-white font-bold gap-2 flex-1"
            >
              <Plus className="w-4 h-4" />
              New Transaction
            </Button>
            <Button
              variant="outline"
              onClick={handleResume}
              className="font-bold gap-2 flex-1"
            >
              Resume Last Transaction
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Wizard Modal */}
      {showWizard && (
        <EscrowWizard
          onClose={() => setShowWizard(false)}
          initialTransaction={resumeTx ?? undefined}
        />
      )}
    </DashboardShell>
  );
}
