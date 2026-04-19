import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { verifyJWT } from "@/lib/verifyJWT";
import { uploadListingProductImage } from "@/lib/escrow-uploads";

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
    if (auth.user.role !== "seller") {
      return NextResponse.json({ error: "Only sellers can upload listing images" }, { status: 403 });
    }

    const form = await request.formData();
    const entry = form.get("file");
    if (entry == null || typeof entry === "string") {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    // Next.js/Node may supply a Blob that is not `instanceof File` depending on runtime; accept any Blob.
    if (!(entry instanceof Blob)) {
      return NextResponse.json({ error: "Invalid file payload" }, { status: 400 });
    }
    if (entry.size === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }

    const fileName = getUploadFileName(entry);

    const supabase = getSupabaseServer();
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", auth.user.userId)
      .maybeSingle();

    if (userErr || !user?.company_id) {
      return NextResponse.json({ error: "No company linked to this account" }, { status: 400 });
    }

    const result = await uploadListingProductImage(supabase, user.company_id, entry, fileName);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ url: result.publicUrl, path: result.path });
  } catch (err) {
    console.error("listing-product-image upload:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
