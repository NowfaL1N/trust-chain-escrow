import { useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, ShieldCheck, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onVerify: () => void;
  onCancel: () => void;
};

export default function SellerTokenVerificationModal({ onVerify, onCancel }: Props) {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!token.trim()) {
      setError("Please enter your Seller JWT token.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/transactions/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), role: "seller" }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setSuccess(true);
        setError("");
        setTimeout(() => {
          onVerify();
        }, 1500);
      } else {
        setError("Invalid or expired token. Please check the email and try again.");
      }
    } catch {
      setError("Could not verify token. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-md relative"
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            {success ? (
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            ) : (
              <KeyRound className="w-8 h-8 text-primary" />
            )}
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {success ? "Seller Verified Successfully" : "Verify Seller Identity"}
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            {success
              ? "Your token has been validated. Unlocking request..."
              : "Enter your secure JWT token to unlock this request and take action."}
          </p>
        </div>

        {!success && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Security Token
              </label>
              <input
                type="text"
                placeholder="Paste your seller JWT token"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  setError("");
                }}
                className={`w-full bg-slate-50 border ${
                  error ? "border-rose-500 focus:ring-rose-500/50" : "border-slate-300 focus:ring-primary/50"
                } rounded-xl px-4 py-3 text-slate-900 font-mono focus:outline-none focus:ring-2 transition-all`}
              />
              {error && (
                <p className="text-rose-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {error}
                </p>
              )}
            </div>

            <Button
              onClick={handleVerify}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all"
            >
              {loading ? "Verifying..." : "Verify Token & Unlock"}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
