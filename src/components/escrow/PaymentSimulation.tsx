"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, CheckCircle } from "lucide-react";

type Props = {
  totalAmount: number;
  onNext: () => void;
};

export default function PaymentSimulation({ totalAmount, onNext }: Props) {
  const [paying, setPaying] = useState(false);
  const [funded, setFunded] = useState(false);

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setFunded(true);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Escrow Payment</h3>
        <p className="text-sm text-slate-500 mt-1">Secure your transaction with escrow-protected payment.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-slate-500">Total Transaction Amount</p>
          <p className="text-4xl font-bold text-slate-900">${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-blue-800 text-sm">Escrow Protection Active</p>
            <p className="text-xs text-blue-600 mt-1 leading-relaxed">
              Your payment will be held securely in escrow until delivery is confirmed. Funds are protected and will only be released upon your approval.
            </p>
          </div>
        </div>

        {!funded ? (
          <motion.button
            onClick={handlePay}
            disabled={paying}
            whileTap={!paying ? { scale: 0.98 } : {}}
            className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg text-sm disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {paying ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                Processing Payment…
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Simulate Secure Payment
              </>
            )}
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle className="w-8 h-8 text-white" />
              </motion.div>
              <p className="text-lg font-bold text-emerald-800">Payment Funded</p>
              <p className="text-sm text-emerald-600">Funds are now securely held in escrow.</p>

              <div className="flex items-center justify-center gap-3 pt-2">
                {["Initiated", "Funded", "In Transit", "Completed"].map((label, i) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${i <= 1 ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${i <= 1 ? "text-emerald-700" : "text-slate-400"}`}>{label}</span>
                    {i < 3 && <div className={`w-6 h-0.5 ${i < 1 ? "bg-emerald-400" : "bg-slate-300"}`} />}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onNext}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-sm text-sm"
            >
              Continue to Delivery
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
