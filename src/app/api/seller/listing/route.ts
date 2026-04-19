import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { verifyJWT } from "@/lib/verifyJWT";
import {
  parseListingImageUrlsFromCompany,
  validateListingProductImageUrlsInput,
} from "@/lib/listing-images";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const auth = await verifyJWT(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    if (auth.user.role !== "seller") {
      return NextResponse.json({ error: "Only sellers can view a product listing" }, { status: 403 });
    }

    const supabase = getSupabaseServer();
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", auth.user.userId)
      .maybeSingle();

    if (userErr || !user?.company_id) {
      return NextResponse.json(
        { error: "No company linked to this account" },
        { status: 400 }
      );
    }

    const { data: company, error: compErr } = await supabase
      .from("companies")
      .select(
        "listing_product_name, listing_product_price, listing_product_description, listing_product_image_url, listing_product_image_urls"
      )
      .eq("id", user.company_id)
      .maybeSingle();

    if (compErr || !company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const imageUrls = parseListingImageUrlsFromCompany(
      company as {
        listing_product_image_urls?: unknown;
        listing_product_image_url?: string | null;
      }
    );

    return NextResponse.json({
      listingProductName: company.listing_product_name ?? "",
      listingProductPrice:
        company.listing_product_price != null ? Number(company.listing_product_price) : null,
      listingProductDescription: company.listing_product_description ?? "",
      listingProductImageUrls: imageUrls,
      listingProductImageUrl: imageUrls[0] ?? null,
    });
  } catch (err) {
    console.error("GET seller listing:", err);
    return NextResponse.json({ error: "Failed to load listing" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await verifyJWT(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    if (auth.user.role !== "seller") {
      return NextResponse.json({ error: "Only sellers can update a product listing" }, { status: 403 });
    }

    const body = await request.json();
    const name = typeof body.listingProductName === "string" ? body.listingProductName.trim() : "";
    const desc =
      typeof body.listingProductDescription === "string" ? body.listingProductDescription.trim() : "";
    const priceRaw = body.listingProductPrice;
    const price = typeof priceRaw === "number" ? priceRaw : parseFloat(String(priceRaw ?? ""));

    if (!name) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Price per unit must be a positive number" }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", auth.user.userId)
      .maybeSingle();

    if (userErr || !user?.company_id) {
      return NextResponse.json(
        { error: "No company linked to this account" },
        { status: 400 }
      );
    }

    const updateRow: Record<string, unknown> = {
      listing_product_name: name,
      listing_product_price: price,
      listing_product_description: desc || null,
      updated_at: new Date().toISOString(),
    };

    if ("listingProductImageUrls" in body) {
      const validated = validateListingProductImageUrlsInput(body.listingProductImageUrls);
      if (!validated.ok) {
        return NextResponse.json({ error: validated.error }, { status: 400 });
      }
      updateRow.listing_product_image_urls = validated.urls;
      updateRow.listing_product_image_url = validated.urls[0] ?? null;
    } else if ("listingProductImageUrl" in body) {
      if (body.listingProductImageUrl === null) {
        updateRow.listing_product_image_url = null;
        updateRow.listing_product_image_urls = [];
      } else if (typeof body.listingProductImageUrl === "string") {
        const trimmed = body.listingProductImageUrl.trim();
        if (!trimmed) {
          updateRow.listing_product_image_url = null;
          updateRow.listing_product_image_urls = [];
        } else {
          updateRow.listing_product_image_url = trimmed;
          updateRow.listing_product_image_urls = [trimmed];
        }
      }
    }

    const { data: updatedCompany, error: updErr } = await supabase
      .from("companies")
      .update(updateRow)
      .eq("id", user.company_id)
      .select("listing_product_image_url, listing_product_image_urls")
      .maybeSingle();

    if (updErr) {
      console.error("Update listing:", updErr);
      return NextResponse.json({ error: "Failed to save listing" }, { status: 500 });
    }

    const imageUrls = parseListingImageUrlsFromCompany(
      (updatedCompany ?? {}) as {
        listing_product_image_urls?: unknown;
        listing_product_image_url?: string | null;
      }
    );

    return NextResponse.json({
      listingProductName: name,
      listingProductPrice: price,
      listingProductDescription: desc,
      listingProductImageUrls: imageUrls,
      listingProductImageUrl: imageUrls[0] ?? null,
    });
  } catch (err) {
    console.error("PATCH seller listing:", err);
    return NextResponse.json({ error: "Failed to save listing" }, { status: 500 });
  }
}
