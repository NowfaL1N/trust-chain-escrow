// Test to verify countries are properly alphabetized and count is correct
import { COUNTRIES, COUNTRY_IDENTIFIERS } from '../country-identifiers';

describe('Countries Alphabetical Order', () => {
  test('should have countries in alphabetical order', () => {
    const manualSort = Object.keys(COUNTRY_IDENTIFIERS).sort((a, b) => a.localeCompare(b));
    expect(COUNTRIES).toEqual(manualSort);
  });

  test('should have expected first and last countries alphabetically', () => {
    // With 149 countries, first should be Afghanistan and last should be Zimbabwe  
    expect(COUNTRIES[0]).toBe('Afghanistan');
    expect(COUNTRIES[COUNTRIES.length - 1]).toBe('Zimbabwe');
  });

  test('should contain key markets in proper alphabetical order', () => {
    const keyMarkets = ['India', 'United States', 'United Kingdom', 'Germany', 'China', 'Japan', 'France', 'Canada'];
    
    keyMarkets.forEach(country => {
      expect(COUNTRIES).toContain(country);
    });

    // Verify alphabetical order: Canada < China < France < Germany < India < Japan < United Kingdom < United States
    expect(COUNTRIES.indexOf('Canada')).toBeLessThan(COUNTRIES.indexOf('China'));
    expect(COUNTRIES.indexOf('China')).toBeLessThan(COUNTRIES.indexOf('France'));
    expect(COUNTRIES.indexOf('France')).toBeLessThan(COUNTRIES.indexOf('Germany'));
    expect(COUNTRIES.indexOf('Germany')).toBeLessThan(COUNTRIES.indexOf('India'));
    expect(COUNTRIES.indexOf('India')).toBeLessThan(COUNTRIES.indexOf('Japan'));
    expect(COUNTRIES.indexOf('Japan')).toBeLessThan(COUNTRIES.indexOf('United Kingdom'));
    expect(COUNTRIES.indexOf('United Kingdom')).toBeLessThan(COUNTRIES.indexOf('United States'));
  });

  test('should have expanded country count after research', () => {
    expect(COUNTRIES.length).toBe(149);
    expect(COUNTRIES.length).toEqual(Object.keys(COUNTRY_IDENTIFIERS).length);
  });

  test('should include newly researched countries', () => {
    const newCountries = [
      'Estonia', 'Latvia', 'Lithuania', // Baltic States
      'Albania', 'Serbia', 'Croatia', 'Slovenia', // Balkans
      'Slovakia', 'Bulgaria', 'Iceland', 'Malta', 'Cyprus', // Additional EU
      'Kyrgyzstan', 'Tajikistan', 'Moldova', // Central Asia
      'Tonga', 'Samoa', 'Palau', 'Vanuatu', // Pacific Islands
      'Namibia', 'Lesotho', 'Madagascar', 'Senegal' // Additional Africa
    ];
    
    newCountries.forEach(country => {
      expect(COUNTRIES).toContain(country);
    });
  });

  test('should maintain proper regional representation', () => {
    // Test for presence of countries from each region
    const regionalSamples = {
      'Europe': ['Estonia', 'Malta', 'Iceland', 'Slovenia'],
      'Asia': ['Kyrgyzstan', 'Maldives', 'Bhutan'],
      'Pacific': ['Tonga', 'Samoa', 'Palau', 'Vanuatu'],
      'Africa': ['Namibia', 'Madagascar', 'Senegal'],
      'Middle East': ['Libya', 'Iraq'],
      'Balkans': ['Albania', 'Serbia', 'Croatia']
    };

    Object.entries(regionalSamples).forEach(([region, countries]) => {
      countries.forEach(country => {
        expect(COUNTRIES).toContain(country);
      });
    });
  });
});