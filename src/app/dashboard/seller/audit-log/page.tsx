"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { History as HistoryIcon, Download, FileText, Eye, X } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";


interface AuditTransaction {
  _id: string;
  status: string;
  sellerCompany: string;
  buyerCompany?: string;
  createdAt: string;
  product?: unknown;
}

export default function SellerAuditLogPage() {
  const [selectedRow, setSelectedRow] = useState<AuditTransaction | null>(null);
  const [transactions, setTransactions] = useState<AuditTransaction[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("escrow_token") : null;
    fetch("/api/transactions", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => res.json())
      .then(data => {
        setTransactions(Array.isArray(data) ? data : []);
      })
      .catch(() => setTransactions([]));
  }, []);

  const auditData = (Array.isArray(transactions) ? transactions : []).map(txn => ({
    id: txn._id,
    action: "Transaction " + txn.status.replace("_", " "),
    user: txn.buyerCompany,
    role: "Buyer",
    time: new Date(txn.createdAt).toLocaleString(),
    status: txn.status.toUpperCase(),
    statusClass: txn.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700",
    raw: txn
  }));

  const handleExportCSV = () => {
    const headers = ["Transaction ID", "Action", "User", "Role", "Time", "Status"];
    const csvContent = auditData.map(row => 
      `"${row.id}","${row.action}","${row.user}","${row.role}","${row.time}","${row.status}"`
    ).join("\n");
    const blob = new Blob([headers.join(",") + "\n" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `seller_audit_log_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleMonthlyReport = () => {
    const reportText = `TRUSTCHAIN MONTHLY REPORT\nGenerated: ${new Date().toLocaleString()}\nRole: Seller\n\nTotal Actions: ${auditData.length}\nFlagged Anomalies: 0\nPending Verifications: 0\n\nTransactions:\n` + auditData.map(r => `- ${r.time}: ${r.action} (${r.id}) - ${r.status}`).join("\n");
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `seller_monthly_report_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardShell
      role="seller"
      title="Transaction Audit Logging"
      breadcrumbs={[{ href: "/dashboard/seller", label: "Seller Home" }, { label: "Audit Log" }]}
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
          Comprehensive history of all activities within the escrow lifecycle.
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
          <Button onClick={handleExportCSV} variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Download className="w-4 h-4" /> Export CSV</Button>
          <Button onClick={handleMonthlyReport} className="bg-primary hover:bg-primary/90 text-white font-bold flex items-center gap-2"><FileText className="w-4 h-4" /> Monthly Report</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-500 dark:text-slate-400 font-medium">Total Actions Today</p>
              <div className="p-2 rounded-lg text-primary bg-primary/10">
                <HistoryIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{auditData.length}</p>
              <span className="text-sm font-semibold text-emerald-500">+100%</span>
            </div>
          </motion.div>
          {/* Add more stats as needed */}
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User / Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {auditData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500 text-sm">
                      No audit events yet. Activity will appear here after transactions are processed.
                    </td>
                  </tr>
                ) : (
                  auditData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-primary truncate max-w-[120px]">{row.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">{row.action}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 dark:text-slate-200">{row.user}</p>
                        <p className="text-xs text-slate-500">{row.role}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{row.time}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${row.statusClass}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button type="button" onClick={() => setSelectedRow(row.raw)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {mounted && selectedRow && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
            <button onClick={() => setSelectedRow(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Audit Record Details</h3>
            <div className="space-y-4">
              <div><p className="text-sm font-semibold text-slate-500">Transaction ID</p><p className="font-mono mt-1 text-slate-900 dark:text-white">{selectedRow._id}</p></div>
              <div><p className="text-sm font-semibold text-slate-500">Action</p><p className="mt-1 text-slate-900 dark:text-white">Transaction {selectedRow.status.replace('_', ' ')}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm font-semibold text-slate-500">Counterparty</p><p className="mt-1 text-slate-900 dark:text-white">{selectedRow.buyerCompany || "N/A"}</p></div>
                <div><p className="text-sm font-semibold text-slate-500">Role</p><p className="mt-1 text-slate-900 dark:text-white">Buyer</p></div>
              </div>
              <div><p className="text-sm font-semibold text-slate-500">Timestamp</p><p className="mt-1 text-slate-900 dark:text-white">{new Date(selectedRow.createdAt).toLocaleString()}</p></div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Notes</p>
                <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                  <pre className="whitespace-pre-wrap">{JSON.stringify((selectedRow?.product as Record<string, unknown>) || {}, null, 2)}</pre>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <Button onClick={() => setSelectedRow(null)} className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">Close</Button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </DashboardShell>
  );
}
