"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Hash, DollarSign, Calendar, FileText } from "lucide-react";

type ProductData = {
  productName: string;
  quantity: number;
  pricePerUnit: number;
  deliveryTimeline: string;
  specialNotes: string;
};

const DEFAULT_PRODUCT: ProductData = {
  productName: "",
  quantity: 1,
  pricePerUnit: 0,
  deliveryTimeline: "",
  specialNotes: "",
};

type Props = { onNext: (data: ProductData) => void; initialData?: ProductData | null };

export default function ProductRequestForm({ onNext, initialData }: Props) {
  const [form, setForm] = useState<ProductData>(() => ({
    ...DEFAULT_PRODUCT,
    ...(initialData || {}),
  }));
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (initialData && (initialData.productName || initialData.deliveryTimeline)) {
      setForm((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const total = form.quantity * form.pricePerUnit;

  const handleSubmit = () => {
    if (!form.productName || !form.pricePerUnit || !form.deliveryTimeline) return;
    localStorage.setItem("escrow_product_request", JSON.stringify(form));
    setShowSummary(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Product Request</h3>
        <p className="text-sm text-slate-500 mt-1">Define the product details for this escrow transaction.</p>
      </div>

      {!showSummary ? (
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Product Name</label>
            <div className="relative">
              <Package className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={form.productName} onChange={(e) => setForm(p => ({ ...p, productName: e.target.value }))} placeholder="e.g. Semiconductor Chips" className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 outline-none text-sm placeholder:text-slate-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Quantity</label>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="number" min={1} value={form.quantity} onChange={(e) => setForm(p => ({ ...p, quantity: Math.max(1, parseInt(e.target.value) || 1) }))} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 outline-none text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Price per Unit ($)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="number" min={0} step={0.01} value={form.pricePerUnit || ""} onChange={(e) => setForm(p => ({ ...p, pricePerUnit: parseFloat(e.target.value) || 0 }))} placeholder="0.00" className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 outline-none text-sm placeholder:text-slate-400" />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Delivery Timeline</label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={form.deliveryTimeline} onChange={(e) => setForm(p => ({ ...p, deliveryTimeline: e.target.value }))} placeholder="e.g. 30 days from payment" className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 outline-none text-sm placeholder:text-slate-400" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Special Notes</label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <textarea value={form.specialNotes} onChange={(e) => setForm(p => ({ ...p, specialNotes: e.target.value }))} placeholder="Any additional requirements…" rows={3} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 outline-none text-sm resize-none placeholder:text-slate-400" />
            </div>
          </div>
          {total > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex justify-between items-center">
              <span className="text-sm text-slate-600">Estimated Total</span>
              <span className="text-lg font-bold text-primary">${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <button onClick={handleSubmit} disabled={!form.productName || !form.pricePerUnit || !form.deliveryTimeline} className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed">
            Review Summary
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h4 className="font-bold text-slate-900">Transaction Summary</h4>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <span className="text-slate-500">Product</span><span className="font-semibold text-slate-900">{form.productName}</span>
              <span className="text-slate-500">Quantity</span><span className="font-semibold text-slate-900">{form.quantity}</span>
              <span className="text-slate-500">Price / Unit</span><span className="font-semibold text-slate-900">${form.pricePerUnit.toFixed(2)}</span>
              <span className="text-slate-500">Timeline</span><span className="font-semibold text-slate-900">{form.deliveryTimeline}</span>
              {form.specialNotes && <><span className="text-slate-500">Notes</span><span className="font-semibold text-slate-900">{form.specialNotes}</span></>}
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="font-bold text-slate-900">Total Amount</span>
              <span className="text-2xl font-bold text-primary">${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowSummary(false)} className="flex-1 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl transition-all text-sm hover:bg-slate-50">Edit Details</button>
            <button onClick={() => onNext(form)} className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-sm text-sm">Submit Request</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
