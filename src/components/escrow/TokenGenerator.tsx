"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Key, Mail } from "lucide-react";
import { generateTokenPair, type EscrowTokens } from "@/services/tokenService";

type Props = { 
  onNext: (tokens: EscrowTokens) => void,
  userRole: "buyer" | "seller",
  emailSent?: { buyer: boolean; seller: boolean } | null,
};

export default function TokenGenerator({ onNext, userRole, emailSent }: Props) {
  const [tokens, setTokens] = useState<EscrowTokens | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const t = generateTokenPair();
    setTokens(t);
    const timer = setTimeout(() => setSent(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!tokens) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Token Generation</h3>
        <p className="text-sm text-slate-500 mt-1">
          Verification tokens have been sent to each party&apos;s email. Check your inbox; do not share tokens on screen.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-5"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Key className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-bold text-slate-900">Transaction ID</p>
            <p className="text-xs text-slate-500 font-mono">{tokens.transactionId}</p>
          </div>
        </div>

        {/* Buyer Token - never show value; only confirm sent to email */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
            {userRole === "buyer" ? "Your Buyer Token" : "Buyer Token"}
          </p>
          <div className="flex items-center gap-2 text-blue-700 text-sm">
            <Mail className="w-4 h-4 shrink-0" />
            <span>
              {userRole === "buyer" ? "Security token sent to your email." : "Security token sent to buyer email."}
            </span>
          </div>
        </div>

        {/* Seller Token - never show value; only confirm sent to email */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">
            {userRole === "seller" ? "Your Seller Token" : "Seller Token"}
          </p>
          <div className="flex items-center gap-2 text-amber-700 text-sm">
            <Mail className="w-4 h-4 shrink-0" />
            <span>
              {userRole === "seller" ? "Security token sent to your email." : "Security token sent to seller email."}
            </span>
          </div>
        </div>
      </motion.div>

      {sent && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm font-semibold text-emerald-800">
              Verification tokens sent to both parties.
            </p>
          </div>
          {emailSent && (!emailSent.buyer || !emailSent.seller) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <p className="font-semibold">Email may not have been delivered.</p>
              <p className="mt-1">Check spam/junk, or see the project&apos;s <strong>EMAIL_SETUP.md</strong> to fix EmailJS configuration.</p>
            </div>
          )}
        </motion.div>
      )}

      <button
        onClick={() => onNext(tokens)}
        className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-sm text-sm"
      >
        Continue to Verification
      </button>
    </div>
  );
}
