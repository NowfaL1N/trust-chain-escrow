"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  Key,
  KeyRound,
  Package,
  UserCheck,
  Wallet,
  Truck,
  Shield,
  X,
  ChevronLeft,
} from "lucide-react";

import CompanyVerificationForm from "./CompanyVerificationForm";
import SellerSelector, { type Seller } from "./SellerSelector";
import TokenGenerator from "./TokenGenerator";
import TokenVerification from "./TokenVerification";
import ProductRequestForm, { sellerListingFromApiSeller } from "./ProductRequestForm";
import SellerApprovalPanel from "./SellerApprovalPanel";
import PaymentSimulation from "./PaymentSimulation";
import DeliveryConfirmation from "./DeliveryConfirmation";
import DisputePanel from "./DisputePanel";
import {
  createTransaction,
  setProductDetails,
  fundTransaction,
  completeTransaction,
  acceptTransaction,
  approveReturn,
  rejectTransaction,
  type EscrowTransaction,
} from "@/services/transactionService";
import { clearTokens, type EscrowTokens } from "@/services/tokenService";
import { clearCompany } from "@/services/companyVerification";

const STEPS = [
  { id: 1, label: "Company", icon: Building2 },
  { id: 2, label: "Seller", icon: Users },
  { id: 3, label: "Tokens", icon: Key },
  { id: 4, label: "Verify", icon: KeyRound },
  { id: 5, label: "Product", icon: Package },
  { id: 6, label: "Approval", icon: UserCheck },
  { id: 7, label: "Payment", icon: Wallet },
  { id: 8, label: "Delivery", icon: Truck },
  { id: 9, label: "Complete", icon: Shield },
];

type Props = {
  onClose: () => void;
  initialTransaction?: EscrowTransaction | null;
};

export default function EscrowWizard({ onClose, initialTransaction }: Props) {
  const [step, setStep] = useState(() => (initialTransaction ? 6 : 1));
  const [direction, setDirection] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<"buyer" | "seller">("buyer");

  useEffect(() => {
    setMounted(true);
    const authStr = localStorage.getItem("escrow_demo_auth");
    if (authStr) {
      const auth = JSON.parse(authStr);
      setUserRole(auth.role || "buyer");
    }
  }, []);

  /** When resuming a transaction, recover seller row (for product listing) from the sellers directory. */
  useEffect(() => {
    const sid = initialTransaction?.sellerId;
    if (!sid) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("escrow_token") : null;
    fetch("/api/sellers", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Seller[]) => {
        const found = Array.isArray(data) ? data.find((s) => s.id === sid) : null;
        if (found) setSelectedSeller(found);
      })
      .catch(() => {});
  }, [initialTransaction?.sellerId]);

  // Wizard data (persisted when going back until transaction complete or modal closed)
  const [companyData, setCompanyData] = useState<Record<string, string> | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [, setTokens] = useState<EscrowTokens | null>(null);
  const [productRequest, setProductRequest] = useState<{ productName: string; quantity: number; pricePerUnit: number; deliveryTimeline: string; specialNotes: string } | null>(
    initialTransaction && initialTransaction.product
      ? {
          productName: initialTransaction.product.name,
          quantity: initialTransaction.product.quantity,
          pricePerUnit: initialTransaction.product.pricePerUnit,
          deliveryTimeline: initialTransaction.product.deliveryTimeline,
          specialNotes: initialTransaction.product.specialNotes,
        }
      : null
  );
  const [totalAmount, setTotalAmount] = useState(() =>
    initialTransaction
      ? initialTransaction.totalAmount ||
        (initialTransaction.product
          ? initialTransaction.product.quantity * initialTransaction.product.pricePerUnit
          : 0)
      : 0
  );
  const [transactionId, setTransactionId] = useState<string | null>(initialTransaction ? initialTransaction._id : null);
  const [emailSent, setEmailSent] = useState<{ buyer: boolean; seller: boolean } | null>(null);
  const [finalOutcome, setFinalOutcome] = useState<string | null>(null);

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 9));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const handleClose = () => {
    clearTokens();
    clearCompany();
    localStorage.removeItem("escrow_selected_seller");
    localStorage.removeItem("escrow_product_request");
    localStorage.removeItem("escrow_dispute");
    onClose();
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative bg-slate-50 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="shrink-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step > 1 && !finalOutcome && (
              <button
                onClick={goBack}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-lg font-bold text-slate-900">
              New Escrow Transaction
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Stepper */}
        <div className="shrink-0 bg-white border-b border-slate-100 px-6 py-3 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {STEPS.map((s, i) => {
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              return (
                <div key={s.id} className="flex items-center">
                  <div className="flex flex-col items-center gap-1 px-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all text-xs ${
                        isCompleted
                          ? "bg-emerald-500 text-white"
                          : isActive
                          ? "bg-primary text-white ring-4 ring-primary/20"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isCompleted ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <s.icon className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider ${
                        isActive
                          ? "text-primary"
                          : isCompleted
                          ? "text-emerald-600"
                          : "text-slate-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`w-4 h-0.5 mx-0.5 rounded ${
                        step > s.id ? "bg-emerald-400" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {step === 1 && (
                <CompanyVerificationForm
                  initialData={companyData}
                  onNext={(data) => {
                    setCompanyData(data);
                    goNext();
                  }}
                />
              )}

              {step === 2 && (
                <SellerSelector
                  initialSelected={selectedSeller}
                  onNext={async (seller) => {
                    setSelectedSeller(seller);
                    const authStr = localStorage.getItem("escrow_demo_auth");
                    const buyerLoginEmail = authStr ? JSON.parse(authStr).email : "buyer@example.com";
                    const buyerCompanyEmail = companyData?.companyEmail?.trim() || undefined;
                    const txn = await createTransaction(
                      companyData?.companyLegalName || "Buyer Co.",
                      seller.companyName,
                      buyerLoginEmail,
                      seller.email,
                      buyerCompanyEmail
                    );
                    if (txn?._id) setTransactionId(txn._id);
                    if (txn && "emailSent" in txn && txn.emailSent) setEmailSent(txn.emailSent as { buyer: boolean; seller: boolean });
                    goNext();
                  }}
                />
              )}

              {step === 3 && (
                <TokenGenerator
                  userRole={userRole}
                  emailSent={emailSent}
                  onNext={(t) => {
                    setTokens(t);
                    goNext();
                  }}
                />
              )}

              {step === 4 && <TokenVerification onNext={goNext} />}

              {step === 5 && (
                <ProductRequestForm
                  sellerListing={sellerListingFromApiSeller(selectedSeller)}
                  initialData={productRequest}
                  onNext={async (data) => {
                    setProductRequest(data);
                    const total = data.quantity * data.pricePerUnit;
                    setTotalAmount(total);
                    if (transactionId) {
                      await setProductDetails(transactionId, {
                        name: data.productName,
                        quantity: data.quantity,
                        pricePerUnit: data.pricePerUnit,
                        deliveryTimeline: data.deliveryTimeline,
                        specialNotes: data.specialNotes,
                      });
                    }
                    goNext();
                  }}
                />
              )}

              {step === 6 && (
                <SellerApprovalPanel
                  userRole={userRole}
                  transactionId={transactionId}
                  productRequest={productRequest}
                  onAccept={async () => {
                    if (transactionId && userRole === "seller") await acceptTransaction(transactionId);
                    goNext();
                  }}
                  onReject={async () => {
                    if (transactionId) await rejectTransaction(transactionId);
                    setFinalOutcome("rejected");
                    setStep(9);
                  }}
                />
              )}

              {step === 7 && (
                <PaymentSimulation
                  totalAmount={totalAmount}
                  onNext={async () => {
                    if (transactionId) await fundTransaction(transactionId);
                    goNext();
                  }}
                />
              )}

              {step === 8 && (
                <DeliveryConfirmation
                  onConfirm={async () => {
                    if (transactionId) await completeTransaction(transactionId);
                    setFinalOutcome("completed");
                    setStep(9);
                  }}
                  onDispute={() => {
                    // Dispute is handled in the next step anyway
                    setFinalOutcome("dispute");
                    setStep(9);
                  }}
                />
              )}

              {step === 9 && (
                <>
                  {finalOutcome === "completed" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-6 py-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 15,
                        }}
                        className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto"
                      >
                        <svg
                          className="w-10 h-10 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </motion.div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">
                          Transaction Complete!
                        </p>
                        <p className="text-slate-500 mt-2">
                          Funds have been released. The escrow transaction is
                          successfully completed.
                        </p>
                      </div>

                      {/* Timeline */}
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        {[
                          "Initiated",
                          "Funded",
                          "In Transit",
                          "Completed",
                        ].map((label, i) => (
                          <div
                            key={label}
                            className="flex items-center gap-2"
                          >
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                              {label}
                            </span>
                            {i < 3 && (
                              <div className="w-6 h-0.5 bg-emerald-400" />
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={handleClose}
                        className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-sm text-sm"
                      >
                        Close
                      </button>
                    </motion.div>
                  )}

                  {finalOutcome === "rejected" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center space-y-6 py-8"
                    >
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <X className="w-10 h-10 text-red-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">
                          Order Rejected
                        </p>
                        <p className="text-slate-500 mt-2">
                          The seller has declined this transaction.
                        </p>
                      </div>
                      <button
                        onClick={handleClose}
                        className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all shadow-sm text-sm"
                      >
                        Close
                      </button>
                    </motion.div>
                  )}

                  {finalOutcome === "dispute" && (
                    <DisputePanel
                      onComplete={async (outcome) => {
                        if (transactionId) {
                          if (outcome === "refunded") {
                            await approveReturn(transactionId);
                          } else {
                            await completeTransaction(transactionId);
                          }
                        }
                        setFinalOutcome(
                          outcome === "refunded" ? "refunded" : "completed"
                        );
                      }}
                    />
                  )}

                  {finalOutcome === "refunded" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-6 py-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 15,
                        }}
                        className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto"
                      >
                        <Wallet className="w-10 h-10 text-white" />
                      </motion.div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">
                          Buyer Refunded
                        </p>
                        <p className="text-slate-500 mt-2">
                          The dispute was resolved and funds returned to the
                          buyer.
                        </p>
                      </div>
                      <button
                        onClick={handleClose}
                        className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-sm text-sm"
                      >
                        Close
                      </button>
                    </motion.div>
                  )}

                  {!finalOutcome && (
                    <div className="text-center py-8">
                      <p className="text-slate-500">Processing…</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
