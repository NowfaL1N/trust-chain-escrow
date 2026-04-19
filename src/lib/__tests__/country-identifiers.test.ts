// Test suite for country identifier validation
// Run with: npm test country-identifiers

import {
  COUNTRY_IDENTIFIERS,
  COUNTRIES,
  validateLEI,
  validateCountryIdentifier,
  getCountryConfig,
  getNationalRegistrationLabel
} from '../country-identifiers';

describe('Country Identifiers', () => {
  // Test that all countries are properly configured
  test('should have valid configuration for all countries', () => {
    expect(COUNTRIES.length).toBeGreaterThan(80);
    
    COUNTRIES.forEach(country => {
      const config = getCountryConfig(country);
      expect(config).toBeTruthy();
      expect(config?.primary).toBeTruthy();
      expect(typeof config?.primary).toBe('string');
    });
  });

  // Test LEI validation
  describe('LEI Validation', () => {
    test('should validate correct LEI format', () => {
      expect(validateLEI('ABCDEFGHIJKLMNOPQRST')).toBe(true);
      expect(validateLEI('123456789012345ABC89')).toBe(true);
      expect(validateLEI('abcdefghijklmnopqrst')).toBe(true); // Should work with lowercase
    });

    test('should reject invalid LEI format', () => {
      expect(validateLEI('')).toBe(false);
      expect(validateLEI('ABC123')).toBe(false); // Too short
      expect(validateLEI('ABCDEFGHIJKLMNOPQRSTU')).toBe(false); // Too long
      expect(validateLEI('ABC123!@#456789012345')).toBe(false); // Invalid characters
    });
  });

  // Test country-specific validation samples
  describe('Country-Specific Validation', () => {
    const testCases = [
      {
        country: 'India',
        primary: '27ABCDE1234F1Z5',
        secondary: 'U12345MH2020PLC123456',
        validPrimary: true,
        validSecondary: true
      },
      {
        country: 'United States',
        primary: '12-3456789',
        secondary: '',
        validPrimary: true,
        validSecondary: true
      },
      {
        country: 'United Kingdom',
        primary: '12345678',
        secondary: 'GB123456789',
        validPrimary: true,
        validSecondary: true
      },
      {
        country: 'Germany',
        primary: 'HRB 12345',
        secondary: 'DE123456789',
        validPrimary: true,
        validSecondary: true
      },
      {
        country: 'Australia',
        primary: '12 345 678 901',
        secondary: '',
        validPrimary: true,
        validSecondary: true
      },
      {
        country: 'Brazil',
        primary: '12.345.678/0001-90',
        secondary: '',
        validPrimary: true,
        validSecondary: true
      },
      {
        country: 'Japan',
        primary: '1234567890123',
        secondary: '',
        validPrimary: true,
        validSecondary: true
      },
      // Invalid cases
      {
        country: 'India',
        primary: 'INVALID_GSTIN',
        secondary: '',
        validPrimary: false,
        validSecondary: true
      },
      {
        country: 'United States',
        primary: '123456789', // Missing hyphen
        secondary: '',
        validPrimary: false,
        validSecondary: true
      }
    ];

    testCases.forEach(({ country, primary, secondary, validPrimary, validSecondary }) => {
      test(`should validate ${country} identifiers correctly`, () => {
        const config = getCountryConfig(country);
        expect(config).toBeTruthy();

        if (primary) {
          const primaryResult = validateCountryIdentifier(primary, config?.primaryPattern);
          expect(primaryResult).toBe(validPrimary);
        }

        if (secondary && config?.secondaryPattern) {
          const secondaryResult = validateCountryIdentifier(secondary, config.secondaryPattern);
          expect(secondaryResult).toBe(validSecondary);
        }
      });
    });
  });

  // Test national registration label generation
  describe('National Registration Labels', () => {
    test('should generate correct labels for countries', () => {
      expect(getNationalRegistrationLabel('India')).toContain('GSTIN');
      expect(getNationalRegistrationLabel('United States')).toContain('EIN');
      expect(getNationalRegistrationLabel('Germany')).toContain('Handelsregister');
      expect(getNationalRegistrationLabel('Invalid Country')).toBe('National Company Registration Number');
    });
  });

  // Test edge cases
  describe('Edge Cases', () => {
    test('should handle empty/null inputs gracefully', () => {
      expect(validateCountryIdentifier('', undefined)).toBe(true);
      expect(validateCountryIdentifier('test', undefined)).toBe(true);
      expect(getCountryConfig('')).toBe(null);
      expect(getCountryConfig('Invalid Country')).toBe(null);
    });

    test('should handle case sensitivity appropriately', () => {
      expect(validateLEI('abcdefghijklmnopqrst')).toBe(true);
      expect(validateLEI('ABCDEFGHIJKLMNOPQRST')).toBe(true);
    });
  });

  // Performance test
  test('should have reasonable configuration size', () => {
    expect(COUNTRIES.length).toBeGreaterThan(80);
    expect(COUNTRIES.length).toBeLessThan(200); // Reasonable upper bound
  });
});