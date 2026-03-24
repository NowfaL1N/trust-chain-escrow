"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { KeyRound, AlertCircle, CheckCircle, Package, XCircle, Clock } from "lucide-react";
import { getTransaction } from "@/services/transactionService";

type Props = {
  productRequest: { productName: string; quantity: number; pricePerUnit: number; deliveryTimeline: string; specialNotes: string } | null;
  onAccept: () => void;
  onReject: () => void;
  userRole: "buyer" | "seller";
  transactionId?: string | null;
};

const POLL_INTERVAL_MS = 3000;

export default function SellerApprovalPanel({ productRequest, onAccept, onReject, userRole, transactionId }: Props) {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sellerApproved, setSellerApproved] = useState(false);

  // Buyer: poll transaction until status is seller_approved
  useEffect(() => {
    if (userRole !== "buyer" || !transactionId) return;
    const check = async () => {
      const txn = await getTransaction(transactionId);
      if (txn?.status === "seller_approved") setSellerApproved(true);
    };
    check();
    const interval = setInterval(check, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [userRole, transactionId]);

  const handleVerify = async () => {
    if (!token.trim()) { setError("Please enter your seller token."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/transactions/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), role: "seller" }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setVerified(true);
      } else {
        setError("Invalid or expired token. Use the token from your email.");
      }
    } catch {
      setError("Could not verify token. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const total = productRequest ? productRequest.quantity * productRequest.pricePerUnit : 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Seller Approval</h3>
        <p className="text-sm text-slate-500 mt-1">
          {userRole === "buyer" 
            ? "Waiting for the seller to review and approve your transaction request."
            : verified 
              ? "Review the buyer's request and approve or reject." 
              : "Enter the seller token to view the buyer's request."}
        </p>
      </div>

      {userRole === "buyer" ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4">
          {!sellerApproved ? (
            <>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Awaiting Seller Action</h4>
                <p className="text-sm text-slate-500 mt-2">
                  The seller has been notified. They must open their dashboard, verify their token, and accept or reject the order. You can proceed to payment only after they accept.
                </p>
              </div>
              <div className="pt-4">
                <button type="button" className="text-slate-400 text-sm cursor-not-allowed" disabled>
                  Waiting for seller approval...
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Seller Approved</h4>
                <p className="text-sm text-slate-500 mt-2">
                  The seller has accepted the order. Proceed to secure funds in escrow.
                </p>
              </div>
              <button type="button" onClick={onAccept} className="mt-4 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-sm text-sm">
                Proceed to Payment
              </button>
            </>
          )}
        </div>
      ) : !verified ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Seller Token Verification</p>
              <p className="text-xs text-slate-500">Enter the seller token from Step 3</p>
            </div>
          </div>
          <input type="text" value={token} onChange={(e) => { setToken(e.target.value); setError(""); }} placeholder="Paste your seller JWT token from email" className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 outline-none text-sm font-mono tracking-wider text-center placeholder:text-slate-400" />
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </motion.p>
          )}
          <button type="button" onClick={handleVerify} disabled={loading} className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-sm text-sm disabled:opacity-50">
            {loading ? "Verifying..." : "Verify Seller Token"}
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-800">Seller identity verified</p>
          </div>

          {productRequest && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-bold text-slate-900">Buyer&apos;s Product Request</h4>
              </div>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <span className="text-slate-500">Product</span><span className="font-semibold text-slate-900">{productRequest.productName}</span>
                <span className="text-slate-500">Quantity</span><span className="font-semibold text-slate-900">{productRequest.quantity}</span>
                <span className="text-slate-500">Price / Unit</span><span className="font-semibold text-slate-900">${productRequest.pricePerUnit.toFixed(2)}</span>
                <span className="text-slate-500">Timeline</span><span className="font-semibold text-slate-900">{productRequest.deliveryTimeline}</span>
                {productRequest.specialNotes && <><span className="text-slate-500">Notes</span><span className="font-semibold text-slate-900">{productRequest.specialNotes}</span></>}
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-2xl font-bold text-primary">${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onReject} className="flex-1 py-3 border-2 border-red-200 text-red-600 font-bold rounded-xl transition-all text-sm hover:bg-red-50 flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4" /> Reject Order
            </button>
            <button onClick={onAccept} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-sm text-sm flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" /> Accept Order
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
