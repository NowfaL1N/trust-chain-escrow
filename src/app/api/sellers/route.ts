import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { parseListingImageUrlsFromCompany } from "@/lib/listing-images";

export const dynamic = "force-dynamic";

/**
 * Returns all registered sellers so buyers can select one when initiating a transaction.
 * Does not require auth so the list always loads in the wizard.
 */
export async function GET() {
  try {
    const supabase = getSupabaseServer();

    const { data: sellers, error: sellersErr } = await supabase
      .from("users")
      .select("id, email, name, company_id")
      .eq("role", "seller");

    if (sellersErr) {
      console.error("Fetch sellers:", sellersErr);
      return NextResponse.json({ error: "Failed to fetch sellers" }, { status: 500 });
    }

    const companyIds = Array.from(
      new Set((sellers ?? []).map((s) => s.company_id).filter(Boolean) as string[])
    );

    let companyMap: Record<string, Record<string, unknown>> = {};
    if (companyIds.length > 0) {
      const { data: companies, error: compErr } = await supabase
        .from("companies")
        .select(
          "id, company_legal_name, country, representative_name, phone, business_address, listing_product_name, listing_product_price, listing_product_description, listing_product_image_url, listing_product_image_urls"
        )
        .in("id", companyIds);

      if (!compErr && companies) {
        companyMap = Object.fromEntries(
          companies.map((c) => [
            c.id as string,
            c as unknown as Record<string, unknown>,
          ])
        );
      }
    }

    const list = (sellers ?? []).map((s) => {
      const cid = s.company_id != null ? String(s.company_id) : null;
      const company = cid ? companyMap[cid] : null;
      const imageUrls = company
        ? parseListingImageUrlsFromCompany(
            company as {
              listing_product_image_urls?: unknown;
              listing_product_image_url?: string | null;
            }
          )
        : [];
      return {
        id: s.id,
        email: String(s.email ?? ""),
        companyName: (company?.company_legal_name as string) ?? s.name ?? s.email ?? "—",
        industry: "—",
        location: (company?.country as string) ?? "—",
        trustScore: 0,
        representativeName: (company?.representative_name as string) ?? s.name ?? "—",
        phone: (company?.phone as string) ?? "—",
        businessAddress: (company?.business_address as string) ?? "—",
        listingProductName: (company?.listing_product_name as string | null) ?? null,
        listingProductPrice:
          company?.listing_product_price != null
            ? Number(company.listing_product_price)
            : null,
        listingProductDescription: (company?.listing_product_description as string | null) ?? null,
        listingProductImageUrl: imageUrls[0] ?? null,
        listingProductImageUrls: imageUrls,
      };
    });

    return NextResponse.json(list);
  } catch (err) {
    console.error("Fetch Sellers Error:", err);
    return NextResponse.json({ error: "Failed to fetch sellers" }, { status: 500 });
  }
}
