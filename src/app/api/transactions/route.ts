import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { generateTransactionToken } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { verifyJWT } from "@/lib/verifyJWT";
import { transactionRowToApi, type TransactionRow } from "@/lib/db-map";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const auth = await verifyJWT(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = getSupabaseServer();
    const uid = auth.user.userId;
    const { data: rows, error } = await supabase
      .from("transactions")
      .select("*")
      .or(`buyer_id.eq.${uid},seller_id.eq.${uid}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch transactions:", error);
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
    }

    const list = (rows ?? []).map((r) => transactionRowToApi(r as TransactionRow));
    return NextResponse.json(list);
  } catch (err) {
    console.error("Fetch Transactions Error:", err);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyJWT(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (auth.user.role !== "buyer") {
      return NextResponse.json({ error: "Only buyers can initiate transactions" }, { status: 403 });
    }

    const body = await request.json();
    const supabase = getSupabaseServer();

    const { sellerEmail, buyerCompany, sellerCompany, buyerCompanyEmail } = body;
    const buyerLoginEmail = auth.user.email;

    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const { data: buyer } = await supabase.from("users").select("id").eq("email", buyerLoginEmail).maybeSingle();
    const { data: seller } = await supabase
      .from("users")
      .select("id")
      .eq("email", typeof sellerEmail === "string" ? sellerEmail.trim().toLowerCase() : "")
      .maybeSingle();

    if (!buyer || !seller) {
      return NextResponse.json({ error: "Buyer or Seller not found in system" }, { status: 400 });
    }

    const buyerToken = generateTransactionToken({ transactionId, role: "buyer", email: buyerLoginEmail });
    const sellerToken = generateTransactionToken({
      transactionId,
      role: "seller",
      email: typeof sellerEmail === "string" ? sellerEmail.trim() : sellerEmail,
    });

    const { data: inserted, error: insertErr } = await supabase
      .from("transactions")
      .insert({
        transaction_id: transactionId,
        buyer_id: buyer.id,
        seller_id: seller.id,
        status: "initiated",
        buyer_company: buyerCompany,
        seller_company: sellerCompany,
        buyer_token: buyerToken,
        seller_token: sellerToken,
        product: null,
        total_amount: 0,
      })
      .select("*")
      .single();

    if (insertErr || !inserted) {
      console.error("Create transaction:", insertErr);
      return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
    }

    const emailToSendBuyerToken =
      typeof buyerCompanyEmail === "string" && buyerCompanyEmail.trim() ? buyerCompanyEmail.trim() : buyerLoginEmail;
    const emailResults = { buyer: false, seller: false };
    try {
      await sendVerificationEmail(emailToSendBuyerToken, buyerToken, "buyer");
      emailResults.buyer = true;
    } catch (emailErr) {
      console.error("Buyer verification email failed:", emailErr);
    }
    try {
      await sendVerificationEmail(sellerEmail, sellerToken, "seller");
      emailResults.seller = true;
    } catch (emailErr) {
      console.error("Seller verification email failed:", emailErr);
    }

    const payload = { ...transactionRowToApi(inserted as TransactionRow), emailSent: emailResults };
    return NextResponse.json(payload, { status: 201 });
  } catch (err) {
    console.error("Create Transaction Error:", err);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
