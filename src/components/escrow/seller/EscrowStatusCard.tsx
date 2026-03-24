import { motion } from "framer-motion";
import { ShieldCheck, Info } from "lucide-react";

export default function EscrowStatusCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-8 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center shrink-0 shadow-inner border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        
        <div className="text-center md:text-left flex-1">
          <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">
            Payment Secured in Escrow
          </h3>
          <p className="text-emerald-800/80 dark:text-emerald-200 mb-6 text-lg">
            Funds are securely held and will be automatically released upon delivery confirmation. You may safely fulfill this order.
          </p>

          <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/30 flex items-start gap-3">
            <Info className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div className="text-sm text-emerald-900/70 dark:text-emerald-300">
              <p className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">Escrow Protection Rules:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Funds will release automatically to your account when the buyer confirms delivery.</li>
                <li>If the buyer does not respond after you mark as &apos;Delivered&apos;, funds Auto-Release after <strong>15 days</strong>.</li>
                <li>If a dispute occurs, the transaction window extends to <strong>45 days</strong> for resolution.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
