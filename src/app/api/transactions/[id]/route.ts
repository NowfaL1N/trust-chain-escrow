import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { verifyJWT } from "@/lib/verifyJWT";
import { patchTransactionBodyToRow, transactionRowToApi, type TransactionRow } from "@/lib/db-map";
import type { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function asProductRecord(v: unknown): Record<string, unknown> | null {
  return v != null && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

/** Buyers may only submit quantity, delivery, and notes; name and unit price come from the seller's listing. */
async function normalizeBuyerProductPatch(
  supabase: SupabaseClient,
  sellerId: string,
  product: Record<string, unknown>
): Promise<{ product: Record<string, unknown>; totalAmount: number } | { error: string; status: number }> {
  const { data: sellerUser } = await supabase.from("users").select("company_id").eq("id", sellerId).maybeSingle();
  if (!sellerUser?.company_id) {
    return { error: "Seller company not found", status: 400 };
  }
  const { data: company } = await supabase
    .from("companies")
    .select("listing_product_name, listing_product_price")
    .eq("id", sellerUser.company_id)
    .maybeSingle();

  const listingName = (company?.listing_product_name as string | undefined)?.trim() ?? "";
  const priceNum =
    company?.listing_product_price != null ? Number(company.listing_product_price) : NaN;

  if (!listingName || !Number.isFinite(priceNum) || priceNum <= 0) {
    return {
      error:
        "The seller must publish a product name and unit price in Seller Settings before you can submit this step.",
      status: 400,
    };
  }

  const qty = Number(product.quantity);
  if (!Number.isFinite(qty) || qty < 1) {
    return { error: "Invalid quantity", status: 400 };
  }

  const deliveryTimeline =
    typeof product.deliveryTimeline === "string" ? product.deliveryTimeline.trim() : "";
  if (!deliveryTimeline) {
    return { error: "Delivery timeline is required", status: 400 };
  }

  const specialNotes =
    typeof product.specialNotes === "string" ? product.specialNotes.trim() : "";

  const normalized = {
    name: listingName,
    quantity: qty,
    pricePerUnit: priceNum,
    deliveryTimeline,
    specialNotes,
  };

  return { product: normalized, totalAmount: qty * priceNum };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyJWT(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const rawBody = await request.json();
    const body: Record<string, unknown> =
      rawBody != null && typeof rawBody === "object" && !Array.isArray(rawBody)
        ? (rawBody as Record<string, unknown>)
        : {};
    const supabase = getSupabaseServer();

    const { data: existingTxn, error: fetchErr } = await supabase
      .from("transactions")
      .select("buyer_id, seller_id")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !existingTxn) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isAuthorized =
      existingTxn.buyer_id === auth.user.userId || existingTxn.seller_id === auth.user.userId;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (auth.user.role === "buyer" && "product" in body) {
      const p = asProductRecord(body.product);
      if (p) {
        const normalized = await normalizeBuyerProductPatch(supabase, existingTxn.seller_id, p);
        if ("error" in normalized) {
          return NextResponse.json({ error: normalized.error }, { status: normalized.status });
        }
        body.product = normalized.product;
        body.totalAmount = normalized.totalAmount;
      }
    }

    const updates = patchTransactionBodyToRow(body);
    const { data: txn, error: updateErr } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (updateErr || !txn) {
      console.error("Update transaction:", updateErr);
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(transactionRowToApi(txn as TransactionRow));
  } catch (err) {
    console.error("Update Transaction Error:", err);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyJWT(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    const supabase = getSupabaseServer();
    const { data: txn, error } = await supabase.from("transactions").select("*").eq("id", id).maybeSingle();

    if (error || !txn) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isAuthorized =
      txn.buyer_id === auth.user.userId || txn.seller_id === auth.user.userId;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(transactionRowToApi(txn as TransactionRow));
  } catch (err) {
    console.error("Fetch Transaction Item Error:", err);
    return NextResponse.json({ error: "Failed to fetch transaction" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyJWT(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const supabase = getSupabaseServer();

    const { data: existingTxn, error: fetchErr } = await supabase
      .from("transactions")
      .select("buyer_id, seller_id")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !existingTxn) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isAuthorized =
      existingTxn.buyer_id === auth.user.userId || existingTxn.seller_id === auth.user.userId;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error: delErr } = await supabase.from("transactions").delete().eq("id", id);
    if (delErr) {
      console.error("Delete transaction:", delErr);
      return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete Transaction Error:", err);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
