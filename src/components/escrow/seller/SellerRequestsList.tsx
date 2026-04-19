import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Clock, ShieldCheck, FileText, CheckCircle2, AlertTriangle, Truck, Banknote, ShieldAlert, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import SellerTokenVerificationModal from "./SellerTokenVerificationModal";
import SellerDecisionPanel from "./SellerDecisionPanel";
import EscrowStatusCard from "./EscrowStatusCard";
import DeliveryStatusUpdater from "./DeliveryStatusUpdater";
import DisputeForm from "./DisputeForm";
import type { EscrowTransaction } from "@/services/transactionService";

function formatTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
}

type Props = {
  transactions: EscrowTransaction[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onUpdateDelivery: (id: string, state: "shipped" | "delivered") => void;
  onRaiseDispute: (
    id: string,
    details: { title: string; description: string; resolution: string; imageUrls: string[] }
  ) => void | Promise<void>;
  activeTab: string;
};

export default function SellerRequestsList({ transactions, onAccept, onReject, onUpdateDelivery, onRaiseDispute, activeTab }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifiedIds, setVerifiedIds] = useState<Set<string>>(new Set());
  const [disputingId, setDisputingId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "initiated":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><Clock className="w-3.5 h-3.5" /> Awaiting Verification</span>;
      case "seller_approved":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700"><CheckCircle2 className="w-3.5 h-3.5" /> Approved - Awaiting Buyer Funding</span>;
      case "funded":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><Banknote className="w-3.5 h-3.5" /> Payment Secured</span>;
      case "in_transit":
      case "shipped":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700"><Truck className="w-3.5 h-3.5" /> In Transit</span>;
      case "delivered":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-700"><Package className="w-3.5 h-3.5" /> Delivered - Pending Buyer Review</span>;
      case "completed":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><ShieldCheck className="w-3.5 h-3.5" /> Complete - Funds Released</span>;
      case "disputed":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border-rose-200 border"><ShieldAlert className="w-3.5 h-3.5" /> Disputed</span>;
      case "rejected":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700"><AlertTriangle className="w-3.5 h-3.5" /> Rejected by You</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const isVerified = (id: string) => verifiedIds.has(id);

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No {activeTab.replace('_', ' ')} found</h3>
        <p className="text-slate-500">You don&apos;t have any incoming requests matching this criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((txn, index) => {
        const expanded = expandedId === txn._id;
        const total = txn.totalAmount || (txn.product ? txn.product.quantity * txn.product.pricePerUnit : 0);

        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            key={txn._id}
            className={`bg-white dark:bg-slate-900 border rounded-xl overflow-hidden transition-all duration-300 ${expanded ? 'border-primary/50 shadow-md' : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'}`}
          >
            {/* Header / Summary */}
            <div 
              className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
              onClick={() => setExpandedId(expanded ? null : txn._id)}
            >
              <div className="flex-1 space-y-3 w-full">
                <div className="flex justify-between items-start w-full gap-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-400 mb-1 block">{txn._id}</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{txn.buyerCompany}</h3>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold text-slate-900 dark:text-white">${total.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">{formatTime(new Date(txn.createdAt))}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 truncate w-full">
                  <span className="flex items-center gap-1.5"><Package className="w-4 h-4 text-primary" /> {txn.product?.name || "Pending Details"} x{txn.product?.quantity || 0}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" /> {txn.product?.deliveryTimeline || "N/A"}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                {getStatusBadge(txn.status)}
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full">
                  {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Expanded Body */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/10"
                >
                  <div className="p-5 sm:p-6">
                    {/* Action Area for INITIATED status */}
                    {txn.status === "initiated" && (
                      <div className="mb-8">
                        {!isVerified(txn._id) ? (
                          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
                            <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-3" />
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Security Verification Required</h4>
                            <p className="text-slate-500 mb-6 max-w-md mx-auto">To protect sensitive order data, please provide your secure ESCROW JWT token before reviewing this order request.</p>
                            <Button onClick={() => setVerifyingId(txn._id)} className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20">
                              Verify Seller Token & Unlock
                            </Button>
                          </div>
                        ) : (
                          <SellerDecisionPanel
                            onAccept={() => onAccept(txn._id)}
                            onReject={() => onReject(txn._id)}
                          />
                        )}
                      </div>
                    )}
                    
                    {/* Active Escrow State */}
                    {(txn.status === "funded" || txn.status === "in_transit" || txn.status === "shipped" || txn.status === "delivered" || txn.status === "completed") && (
                       <div className="mb-8">
                         <EscrowStatusCard />
                       </div>
                    )}

                    {/* Active Status Actions */}
                    {(txn.status === "funded" || txn.status === "in_transit" || txn.status === "shipped" || txn.status === "delivered") && (
                      <div className="mb-8 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Active Order Management</h4>
                            <p className="text-sm text-slate-500">Update shipping and handle active disputes here.</p>
                          </div>
                          <Button 
                            variant="outline" 
                            onClick={() => setDisputingId(txn._id)}
                            className="border-rose-200 text-rose-600 hover:bg-rose-50"
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Raise Dispute
                          </Button>
                        </div>

                        {disputingId === txn._id ? (
                          <DisputeForm
                            transactionId={txn._id}
                            onSubmit={async (payload) => {
                              await onRaiseDispute(txn._id, {
                                title: payload.title,
                                description: payload.description,
                                resolution: payload.resolution,
                                imageUrls: payload.imageUrls,
                              });
                              setDisputingId(null);
                            }}
                            onCancel={() => setDisputingId(null)}
                          />
                        ) : (
                          <DeliveryStatusUpdater 
                            currentStatus={txn.status}
                            onUpdateStatus={(s) => onUpdateDelivery(txn._id, s)}
                          />
                        )}
                      </div>
                    )}

                    {/* Escrow Details Read-Only Blocks (Always visible when expanded and verified/not-initiated) */}
                    {(txn.status !== "initiated" || isVerified(txn._id)) && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mt-4">
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Order Information</h4>
                            <dl className="space-y-3 text-sm">
                              <div className="grid grid-cols-3"><dt className="text-slate-500">Product</dt><dd className="col-span-2 font-medium text-slate-900 dark:text-white">{txn.product?.name}</dd></div>
                              <div className="grid grid-cols-3"><dt className="text-slate-500">Quantity</dt><dd className="col-span-2 text-slate-900 dark:text-white">{txn.product?.quantity} units</dd></div>
                              <div className="grid grid-cols-3"><dt className="text-slate-500">Price per Unit</dt><dd className="col-span-2 text-slate-900 dark:text-white">${txn.product?.pricePerUnit?.toLocaleString()}</dd></div>
                              <div className="grid grid-cols-3"><dt className="text-slate-500">Delivery By</dt><dd className="col-span-2 text-slate-900 dark:text-white">{txn.product?.deliveryTimeline}</dd></div>
                              {txn.product?.specialNotes && (
                                <div className="mt-4"><dt className="text-slate-500 mb-1">Special Notes / Terms</dt><dd className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 italic">&quot;{txn.product.specialNotes}&quot;</dd></div>
                              )}
                            </dl>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Buyer Information</h4>
                            <dl className="space-y-3 text-sm">
                              <div className="grid grid-cols-3"><dt className="text-slate-500">Company</dt><dd className="col-span-2 font-medium text-slate-900 dark:text-white">{txn.buyerCompany}</dd></div>
                              <div className="grid grid-cols-3"><dt className="text-slate-500">System ID</dt><dd className="col-span-2 text-slate-900 dark:text-white font-mono text-xs">{txn._id}</dd></div>
                              <div className="grid grid-cols-3"><dt className="text-slate-500">Request Date</dt><dd className="col-span-2 text-slate-900 dark:text-white">{new Date(txn.createdAt).toLocaleString()}</dd></div>
                              {txn.fundedAt && <div className="grid grid-cols-3"><dt className="text-emerald-600 font-medium">Funded Date</dt><dd className="col-span-2 text-slate-900 dark:text-white">{new Date(txn.fundedAt).toLocaleString()}</dd></div>}
                            </dl>
                          </div>
                        </div>
                        {txn.status === "disputed" && txn.dispute && (
                          <div className="mt-4 bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl p-6">
                            <h4 className="font-bold text-rose-900 dark:text-rose-100 mb-3">Dispute on file</h4>
                            {"title" in txn.dispute && (txn.dispute as { title?: string }).title && (
                              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                                {(txn.dispute as { title?: string }).title}
                              </p>
                            )}
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{txn.dispute.description}</p>
                            {"resolution" in txn.dispute && (txn.dispute as { resolution?: string }).resolution && (
                              <p className="text-xs text-slate-500 mt-2">
                                Requested resolution: {(txn.dispute as { resolution?: string }).resolution}
                              </p>
                            )}
                            {Array.isArray((txn.dispute as { evidenceImageUrls?: string[] }).evidenceImageUrls) &&
                              (txn.dispute as { evidenceImageUrls: string[] }).evidenceImageUrls.length > 0 && (
                                <div className="mt-4">
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Evidence (stored)</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(txn.dispute as { evidenceImageUrls: string[] }).evidenceImageUrls.map((url) => (
                                      <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="block">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={url} alt="" className="w-24 h-24 object-cover rounded-lg border border-rose-200 dark:border-rose-800" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {verifyingId && (
        <SellerTokenVerificationModal 
          onVerify={() => {
            const newSet = new Set(verifiedIds);
            newSet.add(verifyingId);
            setVerifiedIds(newSet);
            setVerifyingId(null);
          }}
          onCancel={() => setVerifyingId(null)}
        />
      )}
    </div>
  );
}
