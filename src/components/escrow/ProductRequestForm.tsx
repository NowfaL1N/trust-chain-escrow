"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Hash, Calendar, FileText, DollarSign } from "lucide-react";
import { MAX_LISTING_PRODUCT_IMAGES } from "@/lib/listing-images";

export type SellerListingPreview = {
  name: string;
  pricePerUnit: number;
  description?: string;
  /** First image (convenience); same as imageUrls[0] when present */
  imageUrl?: string;
  imageUrls?: string[];
};

/** Build buyer-visible listing from `/api/sellers` row or selected seller object. */
export function sellerListingFromApiSeller(s: {
  listingProductName?: string | null;
  listingProductPrice?: number | null;
  listingProductDescription?: string | null;
  listingProductImageUrl?: string | null;
  listingProductImageUrls?: string[] | null;
} | null): SellerListingPreview | null {
  if (!s) return null;
  const name = (s.listingProductName ?? "").trim();
  const price = Number(s.listingProductPrice);
  if (!name || !Number.isFinite(price) || price <= 0) return null;
  const desc = (s.listingProductDescription ?? "").trim();
  const fromArr = Array.isArray(s.listingProductImageUrls)
    ? s.listingProductImageUrls
        .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
        .map((u) => u.trim())
    : [];
  const legacy = (s.listingProductImageUrl ?? "").trim();
  const imageUrls =
    fromArr.length > 0
      ? fromArr.slice(0, MAX_LISTING_PRODUCT_IMAGES)
      : legacy
        ? [legacy]
        : [];
  return {
    name,
    pricePerUnit: price,
    description: desc || undefined,
    imageUrls: imageUrls.length ? imageUrls : undefined,
    imageUrl: imageUrls[0],
  };
}

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

type Props = {
  onNext: (data: ProductData) => void;
  initialData?: ProductData | null;
  /** When set, product name and unit price come from the seller; buyer only adjusts quantity, timeline, and notes. */
  sellerListing: SellerListingPreview | null;
};

export default function ProductRequestForm({ onNext, initialData, sellerListing }: Props) {
  const [form, setForm] = useState<ProductData>(() => ({
    ...DEFAULT_PRODUCT,
    ...(initialData || {}),
  }));
  const [showSummary, setShowSummary] = useState(false);

  const listingOk =
    sellerListing != null &&
    sellerListing.name.trim().length > 0 &&
    Number.isFinite(sellerListing.pricePerUnit) &&
    sellerListing.pricePerUnit > 0;

  useEffect(() => {
    if (initialData && (initialData.productName || initialData.deliveryTimeline)) {
      setForm((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  useEffect(() => {
    if (listingOk && sellerListing) {
      setForm((prev) => ({
        ...prev,
        productName: sellerListing.name,
        pricePerUnit: sellerListing.pricePerUnit,
      }));
    }
  }, [listingOk, sellerListing]);

  const effectiveName = listingOk && sellerListing ? sellerListing.name : form.productName;
  const effectivePrice = listingOk && sellerListing ? sellerListing.pricePerUnit : form.pricePerUnit;
  const total = form.quantity * effectivePrice;

  const handleSubmit = () => {
    if (!listingOk) return;
    if (!form.deliveryTimeline?.trim()) return;
    const payload: ProductData = {
      ...form,
      productName: sellerListing!.name,
      pricePerUnit: sellerListing!.pricePerUnit,
    };
    localStorage.setItem("escrow_product_request", JSON.stringify(payload));
    setShowSummary(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Product Request</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {listingOk
            ? "This order uses the seller’s listed product and price. You choose quantity, delivery expectations, and any notes."
            : "The seller must complete Product listing (sidebar) with a name and unit price before you can continue."}
        </p>
      </div>

      {!listingOk && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          Ask the seller to open <strong>Product listing</strong> in the sidebar and add a product name, price, and
          optional photos. Then return to this step.
        </div>
      )}

      {!showSummary ? (
        <div className="space-y-5">
          {listingOk && sellerListing ? (
            <div className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Seller’s product
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                {(sellerListing.imageUrls?.length ?? 0) > 0 ? (
                  <div className="flex flex-wrap gap-2 shrink-0 max-w-full">
                    {sellerListing.imageUrls!.map((url, idx) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={`${idx}-${url}`}
                        src={url}
                        alt=""
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-slate-200 dark:border-slate-600"
                      />
                    ))}
                  </div>
                ) : sellerListing.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={sellerListing.imageUrl}
                    alt=""
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover border border-slate-200 dark:border-slate-600 shrink-0"
                  />
                ) : (
                  <Package className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 space-y-1 flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">{sellerListing.name}</p>
                  {sellerListing.description ? (
                    <p className="text-sm text-slate-600 dark:text-slate-300">{sellerListing.description}</p>
                  ) : null}
                  <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <span>
                      Price per unit:{" "}
                      <span className="font-bold text-slate-900 dark:text-white">
                        ${sellerListing.pricePerUnit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>{" "}
                      <span className="text-slate-500 dark:text-slate-400">(set by seller)</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 opacity-60 pointer-events-none">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Product Name</label>
              <div className="relative">
                <Package className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.productName}
                  readOnly
                  placeholder="—"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 outline-none text-sm"
                />
              </div>
            </div>
          )}

          <div className={listingOk ? "grid grid-cols-1 sm:grid-cols-1 gap-4" : "grid grid-cols-2 gap-4"}>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Quantity</label>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min={1}
                  disabled={!listingOk}
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, quantity: Math.max(1, parseInt(e.target.value, 10) || 1) }))
                  }
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary/40 outline-none text-sm disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Delivery Timeline</label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                disabled={!listingOk}
                value={form.deliveryTimeline}
                onChange={(e) => setForm((p) => ({ ...p, deliveryTimeline: e.target.value }))}
                placeholder="e.g. 30 days from payment"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary/40 outline-none text-sm placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Special Notes</label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <textarea
                disabled={!listingOk}
                value={form.specialNotes}
                onChange={(e) => setForm((p) => ({ ...p, specialNotes: e.target.value }))}
                placeholder="Any additional requirements…"
                rows={3}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary/40 outline-none text-sm resize-none placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>
          </div>
          {listingOk && total > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-300">Estimated Total</span>
              <span className="text-lg font-bold text-primary">
                ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={!listingOk || !form.deliveryTimeline?.trim()}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Review Summary
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white">Transaction Summary</h4>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <span className="text-slate-500 dark:text-slate-400">Product</span>
              <span className="font-semibold text-slate-900 dark:text-white">{effectiveName}</span>
              <span className="text-slate-500 dark:text-slate-400">Quantity</span>
              <span className="font-semibold text-slate-900 dark:text-white">{form.quantity}</span>
              <span className="text-slate-500 dark:text-slate-400">Price / Unit</span>
              <span className="font-semibold text-slate-900 dark:text-white">${effectivePrice.toFixed(2)}</span>
              <span className="text-slate-500 dark:text-slate-400">Timeline</span>
              <span className="font-semibold text-slate-900 dark:text-white">{form.deliveryTimeline}</span>
              {form.specialNotes && (
                <>
                  <span className="text-slate-500 dark:text-slate-400">Notes</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{form.specialNotes}</span>
                </>
              )}
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="font-bold text-slate-900 dark:text-white">Total Amount</span>
              <span className="text-2xl font-bold text-primary">
                ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowSummary(false)}
              className="flex-1 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Edit Details
            </button>
            <button
              onClick={() =>
                onNext({
                  ...form,
                  productName: sellerListing!.name,
                  pricePerUnit: sellerListing!.pricePerUnit,
                })
              }
              className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-sm text-sm"
            >
              Submit Request
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
