"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MoreHorizontal, FileText } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TransactionRow {
  id: string;
  counterparty: string;
  amount: string;
  status: string;
  statusClass: string;
  date: string;
}

const ROWS: TransactionRow[] = [];

export default function SellerTransactionsPage() {
  return (
    <DashboardShell
      role="seller"
      title="Transactions"
      breadcrumbs={[{ href: "/dashboard/seller", label: "Seller Home" }, { label: "Transactions" }]}
    >
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">All Transactions</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View and manage your escrow transactions.</p>
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
              {ROWS.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-slate-500 text-sm"
                  >
                    No transactions yet. They will appear here after you create
                    your first escrow.
                  </td>
                </tr>
              ) : (
                ROWS.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-primary">
                      {row.id}
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
                        className={
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider " +
                          row.statusClass
                        }
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
                            <Link href="/dashboard/seller/audit-log" className="flex items-center gap-2 cursor-pointer">
                              <FileText className="w-4 h-4" />
                              View in Audit Log
                            </Link>
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
      </motion.section>
    </DashboardShell>
  );
}
