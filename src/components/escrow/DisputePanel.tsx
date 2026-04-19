"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Upload, RotateCcw, CheckCircle, Clock, Shield, X, Image as ImageIcon } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";

const MAX_IMAGES = 10;
const MAX_FILE_SIZE_MB = 5;

type Props = {
  onComplete: (outcome: "refunded" | "released") => void;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DisputePanel({ onComplete }: Props) {
  const [phase, setPhase] = useState<"submit" | "review" | "resolved">("submit");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState("");
  const [evidenceImages, setEvidenceImages] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [returnRequested, setReturnRequested] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Timer: 45 days for dispute, simulated as 45 seconds for demo
  const TOTAL_SECONDS = 45;
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);

  useEffect(() => {
    if (phase === "review") {
      const interval = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onComplete("released");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase, onComplete]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    const files = e.target.files;
    if (!files?.length) return;
    if (evidenceImages.length + files.length > MAX_IMAGES) {
      setUploadError(`You can add up to ${MAX_IMAGES} images.`);
      e.target.value = "";
      return;
    }
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setUploadError(`"${file.name}" is larger than ${MAX_FILE_SIZE_MB}MB.`);
        continue;
      }
      try {
        const url = await fileToDataUrl(file);
        newUrls.push(url);
      } catch {
        setUploadError(`Could not read "${file.name}".`);
      }
    }
    setEvidenceImages((prev) => [...prev, ...newUrls].slice(0, MAX_IMAGES));
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setEvidenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!description.trim()) return;
    localStorage.setItem("escrow_dispute", JSON.stringify({ description, evidence, evidenceImages, returnRequested }));
    setPhase("review");
  };

  const handleSellerApproveReturn = () => {
    setPhase("resolved");
    setTimeout(() => onComplete("refunded"), 1500);
  };

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900">
          {phase === "submit" ? "Raise a Dispute" : phase === "review" ? "Dispute Under Review" : "Dispute Resolved"}
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          {phase === "submit" && "Describe the issue you encountered with this transaction."}
          {phase === "review" && "Your dispute is being reviewed. The seller can approve a return."}
          {phase === "resolved" && "The dispute has been resolved."}
        </p>
      </div>

      {phase === "submit" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Issue Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the problem in detail…" rows={4} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 outline-none text-sm resize-none placeholder:text-slate-400" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Upload Evidence (pictures)</label>
            <p className="text-xs text-slate-500 mb-1">Add up to {MAX_IMAGES} images. Max {MAX_FILE_SIZE_MB}MB each.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center gap-2 text-slate-500 hover:border-primary hover:bg-primary/5 hover:text-primary transition-colors"
            >
              <Upload className="w-8 h-8" />
              <span className="text-sm font-medium">Click to add pictures</span>
            </button>
            {evidenceImages.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2">
                {evidenceImages.map((url, i) => (
                  <div key={i} className="relative group">
                    <OptimizedImage src={url} alt={`Evidence ${i + 1}`} width={80} height={80} className="object-cover rounded-lg border border-slate-200" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-90 group-hover:opacity-100">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
            <div className="relative">
              <span className="text-xs text-slate-400">Or paste a link</span>
              <input type="text" value={evidence} onChange={(e) => setEvidence(e.target.value)} placeholder="Paste link to evidence (optional)" className="w-full mt-1 pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-primary/40 outline-none text-sm placeholder:text-slate-400" />
              <ImageIcon className="w-4 h-4 absolute left-3 top-9 text-slate-400" />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={returnRequested} onChange={() => setReturnRequested(!returnRequested)} className="sr-only" />
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${returnRequested ? "bg-primary border-primary text-white" : "border-slate-300"}`}>
              {returnRequested && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" /> Request Return
              </span>
              <p className="text-xs text-slate-500">Ask the seller to accept a product return for a full refund.</p>
            </div>
          </label>

          <button onClick={handleSubmit} disabled={!description.trim()} className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-sm text-sm disabled:opacity-50 flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Submit Dispute
          </button>
        </div>
      )}

      {phase === "review" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Timer */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <p className="font-bold text-amber-800 text-sm">Escrow Extended — Dispute Deadline</p>
            </div>
            <div className="flex items-center justify-center gap-3">
              {[
                { val: days, label: "Days" },
                { val: hours, label: "Hrs" },
                { val: minutes, label: "Min" },
                { val: seconds, label: "Sec" },
              ].map((t) => (
                <div key={t.label} className="bg-white border border-amber-200 rounded-lg px-3 py-2 min-w-[56px]">
                  <p className="text-2xl font-bold text-amber-800 font-mono">{String(t.val).padStart(2, "0")}</p>
                  <p className="text-[10px] text-amber-600 uppercase font-bold tracking-wider">{t.label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-amber-600">If unresolved, funds auto-release to the seller.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <h4 className="font-bold text-slate-900">Dispute Summary</h4>
            <p className="text-sm text-slate-600">{description}</p>
            {evidence && <p className="text-xs text-slate-500">Evidence link: {evidence}</p>}
            {evidenceImages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-slate-500">Uploaded images:</span>
                {evidenceImages.map((url, i) => (
                  <OptimizedImage key={i} src={url} alt={`Evidence ${i + 1}`} width={56} height={56} className="object-cover rounded border border-slate-200" />
                ))}
              </div>
            )}
            {returnRequested && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 font-semibold flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5" /> Return requested by buyer
              </div>
            )}
          </div>

          {returnRequested && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-500" />
                <p className="font-bold text-slate-700 text-sm">Seller Action (Simulation)</p>
              </div>
              <button onClick={handleSellerApproveReturn} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-sm text-sm flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> Seller Approves Return
              </button>
            </div>
          )}
        </motion.div>
      )}

      {phase === "resolved" && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center space-y-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }} className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-lg font-bold text-emerald-800">Dispute Resolved — Buyer Refunded</p>
          <p className="text-sm text-emerald-600">The return has been approved and funds refunded to you.</p>
        </motion.div>
      )}
    </div>
  );
}
