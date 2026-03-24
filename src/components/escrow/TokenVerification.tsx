"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, AlertCircle, CheckCircle } from "lucide-react";

type Props = { onNext: () => void };

export default function TokenVerification({ onNext }: Props) {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!token.trim()) {
      setError("Please enter your buyer token.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/transactions/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), role: "buyer" }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setError("");
        setSuccess(true);
        setTimeout(() => onNext(), 1200);
      } else {
        setError("Invalid or expired token. Please check the email and try again.");
        setSuccess(false);
      }
    } catch {
      setError("Could not verify token. Please try again.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Buyer Token Authentication</h3>
        <p className="text-sm text-slate-500 mt-1">
          Enter the buyer verification token to continue.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-bold text-slate-900">Token Verification</p>
            <p className="text-xs text-slate-500">Paste the token you received via email</p>
          </div>
        </div>

        <input
          type="text"
          value={token}
          onChange={(e) => { setToken(e.target.value); setError(""); }}
          placeholder="ESCROW-XXXX-XXXX-XXXX"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm font-mono tracking-wider text-center uppercase placeholder:text-slate-400 placeholder:normal-case"
        />

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-red-600 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" /> {error}
          </motion.p>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0"
            >
              <CheckCircle className="w-4 h-4 text-white" />
            </motion.div>
            <p className="text-sm font-semibold text-emerald-800">Token verified successfully!</p>
          </motion.div>
        )}
      </div>

      {!success && (
        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-sm text-sm"
        >
          {loading ? "Verifying..." : "Verify Token"}
        </button>
      )}
    </div>
  );
}
