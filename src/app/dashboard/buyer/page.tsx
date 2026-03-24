"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Receipt,
  Wallet,
  ClipboardList,
  MapPin,
  Star,
  Filter,
  MoreHorizontal,
  FileText,
  ArrowLeftRight,
  Trash2,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ContactSellerDialog, type SellerContactDetails } from "@/components/contact-seller-dialog";
import { deleteTransaction, getTransactions, type EscrowTransaction } from "@/services/transactionService";

type SellerCard = SellerContactDetails & { gradient: string };

const GRADIENTS = [
  "from-primary/80 to-primary",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-500",
];

function mapApiSellerToCard(s: { companyName: string; location: string; email: string; representativeName?: string; phone?: string; businessAddress?: string }, index: number): SellerCard {
  return {
    name: s.companyName,
    location: s.location || "—",
    email: s.email,
    rating: 4.5,
    deals: 0,
    tags: ["Verified"],
    phone: s.phone || "—",
    contactPerson: s.representativeName || s.companyName,
    companyAddress: s.businessAddress || "—",
    gradient: GRADIENTS[index % GRADIENTS.length],
  };
}

export default function BuyerDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [sellers, setSellers] = useState<SellerCard[]>([]);
  const [userName, setUserName] = useState("Buyer");
  const [contactSeller, setContactSeller] = useState<SellerContactDetails | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [filterMode, setFilterMode] = useState<"All" | "Verified" | "High Rated">("All");

  useEffect(() => {
    setMounted(true);
    const authStr = localStorage.getItem("escrow_demo_auth");
    if (authStr) {
      const auth = JSON.parse(authStr);
      setUserName(auth.name || "Buyer");
    }
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      const [txnData, sellersRes] = await Promise.all([
        getTransactions(),
        fetch("/api/sellers").then((r) => (r.ok ? r.json() : [])),
      ]);
      setTransactions(txnData);
      setSellers((sellersRes as Parameters<typeof mapApiSellerToCard>[0][]).map(mapApiSellerToCard));
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  if (!mounted) return null;

  const activeTxns = transactions.filter(t => !["completed", "rejected", "refunded"].includes(t.status)).length;
  const totalValue = transactions.reduce((acc, t) => acc + (t.totalAmount || 0), 0);
  const pendingApprovals = transactions.filter(t => t.status === "initiated").length;

  const activityRows = transactions.slice(0, 5).map(t => ({
    id: t._id,
    shortId: t._id?.toString().substring(0, 8).toUpperCase() || "PENDING",
    counterparty: t.sellerCompany,
    amount: `$${(t.totalAmount || 0).toLocaleString()}`,
    status: t.status.replace(/_/g, " "),
    statusClass: t.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-primary/10 text-primary",
    date: new Date(t.createdAt).toLocaleDateString(),
  }));

  const filteredSellers = sellers.filter(s => {
    if (filterMode === "All") return true;
    if (filterMode === "Verified") return s.tags?.includes("Verified");
    if (filterMode === "High Rated") return s.rating >= 4.8;
    return true;
  });
  const displayedSellers = showAll ? filteredSellers : filteredSellers.slice(0, 4);

  const cycleFilter = () => {
    if (filterMode === "All") setFilterMode("Verified");
    else if (filterMode === "Verified") setFilterMode("High Rated");
    else setFilterMode("All");
  };

  const handleDeleteTransaction = async (id: string | undefined) => {
    if (!id) return;
    const confirmed = window.confirm("Delete this transaction? This cannot be undone.");
    if (!confirmed) return;
    try {
      const ok = await deleteTransaction(id);
      if (ok) {
        await refreshData();
      }
    } catch (err) {
      console.error("Failed to delete transaction", err);
    }
  };

  return (
    <DashboardShell
      role="buyer"
      title={`Welcome back, ${userName}`}
      breadcrumbs={[{ href: "/dashboard/buyer", label: "Buyer Home" }, { label: "Dashboard" }]}
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Transactions</p>
          <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{activeTxns}</h3>
          <p className="text-xs text-slate-400 mt-4">Total monitored via escrow</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-slate-400 text-sm font-medium">USD</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Escrow Value</p>
          <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">${totalValue.toLocaleString()}</h3>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-4">
            <div className="bg-amber-500 h-1.5 rounded-full w-full opacity-20" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-primary"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary text-white rounded-lg">
              <ClipboardList className="w-5 h-5" />
            </div>
            {pendingApprovals > 0 && (
              <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold uppercase tracking-wider animate-pulse">
                Action Required
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pending Approvals</p>
          <h3 className="text-3xl font-bold mt-1 text-primary">{pendingApprovals}</h3>
          <Link href="/dashboard/buyer/transactions" className="text-xs text-slate-500 mt-4 flex items-center gap-1 hover:text-primary hover:underline">
            {pendingApprovals > 0 ? "Review pending transactions →" : "No pending reviews →"}
          </Link>
        </motion.div>
      </div>

      {/* Seller Discovery */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Seller Discovery</h2>
            <p className="text-slate-500 dark:text-slate-400">Find and connect with verified global suppliers.</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={cycleFilter} className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${filterMode !== "All" ? "border-primary text-primary bg-primary/5" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}>
              <Filter className="w-4 h-4" /> Filters {filterMode !== "All" && `(${filterMode})`}
            </button>
            <button type="button" onClick={() => setShowAll(!showAll)} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium">
              {showAll ? "View Less" : "View All"}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedSellers.length === 0 ? (
            <div className="col-span-full rounded-xl border border-slate-200 dark:border-slate-800 border-dashed bg-slate-50 dark:bg-slate-900/50 p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                No sellers yet. Add a new seller or initiate a new transaction from the wizard to get started.
              </p>
              <Link href="/dashboard/buyer/new-transaction" className="inline-block mt-4 text-primary font-bold hover:underline text-sm">
                Initiate New Transaction →
              </Link>
            </div>
          ) : (
          displayedSellers.map((seller, i) => (
            <motion.div
              key={seller.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className={`h-24 bg-gradient-to-r ${seller.gradient} relative`}>
                <div className="absolute -bottom-6 left-6">
                  <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 p-1 shadow-lg border border-slate-100 dark:border-slate-800">
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-slate-400">{seller.name[0]}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    VERIFIED
                  </span>
                </div>
              </div>
              <div className="p-6 pt-10 space-y-4">
                <div>
                  <h4 className="font-bold text-lg leading-tight text-slate-900 dark:text-white">{seller.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {seller.location}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`w-4 h-4 ${n <= Math.floor(seller.rating) ? "fill-current" : ""}`} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{seller.rating}</span>
                  <span className="text-[10px] text-slate-400">({seller.deals} deals)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {seller.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setContactSeller(seller)}
                  className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold py-2 rounded-lg transition-all text-sm"
                >
                  Contact Seller
                </button>
              </div>
            </motion.div>
          ))
          )}
        </div>
      </section>

      <ContactSellerDialog seller={contactSeller} onClose={() => setContactSeller(null)} />

      {/* Recent Activity */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h2>
          <Link href="/dashboard/buyer/audit-log" className="text-primary text-sm font-bold hover:underline">
            View All Logs
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Counterparty</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activityRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-slate-500 text-sm"
                  >
                    No recent activity yet.
                  </td>
                </tr>
              ) : (
                activityRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-primary">
                      {row.shortId}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700" />
                        <span className="text-slate-900 dark:text-slate-100">
                          {row.counterparty}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {row.amount}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${row.statusClass}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {row.date}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-500 hover:text-slate-700"
                            aria-label="Actions"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/buyer/audit-log" className="flex items-center gap-2 cursor-pointer">
                              <FileText className="w-4 h-4" />
                              View in Audit Log
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/buyer/transactions" className="flex items-center gap-2 cursor-pointer">
                              <ArrowLeftRight className="w-4 h-4" />
                              View all transactions
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-700 cursor-pointer"
                            onClick={() => handleDeleteTransaction(row.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete transaction
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}
