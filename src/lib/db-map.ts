/**
 * Map PostgreSQL rows (snake_case) to API shapes matching former Mongoose JSON (camelCase + _id).
 */

export type TransactionRow = {
  id: string;
  transaction_id: string;
  buyer_id: string;
  seller_id: string;
  status: string;
  buyer_company: string;
  seller_company: string;
  buyer_token: string | null;
  seller_token: string | null;
  product: Record<string, unknown> | null;
  total_amount: number | string | null;
  funded_at: string | null;
  completed_at: string | null;
  dispute_deadline: string | null;
  auto_release_deadline: string | null;
  dispute: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export function transactionRowToApi(row: TransactionRow): Record<string, unknown> {
  return {
    _id: row.id,
    transactionId: row.transaction_id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    status: row.status,
    buyerCompany: row.buyer_company,
    sellerCompany: row.seller_company,
    buyerToken: row.buyer_token ?? undefined,
    sellerToken: row.seller_token ?? undefined,
    product: row.product,
    totalAmount: row.total_amount != null ? Number(row.total_amount) : 0,
    fundedAt: row.funded_at,
    completedAt: row.completed_at,
    disputeDeadline: row.dispute_deadline,
    autoReleaseDeadline: row.auto_release_deadline,
    dispute: row.dispute,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Map PATCH body (camelCase from clients) to DB update object (snake_case). */
export function patchTransactionBodyToRow(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const map: [string, string][] = [
    ["status", "status"],
    ["buyerCompany", "buyer_company"],
    ["sellerCompany", "seller_company"],
    ["buyerToken", "buyer_token"],
    ["sellerToken", "seller_token"],
    ["product", "product"],
    ["totalAmount", "total_amount"],
    ["fundedAt", "funded_at"],
    ["completedAt", "completed_at"],
    ["disputeDeadline", "dispute_deadline"],
    ["autoReleaseDeadline", "auto_release_deadline"],
    ["dispute", "dispute"],
  ];
  for (const [camel, snake] of map) {
    if (camel in body && body[camel] !== undefined) {
      let v = body[camel];
      if (snake === "total_amount" && v != null) v = Number(v);
      out[snake] = v;
    }
  }
  out.updated_at = new Date().toISOString();
  return out;
}

export function isUniqueViolation(err: { code?: string; message?: string } | null): boolean {
  return err?.code === "23505" || (err?.message ?? "").includes("duplicate key");
}

/** PostgREST: table missing from DB or not yet in schema cache */
export function friendlyMissingTableError(err: { message?: string } | null): string | null {
  const msg = err?.message ?? "";
  if (!msg.includes("Could not find the table") && !msg.includes("schema cache")) {
    return null;
  }
  return (
    "Database tables are not created in this Supabase project. Fix: (1) Supabase Dashboard → SQL Editor → paste and run the file supabase/RUN_IN_SQL_EDITOR.sql, then try again. " +
    "Or (2) add DATABASE_URL from Supabase → Settings → Database → Connection string (URI, direct/session mode) to .env.local and run: npm run db:setup"
  );
}
