import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onAccept: () => void;
  onReject: () => void;
  isLoading?: boolean;
};

export default function SellerDecisionPanel({ onAccept, onReject, isLoading }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm"
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-amber-500/10 rounded-xl shrink-0">
          <AlertCircle className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Action Required</h3>
          <p className="text-sm text-slate-500">
            Please review the transaction details carefully. Once you accept this request, the buyer will be prompted to secure the funds in escrow. If you reject, the transaction will be cancelled.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button
          onClick={onReject}
          disabled={isLoading}
          variant="outline"
          className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 py-6 text-lg font-bold flex flex-col items-center justify-center h-auto gap-2"
        >
          <XCircle className="w-6 h-6" />
          Reject Order
        </Button>
        <Button
          onClick={onAccept}
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg font-bold flex flex-col items-center justify-center h-auto gap-2"
        >
          <CheckCircle2 className="w-6 h-6" />
          Accept Order
        </Button>
      </div>
    </motion.div>
  );
}
