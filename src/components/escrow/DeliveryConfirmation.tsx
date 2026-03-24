"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PackageCheck, AlertTriangle, CheckCircle, PartyPopper } from "lucide-react";

type Props = {
  onConfirm: () => void;
  onDispute: () => void;
};

export default function DeliveryConfirmation({ onConfirm, onDispute }: Props) {
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => onConfirm(), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Delivery Confirmation</h3>
        <p className="text-sm text-slate-500 mt-1">
          {confirmed ? "Funds have been released to the seller." : "Confirm that you've received the goods as expected."}
        </p>
      </div>

      {!confirmed ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <PackageCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-800 text-sm">Delivery Status: In Transit</p>
              <p className="text-xs text-blue-600 mt-1">
                Once you receive and inspect the goods, confirm delivery to release the escrowed funds to the seller.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onDispute}
              className="flex-1 py-3 border-2 border-amber-200 text-amber-700 font-bold rounded-xl transition-all text-sm hover:bg-amber-50 flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" /> Report Issue
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-sm text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Confirm Delivery
            </button>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto"
          >
            <PartyPopper className="w-10 h-10 text-white" />
          </motion.div>
          <p className="text-xl font-bold text-emerald-800">Delivery Confirmed!</p>
          <p className="text-sm text-emerald-600">Funds have been released to the seller. Transaction complete.</p>

          <div className="flex items-center justify-center gap-3 pt-2">
            {["Initiated", "Funded", "In Transit", "Completed"].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">{label}</span>
                {i < 3 && <div className="w-6 h-0.5 bg-emerald-400" />}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
