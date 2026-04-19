// LEI (Legal Entity Identifier) verification using GLEIF API
// Optional enhancement for verifying LEI codes

export interface LEIVerificationResult {
  valid: boolean;
  legalName?: string;
  jurisdiction?: string;
  registrationAuthority?: string;
  error?: string;
}

export async function verifyLEI(lei: string): Promise<LEIVerificationResult> {
  if (!lei || lei.length !== 20) {
    return {
      valid: false,
      error: "Invalid LEI format",
    };
  }

  try {
    // Call GLEIF API to verify LEI
    const response = await fetch(`https://api.gleif.org/api/v1/lei-records/${lei}`, {
      headers: {
        'Accept': 'application/json',
      },
      // Set timeout to prevent hanging
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          valid: false,
          error: "LEI not found in GLEIF registry",
        };
      }
      return {
        valid: false,
        error: `LEI verification failed: ${response.status}`,
      };
    }

    const data = await response.json();
    const leiRecord = data.data;

    if (!leiRecord) {
      return {
        valid: false,
        error: "No LEI record found",
      };
    }

    const attributes = leiRecord.attributes;
    const entity = attributes?.entity;
    
    return {
      valid: true,
      legalName: entity?.legalName?.name || undefined,
      jurisdiction: entity?.legalAddress?.country || undefined,
      registrationAuthority: entity?.registrationAuthority?.registrationAuthorityName || undefined,
    };

  } catch (error) {
    console.error("LEI verification error:", error);
    return {
      valid: false,
      error: "LEI verification service temporarily unavailable",
    };
  }
}

// Optional: Add LEI verification to the registration process
export async function verifyAndUpdateLEI(supabase: unknown, companyId: string, lei: string): Promise<boolean> {
  try {
    const result = await verifyLEI(lei);
    
    if (result.valid) {
      // Update company record with verification status
      await supabase
        .from("companies")
        .update({ 
          lei_verified: true,
          // Optionally store additional LEI data in documents JSONB field
          documents: {
            lei_verification: {
              verified_at: new Date().toISOString(),
              legal_name: result.legalName,
              jurisdiction: result.jurisdiction,
              registration_authority: result.registrationAuthority,
            }
          }
        })
        .eq("id", companyId);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("LEI verification update error:", error);
    return false;
  }
}