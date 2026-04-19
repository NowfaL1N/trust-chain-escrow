"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Star, CheckCircle, Mail } from "lucide-react";

export type Seller = {
  id: string;
  companyName: string;
  industry: string;
  location: string;
  trustScore: number;
  email: string;
  listingProductName?: string | null;
  listingProductPrice?: number | null;
  listingProductDescription?: string | null;
  listingProductImageUrl?: string | null;
  listingProductImageUrls?: string[];
};

type Props = { onNext: (seller: Seller) => void; initialSelected?: Seller | null };

export default function SellerSelector({ onNext, initialSelected }: Props) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Seller | null>(initialSelected ?? null);
  const [sellerEmail, setSellerEmail] = useState("");
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialSelected) setSelected(initialSelected);
  }, [initialSelected]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("escrow_token") : null;
    fetch("/api/sellers", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setSellers(Array.isArray(data) ? data : []))
      .catch(() => setSellers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = sellers.filter(
    (s) =>
      s.companyName.toLowerCase().includes(search.toLowerCase()) ||
      s.industry.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (seller: Seller) => {
    setSelected(seller);
    setSellerEmail("");
    localStorage.setItem("escrow_selected_seller", JSON.stringify(seller));
  };

  const handleContinueWithEmail = () => {
    const email = sellerEmail.trim().toLowerCase();
    if (!email) return;
    const fromList = sellers.find((s) => s.email.toLowerCase() === email);
    const seller: Seller = fromList
      ? { ...fromList, email: fromList.email }
      : {
          id: email,
          companyName: email,
          industry: "—",
          location: "—",
          trustScore: 0,
          email,
        };
    setSelected(seller);
    localStorage.setItem("escrow_selected_seller", JSON.stringify(seller));
    onNext(seller);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Select a Seller</h3>
        <p className="text-sm text-slate-500 mt-1">
          Enter the seller&apos;s email to initiate an escrow transaction. Sellers must have an account on the platform.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Seller email</label>
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="email"
            value={sellerEmail}
            onChange={(e) => setSellerEmail(e.target.value)}
            placeholder="seller@company.com"
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm placeholder:text-slate-400"
          />
        </div>
      </div>

      {!loading && sellers.length > 0 && (
        <>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company, industry, or location…"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm placeholder:text-slate-400"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[280px] overflow-y-auto pr-1">
            {filtered.map((seller, i) => (
              <motion.div
                key={seller.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => handleSelect(seller)}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selected?.id === seller.id ? "border-primary bg-primary/5 shadow-md" : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                {selected?.id === seller.id && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </motion.div>
                )}
                <h4 className="font-bold text-slate-900 mb-1">{seller.companyName}</h4>
                <p className="text-xs text-slate-500 mb-2">{seller.industry}</p>
                {seller.listingProductName && seller.listingProductPrice != null && seller.listingProductPrice > 0 && (
                  <div className="flex gap-2 mb-2 items-start">
                    {(() => {
                      const imgs =
                        Array.isArray(seller.listingProductImageUrls) && seller.listingProductImageUrls.length > 0
                          ? seller.listingProductImageUrls
                          : seller.listingProductImageUrl
                            ? [seller.listingProductImageUrl]
                            : [];
                      const show = imgs.slice(0, 4);
                      const more = imgs.length - show.length;
                      return show.length > 0 ? (
                        <div className="flex gap-1 shrink-0">
                          {show.map((src, idx) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={`${idx}-${src}`}
                              src={src}
                              alt=""
                              className="w-10 h-10 rounded-md object-cover border border-slate-200"
                            />
                          ))}
                          {more > 0 && (
                            <span className="w-10 h-10 rounded-md border border-slate-200 bg-slate-100 text-[10px] font-bold flex items-center justify-center text-slate-600">
                              +{more}
                            </span>
                          )}
                        </div>
                      ) : null;
                    })()}
                    <p className="text-xs text-slate-600 line-clamp-2">
                      <span className="font-semibold">{seller.listingProductName}</span>
                      <span className="text-slate-400"> · </span>$
                      {Number(seller.listingProductPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })}/unit
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {seller.location}</span>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {seller.trustScore}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {!loading && sellers.length === 0 && (
        <p className="text-sm text-slate-500">
          No sellers in the list yet. Enter a seller&apos;s email above to continue. They must be registered on TrustChain.
        </p>
      )}

      {loading && <p className="text-sm text-slate-500">Loading sellers…</p>}

      <motion.button
        type="button"
        onClick={handleContinueWithEmail}
        disabled={!sellerEmail.trim()}
        className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-sm text-sm"
      >
        Continue with seller email
      </motion.button>

      {selected && sellers.some((s) => s.id === selected.id) && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onNext(selected)}
          className="w-full py-3 border-2 border-primary text-primary hover:bg-primary/5 font-bold rounded-xl transition-all text-sm"
        >
          Continue with {selected.companyName}
        </motion.button>
      )}
    </div>
  );
}
