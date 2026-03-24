import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { verifyJWT } from "@/lib/verifyJWT";
import { patchTransactionBodyToRow, transactionRowToApi, type TransactionRow } from "@/lib/db-map";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyJWT(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    const body = await request.json();
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

    const updates = patchTransactionBodyToRow(body as Record<string, unknown>);
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
  { params }: { params: { id: string } }
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
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyJWT(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = params;
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
