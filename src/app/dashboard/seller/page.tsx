"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardShell } from "@/components/dashboard-shell";
import SellerRequestsList from "@/components/escrow/seller/SellerRequestsList";
import {
  getTransactions,
  acceptTransaction,
  rejectTransaction,
  updateDeliveryStatus,
  raiseDispute,
  type EscrowTransaction
} from "@/services/transactionService";

type Tab = "pending_requests" | "active_transactions" | "completed_transactions" | "disputes";

export default function SellerDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("pending_requests");
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    refreshTransactions();
  }, []);

  const refreshTransactions = async () => {
    const txns = await getTransactions();
    setTransactions(txns);
  };

  const handleAccept = async (id: string) => {
    await acceptTransaction(id);
    refreshTransactions();
  };

  const handleReject = async (id: string) => {
    await rejectTransaction(id);
    refreshTransactions();
  };

  const handleUpdateDelivery = async (id: string, state: "shipped" | "delivered") => {
    await updateDeliveryStatus(id, state);
    refreshTransactions();
  };

  const handleRaiseDispute = async (id: string, details: { description: string; evidence: string }) => {
    await raiseDispute(id, details.description, details.evidence, false);
    refreshTransactions();
  };

  const filteredTransactions = transactions.filter((txn) => {
    switch (activeTab) {
      case "pending_requests":
        return txn.status === "initiated";
      case "active_transactions":
        return ["seller_approved", "funded", "in_transit", "shipped", "delivered"].includes(txn.status);
      case "completed_transactions":
        return ["completed", "rejected", "refunded"].includes(txn.status);
      case "disputes":
        return txn.status === "disputed";
      default:
        return false;
    }
  });

  const tabs: { id: Tab; label: string }[] = [
    { id: "pending_requests", label: "Pending Requests" },
    { id: "active_transactions", label: "Active Transactions" },
    { id: "completed_transactions", label: "Completed" },
    { id: "disputes", label: "Disputes" },
  ];

  if (!mounted) return null;

  return (
    <DashboardShell
      role="seller"
      title="Transaction Inbox"
      breadcrumbs={[{ href: "/dashboard/seller", label: "Seller Home" }, { label: "Inbox" }]}
    >
      <div className="w-full max-w-5xl mx-auto space-y-6">
        
        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 flex flex-wrap gap-2 shadow-sm">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = transactions.filter((txn) => {
              if (tab.id === "pending_requests") return txn.status === "initiated";
              if (tab.id === "active_transactions") return ["seller_approved", "funded", "in_transit", "shipped", "delivered"].includes(txn.status);
              if (tab.id === "completed_transactions") return ["completed", "rejected", "refunded"].includes(txn.status);
              if (tab.id === "disputes") return txn.status === "disputed";
              return false;
            }).length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex-1 sm:flex-none text-center ${
                  isActive
                    ? "text-primary dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sellerTabIndicator"
                    className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
                {count > 0 && (
                  <span className={`relative z-10 ml-2 px-2 py-0.5 rounded-full text-xs ${
                    isActive ? "bg-primary text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* List Content */}
        <SellerRequestsList
          transactions={filteredTransactions}
          onAccept={handleAccept}
          onReject={handleReject}
          onUpdateDelivery={handleUpdateDelivery}
          onRaiseDispute={handleRaiseDispute}
          activeTab={activeTab}
        />
      </div>
    </DashboardShell>
  );
}
