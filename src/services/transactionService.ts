/**
 * Transaction Service — escrow state machine via REST API (Supabase-backed).
 */

export type TransactionStatus =
  | "initiated"
  | "seller_approved"
  | "rejected"
  | "funded"
  | "in_transit"
  | "shipped"
  | "delivered"
  | "completed"
  | "disputed"
  | "refunded";

export type EscrowTransaction = {
  _id: string; // Transaction id (UUID from API)
  status: TransactionStatus;
  buyerCompany: string;
  sellerCompany: string;
  product: {
    name: string;
    quantity: number;
    pricePerUnit: number;
    deliveryTimeline: string;
    specialNotes: string;
  } | null;
  totalAmount: number;
  createdAt: string;
  fundedAt: string | null;
  completedAt: string | null;
  disputeDeadline: string | null;
  autoReleaseDeadline: string | null;
  dispute: {
    description: string;
    evidence: string;
    returnRequested: boolean;
    sellerApprovedReturn: boolean;
  } | null;
};

const getAuthHeader = (): Record<string, string> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("escrow_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function getTransactions(): Promise<EscrowTransaction[]> {
  const res = await fetch("/api/transactions", {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getTransaction(id: string): Promise<EscrowTransaction | null> {
  const res = await fetch(`/api/transactions/${id}`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function createTransaction(
  buyerCompany: string,
  sellerCompany: string,
  buyerEmail: string,
  sellerEmail: string,
  buyerCompanyEmail?: string
): Promise<EscrowTransaction> {
  const res = await fetch("/api/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({
      buyerCompany,
      sellerCompany,
      buyerEmail,
      sellerEmail,
      buyerCompanyEmail: buyerCompanyEmail || undefined,
    }),
  });
  if (!res.ok) {
    let message = "Failed to create transaction";
    try {
      const data = await res.json();
      if (typeof data?.error === "string") message = data.error;
    } catch {
      message = res.status === 401 ? "Please sign in to create a transaction" : message;
    }
    throw new Error(message);
  }
  return res.json();
}

export async function updateTransaction(id: string, updates: Partial<EscrowTransaction>): Promise<EscrowTransaction | null> {
  const res = await fetch(`/api/transactions/${id}`, {
    method: "PATCH",
    headers: { 
      "Content-Type": "application/json",
      ...getAuthHeader()
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function setProductDetails(id: string, product: EscrowTransaction["product"]): Promise<EscrowTransaction | null> {
  if (!product) return null;
  const total = product.quantity * product.pricePerUnit;
  return updateTransaction(id, { product, totalAmount: total });
}

export async function fundTransaction(id: string): Promise<EscrowTransaction | null> {
  return updateTransaction(id, {
    status: "funded",
    fundedAt: new Date().toISOString(),
  });
}

export async function markInTransit(id: string): Promise<EscrowTransaction | null> {
  return updateTransaction(id, { status: "in_transit" });
}

export async function completeTransaction(id: string): Promise<EscrowTransaction | null> {
  return updateTransaction(id, {
    status: "completed",
    completedAt: new Date().toISOString(),
  });
}

export async function acceptTransaction(id: string): Promise<EscrowTransaction | null> {
  return updateTransaction(id, { status: "seller_approved" });
}

export async function rejectTransaction(id: string): Promise<EscrowTransaction | null> {
  return updateTransaction(id, { status: "rejected" });
}

export async function updateDeliveryStatus(id: string, status: "shipped" | "delivered"): Promise<EscrowTransaction | null> {
  return updateTransaction(id, { status });
}

export async function raiseDispute(id: string, description: string, evidence: string, returnRequested: boolean): Promise<EscrowTransaction | null> {
  const now = new Date();
  const disputeDeadline = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000); // 45 days
  return updateTransaction(id, {
    status: "disputed",
    dispute: {
      description,
      evidence,
      returnRequested,
      sellerApprovedReturn: false,
    },
    disputeDeadline: disputeDeadline.toISOString(),
  });
}

export async function approveReturn(id: string): Promise<EscrowTransaction | null> {
  const txn = await getTransaction(id);
  if (!txn?.dispute) return null;
  return updateTransaction(id, {
    status: "refunded",
    dispute: { ...txn.dispute, sellerApprovedReturn: true },
    completedAt: new Date().toISOString(),
  });
}

export async function deleteTransaction(id: string): Promise<boolean> {
  const res = await fetch(`/api/transactions/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeader(),
    },
  });
  return res.ok;
}

/** Calculate remaining time helper (stays synchronous) */
export function getRemainingTime(txn: EscrowTransaction): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  label: string;
} | null {
  const deadline = txn.status === "disputed" ? txn.disputeDeadline : txn.autoReleaseDeadline;
  if (!deadline) return null;

  const remaining = new Date(deadline).getTime() - Date.now();
  if (remaining <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, label: txn.status === "disputed" ? "Dispute deadline" : "Auto-release" };

  return {
    days: Math.floor(remaining / (1000 * 60 * 60 * 24)),
    hours: Math.floor((remaining / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((remaining / (1000 * 60)) % 60),
    seconds: Math.floor((remaining / 1000) % 60),
    total: remaining,
    label: txn.status === "disputed" ? "Dispute deadline" : "Auto-release",
  };
}
