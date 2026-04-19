import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { verifyJWT } from "@/lib/verifyJWT";
import { uploadDisputeEvidenceImage } from "@/lib/escrow-uploads";

export const dynamic = "force-dynamic";

function getUploadFileName(entry: unknown): string {
  if (entry && typeof entry === "object" && "name" in entry && typeof (entry as { name: unknown }).name === "string") {
    return (entry as { name: string }).name || "upload";
  }
  return "upload";
}

export async function POST(request: Request) {
  try {
    const auth = await verifyJWT(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const form = await request.formData();
    const entry = form.get("file");
    const transactionIdRaw = form.get("transactionId");
    const transactionId = typeof transactionIdRaw === "string" ? transactionIdRaw.trim() : "";

    if (entry == null || typeof entry === "string") {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (!(entry instanceof Blob) || entry.size === 0) {
      return NextResponse.json({ error: "Missing or empty file" }, { status: 400 });
    }
    if (!transactionId) {
      return NextResponse.json({ error: "Missing transactionId" }, { status: 400 });
    }

    const fileName = getUploadFileName(entry);

    const supabase = getSupabaseServer();
    const { data: txn, error: txnErr } = await supabase
      .from("transactions")
      .select("id, buyer_id, seller_id")
      .eq("id", transactionId)
      .maybeSingle();

    if (txnErr || !txn) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const uid = auth.user.userId;
    if (txn.buyer_id !== uid && txn.seller_id !== uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await uploadDisputeEvidenceImage(supabase, txn.id, uid, entry, fileName);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ url: result.publicUrl, path: result.path });
  } catch (err) {
    console.error("dispute-evidence upload:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
