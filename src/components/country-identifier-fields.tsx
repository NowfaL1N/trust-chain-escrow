"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CountrySelect } from "@/components/ui/country-select";
import { 
  COUNTRIES, 
  getCountryConfig, 
  getNationalRegistrationLabel,
  validateLEI,
  validateCountryIdentifier 
} from "@/lib/country-identifiers";

export interface CountryIdentifierData {
  country: string;
  lei: string;
  primaryIdentifier: string;
  secondaryIdentifier: string;
  identifierType: string;
}

interface CountryIdentifierFieldsProps {
  data: CountryIdentifierData;
  onChange: (data: CountryIdentifierData) => void;
  className?: string;
}

export function CountryIdentifierFields({ data, onChange, className = "" }: CountryIdentifierFieldsProps) {
  const config = getCountryConfig(data.country);
  
  const handleCountryChange = (country: string) => {
    const newConfig = getCountryConfig(country);
    onChange({
      ...data,
      country,
      identifierType: country,
      // Clear identifiers when country changes to avoid confusion
      primaryIdentifier: "",
      secondaryIdentifier: "",
    });
  };

  const handleFieldChange = (field: keyof CountryIdentifierData, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  // Validation states
  const leiError = data.lei && !validateLEI(data.lei) ? "Invalid LEI format. Must be 20 alphanumeric characters." : "";
  const primaryError = config?.primaryPattern && data.primaryIdentifier && !validateCountryIdentifier(data.primaryIdentifier, config.primaryPattern) 
    ? `Invalid ${config.primary} format.` : "";
  const secondaryError = config?.secondaryPattern && data.secondaryIdentifier && !validateCountryIdentifier(data.secondaryIdentifier, config.secondaryPattern) 
    ? `Invalid ${config.secondary} format.` : "";

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Country Selection */}
      <div className="space-y-1">
        <Label className="text-xs font-semibold">
          Country *
          <span className="text-xs font-normal text-slate-500 ml-1">(149 countries supported)</span>
        </Label>
        <CountrySelect
          value={data.country}
          onValueChange={handleCountryChange}
          options={COUNTRIES}
          placeholder="Select or search country..."
          className="h-10 text-sm"
        />
      </div>

      {/* LEI Field - Always shown, always optional */}
      <div className="space-y-1">
        <Label className="text-xs font-semibold">
          Legal Entity Identifier (LEI)
          <span className="text-xs font-normal text-slate-500 ml-1">(Optional Global Standard)</span>
        </Label>
        <Input
          placeholder="e.g., ABC123456789012345XYZ (20 characters)"
          value={data.lei}
          onChange={(e) => handleFieldChange('lei', e.target.value.toUpperCase())}
          className={`h-10 text-sm font-mono ${leiError ? 'border-red-500' : 'border-blue-200 focus:border-blue-400'}`}
          maxLength={20}
        />
        {leiError && (
          <p className="text-xs text-red-500">{leiError}</p>
        )}
      </div>

      {/* National Registration Number */}
      <div className="space-y-1">
        <Label className="text-xs font-semibold">
          {getNationalRegistrationLabel(data.country)} *
        </Label>
        <Input
          placeholder={config?.primaryPlaceholder || "Enter registration number"}
          value={data.primaryIdentifier}
          onChange={(e) => handleFieldChange('primaryIdentifier', e.target.value)}
          className={`h-10 text-sm ${primaryError ? 'border-red-500' : ''}`}
          required
        />
        {primaryError && (
          <p className="text-xs text-red-500">{primaryError}</p>
        )}
      </div>

      {/* Country-specific Primary Identifier (if different from national reg) */}
      {config?.primary && config.primary !== "National Registration" && (
        <div className="space-y-1">
          <Label className="text-xs font-semibold">{config.primary} *</Label>
          <Input
            placeholder={config.primaryPlaceholder || `Enter ${config.primary}`}
            value={data.primaryIdentifier}
            onChange={(e) => handleFieldChange('primaryIdentifier', e.target.value)}
            className={`h-10 text-sm ${primaryError ? 'border-red-500' : ''}`}
            required
          />
          {primaryError && (
            <p className="text-xs text-red-500">{primaryError}</p>
          )}
        </div>
      )}

      {/* Secondary Identifier (if applicable) */}
      {config?.secondary && (
        <div className="space-y-1">
          <Label className="text-xs font-semibold">
            {config.secondary}
            <span className="text-xs font-normal text-slate-500 ml-1">(Optional)</span>
          </Label>
          <Input
            placeholder={config.secondaryPlaceholder || `Enter ${config.secondary}`}
            value={data.secondaryIdentifier}
            onChange={(e) => handleFieldChange('secondaryIdentifier', e.target.value)}
            className={`h-10 text-sm ${secondaryError ? 'border-red-500' : ''}`}
          />
          {secondaryError && (
            <p className="text-xs text-red-500">{secondaryError}</p>
          )}
        </div>
      )}
    </div>
  );
}