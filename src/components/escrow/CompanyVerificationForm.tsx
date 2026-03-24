"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Globe,
  Hash,
  Mail,
  Phone,
  User,
  MapPin,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { verifyCompany } from "@/services/companyVerification";

const DEFAULT_FORM = {
  companyLegalName: "",
  country: "",
  businessAddress: "",
  cin: "",
  gstin: "",
  companyEmail: "",
  representativeName: "",
  phone: "",
};

type Props = {
  onNext: (data: Record<string, string>) => void;
  initialData?: Record<string, string> | null;
};

export default function CompanyVerificationForm({ onNext, initialData }: Props) {
  const [form, setForm] = useState(() => ({
    ...DEFAULT_FORM,
    ...(initialData || {}),
  }));
  const [errors, setErrors] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setForm((prev) => ({ ...prev, ...initialData }));
      setVerified(false);
    }
  }, [initialData]);

  const update = (key: string, val: string) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleVerify = async () => {
    const result = await verifyCompany(form);
    if (result.success) {
      setErrors([]);
      setVerified(true);
      setTimeout(() => onNext(form), 1500);
    } else {
      setErrors(result.errors);
      setVerified(false);
    }
  };

  const fields = [
    { key: "companyLegalName", label: "Company Legal Name", icon: Building2, span: 2 },
    { key: "country", label: "Country", icon: Globe, span: 1 },
    { key: "businessAddress", label: "Business Address", icon: MapPin, span: 1 },
    { key: "cin", label: "Corporate Identification Number (CIN)", icon: Hash, span: 1, hint: "21 characters" },
    { key: "gstin", label: "GSTIN", icon: Hash, span: 1, hint: "15 characters" },
    { key: "companyEmail", label: "Company Email", icon: Mail, span: 1 },
    { key: "representativeName", label: "Authorized Representative", icon: User, span: 1 },
    { key: "phone", label: "Phone Number", icon: Phone, span: 2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Company Verification</h3>
        <p className="text-sm text-slate-500 mt-1">
          Verify your company details to initiate a secure escrow transaction.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {fields.map((f) => (
          <div
            key={f.key}
            className={`space-y-1.5 ${f.span === 2 ? "sm:col-span-2" : ""}`}
          >
            <label className="text-sm font-semibold text-slate-700">
              {f.label}
            </label>
            <div className="relative">
              <f.icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={form[f.key as keyof typeof form]}
                onChange={(e) => update(f.key, e.target.value)}
                placeholder={f.hint || f.label}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-sm placeholder:text-slate-400"
              />
            </div>
          </div>
        ))}
      </div>

      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1"
        >
          <p className="font-bold text-red-700 flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" /> Verification Failed
          </p>
          {errors.map((e, i) => (
            <p key={i} className="text-red-600 text-sm pl-6">
              • {e}
            </p>
          ))}
        </motion.div>
      )}

      {verified && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex items-center gap-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shrink-0"
          >
            <ShieldCheck className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <p className="font-bold text-emerald-800 text-lg">
              Company Verified
            </p>
            <p className="text-emerald-600 text-sm">
              Your company identity has been confirmed. Proceeding…
            </p>
          </div>
        </motion.div>
      )}

      {!verified && (
        <button
          onClick={handleVerify}
          className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-sm text-sm"
        >
          Verify Company
        </button>
      )}
    </div>
  );
}
