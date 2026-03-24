/**
 * Company Verification Service (MongoDB Version)
 * Validates buyer company details via API.
 */

export type BuyerCompany = {
  _id?: string;
  companyLegalName: string;
  country: string;
  businessAddress: string;
  cin: string;
  gstin: string;
  companyEmail: string;
  representativeName: string;
  phone: string;
  verified: boolean;
  verifiedAt?: string;
};

export async function verifyCompany(data: Omit<BuyerCompany, "verified" | "verifiedAt">): Promise<{
  success: boolean;
  errors: string[];
  company?: BuyerCompany;
}> {
  const errors: string[] = [];

  if (!data.companyLegalName.trim()) errors.push("Company Legal Name is required.");
  if (!data.country.trim()) errors.push("Country is required.");
  if (!data.businessAddress.trim()) errors.push("Business Address is required.");
  if (!data.companyEmail.trim()) errors.push("Company Email is required.");
  if (!data.representativeName.trim()) errors.push("Representative Name is required.");
  if (!data.phone.trim()) errors.push("Phone Number is required.");

  if (data.cin.length !== 21) {
    errors.push("CIN must be exactly 21 characters.");
  }
  if (data.gstin.length !== 15) {
    errors.push("GSTIN must be exactly 15 characters.");
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  try {
    const res = await fetch("/api/companies/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      return { success: false, errors: ["Server error during verification"] };
    }

    const result = await res.json();
    return { success: true, errors: [], company: result.company };
  } catch {
    return { success: false, errors: ["Network error during verification"] };
  }
}

export async function getSavedCompany(): Promise<BuyerCompany | null> {
  // In a real app, this would fetch the user's tied company from the DB
  // For now, we'll return null or could use a persistent session check
  return null;
}

export function clearCompany(): void {
  // Session management logic
}
