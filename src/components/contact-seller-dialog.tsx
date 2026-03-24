"use client";

import { useEffect, useState } from "react";
import { X, MapPin, Star, Mail, Phone, User, Building2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export type SellerContactDetails = {
  name: string;
  location: string;
  rating: number;
  deals: number;
  tags: string[];
  email: string;
  phone: string;
  contactPerson: string;
  companyAddress: string;
};

type ContactSellerDialogProps = {
  seller: SellerContactDetails | null;
  onClose: () => void;
  title?: string;
};

export function ContactSellerDialog({ seller, onClose, title = "Contact Seller" }: ContactSellerDialogProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (seller) {
      const handleEscape = (e: KeyboardEvent) => e.key === "Escape" && onClose();
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
      };
    }
  }, [seller, onClose]);

  if (!seller) return null;

  function copyEmail() {
    if (!seller) return;
    navigator.clipboard.writeText(seller.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-seller-title"
        className="relative w-full max-w-md rounded-xl bg-card shadow-xl border border-border overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <h2 id="contact-seller-title" className="text-xl font-bold text-foreground">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <h3 className="font-bold text-lg text-foreground">{seller.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-4 h-4 shrink-0" /> {seller.location}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={`w-4 h-4 ${n <= Math.floor(seller.rating) ? "fill-current" : ""}`} />
                ))}
              </div>
              <span className="text-sm font-semibold text-foreground">{seller.rating}</span>
              <span className="text-xs text-muted-foreground">({seller.deals} deals)</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {seller.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-muted rounded text-xs font-medium text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>

            <div className="border-t border-border pt-5 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact details</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium text-foreground break-all">{seller.email}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyEmail} className="shrink-0 border-border text-foreground flex items-center gap-1.5">
                    {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : "Copy"}
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium text-foreground">{seller.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Contact person</p>
                    <p className="text-sm font-medium text-foreground">{seller.contactPerson}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="text-sm font-medium text-foreground">{seller.companyAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button asChild className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
              <a href={`mailto:${seller.email}`}>Send email</a>
            </Button>
            <Button variant="outline" onClick={onClose} className="border-border text-foreground">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
