// Country-based business identifier configuration
// This configuration drives the dynamic form fields and validation

export interface CountryConfig {
  primary: string;
  secondary?: string;
  primaryPlaceholder?: string;
  secondaryPlaceholder?: string;
  primaryPattern?: string;
  secondaryPattern?: string;
}

export const COUNTRY_IDENTIFIERS: Record<string, CountryConfig> = {
  "India": {
    primary: "GSTIN",
    secondary: "CIN",
    primaryPlaceholder: "27ABCDE1234F1Z5",
    secondaryPlaceholder: "U12345MH2020PLC123456",
    primaryPattern: "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$",
    secondaryPattern: "^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$"
  },
  "United States": {
    primary: "EIN",
    primaryPlaceholder: "12-3456789",
    primaryPattern: "^[0-9]{2}-[0-9]{7}$"
  },
  "United Kingdom": {
    primary: "Company Number",
    secondary: "VAT",
    primaryPlaceholder: "12345678",
    secondaryPlaceholder: "GB123456789",
    primaryPattern: "^[0-9]{8}$",
    secondaryPattern: "^GB[0-9]{9}$"
  },
  "European Union": {
    primary: "VAT",
    primaryPlaceholder: "EU123456789",
    primaryPattern: "^[A-Z]{2}[0-9A-Z]{8,12}$"
  },
  "UAE": {
    primary: "Trade License",
    secondary: "TRN",
    primaryPlaceholder: "CN-1234567",
    secondaryPlaceholder: "123456789012345",
    primaryPattern: "^[A-Z]{2}-[0-9]{7}$",
    secondaryPattern: "^[0-9]{15}$"
  },
  "Singapore": {
    primary: "UEN",
    primaryPlaceholder: "123456789A",
    primaryPattern: "^[0-9]{9}[A-Z]{1}$"
  },
  "Australia": {
    primary: "ABN",
    primaryPlaceholder: "12 345 678 901",
    primaryPattern: "^[0-9]{2} [0-9]{3} [0-9]{3} [0-9]{3}$"
  },
  "Canada": {
    primary: "BN",
    primaryPlaceholder: "123456789RC0001",
    primaryPattern: "^[0-9]{9}RC[0-9]{4}$"
  },
  "China": {
    primary: "USCC",
    primaryPlaceholder: "91110000123456789X",
    primaryPattern: "^[0-9A-Z]{18}$"
  },
  "Japan": {
    primary: "Corporate Number",
    primaryPlaceholder: "1234567890123",
    primaryPattern: "^[0-9]{13}$"
  },
  "Germany": {
    primary: "Handelsregister Number",
    secondary: "VAT",
    primaryPlaceholder: "HRB 12345",
    secondaryPlaceholder: "DE123456789",
    primaryPattern: "^HR[AB] [0-9]+$",
    secondaryPattern: "^DE[0-9]{9}$"
  },
  "France": {
    primary: "SIREN",
    primaryPlaceholder: "123456789",
    primaryPattern: "^[0-9]{9}$"
  },
  "Brazil": {
    primary: "CNPJ",
    primaryPlaceholder: "12.345.678/0001-90",
    primaryPattern: "^[0-9]{2}\\.[0-9]{3}\\.[0-9]{3}\\/[0-9]{4}-[0-9]{2}$"
  },
  "South Africa": {
    primary: "CIPC Number",
    secondary: "VAT",
    primaryPlaceholder: "2020/123456/07",
    secondaryPlaceholder: "4123456789",
    primaryPattern: "^[0-9]{4}\\/[0-9]{6}\\/[0-9]{2}$",
    secondaryPattern: "^[0-9]{10}$"
  },
  "Saudi Arabia": {
    primary: "CR Number",
    secondary: "VAT",
    primaryPlaceholder: "1010123456",
    secondaryPlaceholder: "123456789012345",
    primaryPattern: "^[0-9]{10}$",
    secondaryPattern: "^[0-9]{15}$"
  },
  "South Korea": {
    primary: "BRN",
    primaryPlaceholder: "123-45-67890",
    primaryPattern: "^[0-9]{3}-[0-9]{2}-[0-9]{5}$"
  },
  "Mexico": {
    primary: "RFC",
    primaryPlaceholder: "ABC123456D78",
    primaryPattern: "^[A-Z]{3}[0-9]{6}[A-Z0-9]{3}$"
  },
  "Italy": {
    primary: "VAT",
    primaryPlaceholder: "IT12345678901",
    primaryPattern: "^IT[0-9]{11}$"
  },
  "Netherlands": {
    primary: "KvK",
    secondary: "VAT",
    primaryPlaceholder: "12345678",
    secondaryPlaceholder: "NL123456789B01",
    primaryPattern: "^[0-9]{8}$",
    secondaryPattern: "^NL[0-9]{9}B[0-9]{2}$"
  },
  "Turkey": {
    primary: "Tax Number",
    primaryPlaceholder: "1234567890",
    primaryPattern: "^[0-9]{10}$"
  },
  "Russia": {
    primary: "OGRN",
    secondary: "INN",
    primaryPlaceholder: "1234567890123",
    secondaryPlaceholder: "123456789012",
    primaryPattern: "^[0-9]{13}$",
    secondaryPattern: "^[0-9]{10,12}$"
  },
  // Additional European Countries
  "Spain": {
    primary: "NIF/CIF",
    secondary: "VAT",
    primaryPlaceholder: "A12345674",
    secondaryPlaceholder: "ES12345674",
    primaryPattern: "^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$",
    secondaryPattern: "^ES[A-Z0-9][0-9]{7}[0-9A-J]$"
  },
  "Portugal": {
    primary: "NIPC",
    secondary: "VAT",
    primaryPlaceholder: "123456789",
    secondaryPlaceholder: "PT123456789",
    primaryPattern: "^[0-9]{9}$",
    secondaryPattern: "^PT[0-9]{9}$"
  },
  "Austria": {
    primary: "Firmenbuch Number",
    secondary: "VAT",
    primaryPlaceholder: "FN 12345a",
    secondaryPlaceholder: "ATU12345678",
    primaryPattern: "^FN [0-9]+[a-z]?$",
    secondaryPattern: "^ATU[0-9]{8}$"
  },
  "Belgium": {
    primary: "KBO/BCE Number",
    secondary: "VAT",
    primaryPlaceholder: "0123.456.789",
    secondaryPlaceholder: "BE0123456789",
    primaryPattern: "^[0-9]{4}\\.[0-9]{3}\\.[0-9]{3}$",
    secondaryPattern: "^BE[0-9]{10}$"
  },
  "Switzerland": {
    primary: "UID",
    secondary: "VAT",
    primaryPlaceholder: "CHE-123.456.789",
    secondaryPlaceholder: "CHE-123.456.789 MWST",
    primaryPattern: "^CHE-[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}$",
    secondaryPattern: "^CHE-[0-9]{3}\\.[0-9]{3}\\.[0-9]{3} MWST$"
  },
  "Norway": {
    primary: "Organization Number",
    secondary: "VAT",
    primaryPlaceholder: "123 456 789",
    secondaryPlaceholder: "NO123456789MVA",
    primaryPattern: "^[0-9]{3} [0-9]{3} [0-9]{3}$",
    secondaryPattern: "^NO[0-9]{9}MVA$"
  },
  "Sweden": {
    primary: "Organization Number",
    secondary: "VAT",
    primaryPlaceholder: "123456-7890",
    secondaryPlaceholder: "SE123456789001",
    primaryPattern: "^[0-9]{6}-[0-9]{4}$",
    secondaryPattern: "^SE[0-9]{12}$"
  },
  "Denmark": {
    primary: "CVR",
    secondary: "VAT",
    primaryPlaceholder: "12345678",
    secondaryPlaceholder: "DK12345678",
    primaryPattern: "^[0-9]{8}$",
    secondaryPattern: "^DK[0-9]{8}$"
  },
  "Finland": {
    primary: "Business ID",
    secondary: "VAT",
    primaryPlaceholder: "1234567-8",
    secondaryPlaceholder: "FI12345678",
    primaryPattern: "^[0-9]{7}-[0-9]$",
    secondaryPattern: "^FI[0-9]{8}$"
  },
  "Poland": {
    primary: "KRS",
    secondary: "NIP",
    primaryPlaceholder: "0000123456",
    secondaryPlaceholder: "1234567890",
    primaryPattern: "^[0-9]{10}$",
    secondaryPattern: "^[0-9]{10}$"
  },
  "Czech Republic": {
    primary: "IČO",
    secondary: "DIČ",
    primaryPlaceholder: "12345678",
    secondaryPlaceholder: "CZ12345678",
    primaryPattern: "^[0-9]{8}$",
    secondaryPattern: "^CZ[0-9]{8,10}$"
  },
  "Hungary": {
    primary: "Cégbejegyzési szám",
    secondary: "Tax Number",
    primaryPlaceholder: "01-09-123456",
    secondaryPlaceholder: "12345678-1-23",
    primaryPattern: "^[0-9]{2}-[0-9]{2}-[0-9]{6}$",
    secondaryPattern: "^[0-9]{8}-[0-9]-[0-9]{2}$"
  },
  "Romania": {
    primary: "CUI",
    secondary: "VAT",
    primaryPlaceholder: "12345678",
    secondaryPlaceholder: "RO12345678",
    primaryPattern: "^[0-9]{2,10}$",
    secondaryPattern: "^RO[0-9]{2,10}$"
  },
  "Greece": {
    primary: "GEMI",
    secondary: "VAT",
    primaryPlaceholder: "123456701000",
    secondaryPlaceholder: "EL123456789",
    primaryPattern: "^[0-9]{12}$",
    secondaryPattern: "^EL[0-9]{9}$"
  },
  "Ireland": {
    primary: "CRO Number",
    secondary: "VAT",
    primaryPlaceholder: "123456",
    secondaryPlaceholder: "IE1234567T",
    primaryPattern: "^[0-9]{6}$",
    secondaryPattern: "^IE[0-9]{7}[A-Z]{1,2}$"
  },
  // Asian Countries
  "Thailand": {
    primary: "Tax ID",
    secondary: "DBD Registration",
    primaryPlaceholder: "1234567890123",
    secondaryPlaceholder: "0107123456789",
    primaryPattern: "^[0-9]{13}$",
    secondaryPattern: "^[0-9]{13}$"
  },
  "Malaysia": {
    primary: "SSM Registration",
    secondary: "GST Number",
    primaryPlaceholder: "123456-A",
    secondaryPlaceholder: "000123456789",
    primaryPattern: "^[0-9]{6}-[A-Z]$",
    secondaryPattern: "^[0-9]{12}$"
  },
  "Indonesia": {
    primary: "NIB",
    secondary: "NPWP",
    primaryPlaceholder: "1234567890123",
    secondaryPlaceholder: "01.234.567.8-901.000",
    primaryPattern: "^[0-9]{13}$",
    secondaryPattern: "^[0-9]{2}\\.[0-9]{3}\\.[0-9]{3}\\.[0-9]-[0-9]{3}\\.[0-9]{3}$"
  },
  "Philippines": {
    primary: "SEC Registration",
    secondary: "TIN",
    primaryPlaceholder: "CS123456789",
    secondaryPlaceholder: "123-456-789-000",
    primaryPattern: "^[A-Z]{2}[0-9]{9}$",
    secondaryPattern: "^[0-9]{3}-[0-9]{3}-[0-9]{3}-[0-9]{3}$"
  },
  "Vietnam": {
    primary: "Business License",
    secondary: "Tax Code",
    primaryPlaceholder: "0123456789",
    secondaryPlaceholder: "0123456789-001",
    primaryPattern: "^[0-9]{10}$",
    secondaryPattern: "^[0-9]{10}-[0-9]{3}$"
  },
  "Taiwan": {
    primary: "UBN",
    secondary: "VAT",
    primaryPlaceholder: "12345678",
    secondaryPlaceholder: "12345678",
    primaryPattern: "^[0-9]{8}$",
    secondaryPattern: "^[0-9]{8}$"
  },
  "Hong Kong": {
    primary: "CR Number",
    secondary: "BR Number",
    primaryPlaceholder: "1234567",
    secondaryPlaceholder: "12345678-000-01-20-A",
    primaryPattern: "^[0-9]{7}$",
    secondaryPattern: "^[0-9]{8}-[0-9]{3}-[0-9]{2}-[0-9]{2}-[A-Z]$"
  },
  // Middle Eastern Countries
  "Israel": {
    primary: "Company Number",
    secondary: "VAT",
    primaryPlaceholder: "512345678",
    secondaryPlaceholder: "123456789",
    primaryPattern: "^[0-9]{9}$",
    secondaryPattern: "^[0-9]{9}$"
  },
  "Jordan": {
    primary: "Registration Number",
    secondary: "Tax Number",
    primaryPlaceholder: "123456789",
    secondaryPlaceholder: "123456789012",
    primaryPattern: "^[0-9]{9}$",
    secondaryPattern: "^[0-9]{12}$"
  },
  "Kuwait": {
    primary: "Commercial Registration",
    secondary: "Civil ID",
    primaryPlaceholder: "123456789123",
    secondaryPlaceholder: "123456789012",
    primaryPattern: "^[0-9]{12}$",
    secondaryPattern: "^[0-9]{12}$"
  },
  "Qatar": {
    primary: "CR Number",
    secondary: "Tax Number",
    primaryPlaceholder: "12345",
    secondaryPlaceholder: "123456789012",
    primaryPattern: "^[0-9]{5}$",
    secondaryPattern: "^[0-9]{12}$"
  },
  "Bahrain": {
    primary: "CR Number",
    secondary: "VAT",
    primaryPlaceholder: "12345",
    secondaryPlaceholder: "123456789012345",
    primaryPattern: "^[0-9]{5}$",
    secondaryPattern: "^[0-9]{15}$"
  },
  "Oman": {
    primary: "CR Number",
    secondary: "Tax Card",
    primaryPlaceholder: "1234567",
    secondaryPlaceholder: "123456789012",
    primaryPattern: "^[0-9]{7}$",
    secondaryPattern: "^[0-9]{12}$"
  },
  // African Countries
  "Nigeria": {
    primary: "RC Number",
    secondary: "TIN",
    primaryPlaceholder: "RC123456",
    secondaryPlaceholder: "12345678-0001",
    primaryPattern: "^RC[0-9]{6}$",
    secondaryPattern: "^[0-9]{8}-[0-9]{4}$"
  },
  "Kenya": {
    primary: "Certificate Number",
    secondary: "PIN",
    primaryPlaceholder: "C.123456",
    secondaryPlaceholder: "P123456789A",
    primaryPattern: "^C\\.[0-9]{6}$",
    secondaryPattern: "^P[0-9]{9}[A-Z]$"
  },
  "Ghana": {
    primary: "Certificate Number",
    secondary: "TIN",
    primaryPlaceholder: "G-123456789",
    secondaryPlaceholder: "C123456789",
    primaryPattern: "^G-[0-9]{9}$",
    secondaryPattern: "^C[0-9]{9}$"
  },
  "Egypt": {
    primary: "Commercial Register",
    secondary: "Tax Number",
    primaryPlaceholder: "12345",
    secondaryPlaceholder: "123-456-789",
    primaryPattern: "^[0-9]{5}$",
    secondaryPattern: "^[0-9]{3}-[0-9]{3}-[0-9]{3}$"
  },
  "Morocco": {
    primary: "RC Number",
    secondary: "IF",
    primaryPlaceholder: "123456",
    secondaryPlaceholder: "12345678",
    primaryPattern: "^[0-9]{6}$",
    secondaryPattern: "^[0-9]{8}$"
  },
  // Latin American Countries
  "Argentina": {
    primary: "CUIT",
    secondary: "IGJ Registration",
    primaryPlaceholder: "20-12345678-9",
    secondaryPlaceholder: "123456",
    primaryPattern: "^[0-9]{2}-[0-9]{8}-[0-9]$",
    secondaryPattern: "^[0-9]{6}$"
  },
  "Chile": {
    primary: "RUT",
    secondary: "Rol de la Empresa",
    primaryPlaceholder: "12.345.678-9",
    secondaryPlaceholder: "12345-6",
    primaryPattern: "^[0-9]{1,2}\\.[0-9]{3}\\.[0-9]{3}-[0-9K]$",
    secondaryPattern: "^[0-9]{5}-[0-9]$"
  },
  "Colombia": {
    primary: "NIT",
    secondary: "Matricula Mercantil",
    primaryPlaceholder: "123.456.789-0",
    secondaryPlaceholder: "12345678",
    primaryPattern: "^[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]$",
    secondaryPattern: "^[0-9]{8}$"
  },
  "Peru": {
    primary: "RUC",
    secondary: "Partida Registral",
    primaryPlaceholder: "20123456789",
    secondaryPlaceholder: "12345678",
    primaryPattern: "^[0-9]{11}$",
    secondaryPattern: "^[0-9]{8}$"
  },
  "Venezuela": {
    primary: "RIF",
    secondary: "Registro Mercantil",
    primaryPlaceholder: "J-12345678-9",
    secondaryPlaceholder: "123456",
    primaryPattern: "^[VEJPG]-[0-9]{8}-[0-9]$",
    secondaryPattern: "^[0-9]{6}$"
  },
  "Ecuador": {
    primary: "RUC",
    secondary: "Registro Mercantil",
    primaryPlaceholder: "1234567890001",
    secondaryPlaceholder: "12345",
    primaryPattern: "^[0-9]{13}$",
    secondaryPattern: "^[0-9]{5}$"
  },
  "Uruguay": {
    primary: "RUT",
    secondary: "Registro Nacional",
    primaryPlaceholder: "123456789012",
    secondaryPlaceholder: "123456",
    primaryPattern: "^[0-9]{12}$",
    secondaryPattern: "^[0-9]{6}$"
  },
  "Costa Rica": {
    primary: "Cédula Jurídica",
    secondary: "NIT",
    primaryPlaceholder: "3-101-123456",
    secondaryPlaceholder: "123456789012",
    primaryPattern: "^[0-9]-[0-9]{3}-[0-9]{6}$",
    secondaryPattern: "^[0-9]{12}$"
  },
  "Panama": {
    primary: "Registro Público",
    secondary: "RUC",
    primaryPlaceholder: "123456-1-123456",
    secondaryPlaceholder: "1234567-1-12345",
    primaryPattern: "^[0-9]{6}-[0-9]-[0-9]{6}$",
    secondaryPattern: "^[0-9]{7}-[0-9]-[0-9]{5}$"
  },
  // Oceania
  "New Zealand": {
    primary: "NZBN",
    secondary: "GST",
    primaryPlaceholder: "9429041234567",
    secondaryPlaceholder: "123-456-789",
    primaryPattern: "^94290[0-9]{8}$",
    secondaryPattern: "^[0-9]{3}-[0-9]{3}-[0-9]{3}$"
  },
  "Fiji": {
    primary: "Registration Number",
    secondary: "TIN",
    primaryPlaceholder: "12345",
    secondaryPlaceholder: "123456789",
    primaryPattern: "^[0-9]{5}$",
    secondaryPattern: "^[0-9]{9}$"
  },
  // Additional African Countries
  "Tanzania": {
    primary: "Certificate Number",
    secondary: "TIN",
    primaryPlaceholder: "12345",
    secondaryPlaceholder: "123-456-789",
    primaryPattern: "^[0-9]{5}$",
    secondaryPattern: "^[0-9]{3}-[0-9]{3}-[0-9]{3}$"
  },
  "Uganda": {
    primary: "Certificate Number",
    secondary: "TIN",
    primaryPlaceholder: "123456",
    secondaryPlaceholder: "1234567890",
    primaryPattern: "^[0-9]{6}$",
    secondaryPattern: "^[0-9]{10}$"
  },
  "Ethiopia": {
    primary: "License Number",
    secondary: "TIN",
    primaryPlaceholder: "BL/123/456",
    secondaryPlaceholder: "0123456789",
    primaryPattern: "^BL/[0-9]{3}/[0-9]{3}$",
    secondaryPattern: "^[0-9]{10}$"
  },
  "Zambia": {
    primary: "PACRA Number",
    secondary: "TPIN",
    primaryPlaceholder: "123456789",
    secondaryPlaceholder: "1234567890",
    primaryPattern: "^[0-9]{9}$",
    secondaryPattern: "^[0-9]{10}$"
  },
  "Zimbabwe": {
    primary: "ZIMRA Number",
    secondary: "VAT",
    primaryPlaceholder: "123456789",
    secondaryPlaceholder: "12345678",
    primaryPattern: "^[0-9]{9}$",
    secondaryPattern: "^[0-9]{8}$"
  },
  "Botswana": {
    primary: "Company Number",
    secondary: "VAT",
    primaryPlaceholder: "BW00123456",
    secondaryPlaceholder: "123456789",
    primaryPattern: "^BW[0-9]{8}$",
    secondaryPattern: "^[0-9]{9}$"
  },
  // Additional Asian Countries
  "Bangladesh": {
    primary: "RJSC Number",
    secondary: "TIN",
    primaryPlaceholder: "C-123456/2020",
    secondaryPlaceholder: "123456789012",
    primaryPattern: "^C-[0-9]{6}/[0-9]{4}$",
    secondaryPattern: "^[0-9]{12}$"
  },
  "Pakistan": {
    primary: "SECP Number",
    secondary: "NTN",
    primaryPlaceholder: "123456",
    secondaryPlaceholder: "1234567-8",
    primaryPattern: "^[0-9]{6}$",
    secondaryPattern: "^[0-9]{7}-[0-9]$"
  },
  "Sri Lanka": {
    primary: "PV Number",
    secondary: "VAT",
    primaryPlaceholder: "PV 12345",
    secondaryPlaceholder: "123456789V",
    primaryPattern: "^PV [0-9]{5}$",
    secondaryPattern: "^[0-9]{9}V$"
  },
  "Nepal": {
    primary: "Registration Number",
    secondary: "PAN",
    primaryPlaceholder: "123456789",
    secondaryPlaceholder: "123456789",
    primaryPattern: "^[0-9]{9}$",
    secondaryPattern: "^[0-9]{9}$"
  },
  "Myanmar": {
    primary: "MIC Number",
    secondary: "Tax Number",
    primaryPlaceholder: "12345/2020",
    secondaryPlaceholder: "123456789",
    primaryPattern: "^[0-9]{5}/[0-9]{4}$",
    secondaryPattern: "^[0-9]{9}$"
  },
  "Cambodia": {
    primary: "Registration Number",
    secondary: "Tax Number",
    primaryPlaceholder: "00123456",
    secondaryPlaceholder: "K123456789",
    primaryPattern: "^[0-9]{8}$",
    secondaryPattern: "^K[0-9]{9}$"
  },
  "Laos": {
    primary: "Registration Number",
    secondary: "Tax Number",
    primaryPlaceholder: "123456789",
    secondaryPlaceholder: "123456789012",
    primaryPattern: "^[0-9]{9}$",
    secondaryPattern: "^[0-9]{12}$"
  },
  "Mongolia": {
    primary: "State Registration",
    secondary: "TIN",
    primaryPlaceholder: "1234567890",
    secondaryPlaceholder: "1234567890",
    primaryPattern: "^[0-9]{10}$",
    secondaryPattern: "^[0-9]{10}$"
  },
  // Additional Major Trade Hubs
  "Luxembourg": {
    primary: "RCS Number",
    secondary: "VAT",
    primaryPlaceholder: "B123456",
    secondaryPlaceholder: "LU12345678",
    primaryPattern: "^[A-Z][0-9]{6}$",
    secondaryPattern: "^LU[0-9]{8}$"
  },
  "Liechtenstein": {
    primary: "FL Number",
    secondary: "UID",
    primaryPlaceholder: "FL-0001.123.456-7",
    secondaryPlaceholder: "CHE-123.456.789",
    primaryPattern: "^FL-[0-9]{4}\\.[0-9]{3}\\.[0-9]{3}-[0-9]$",
    secondaryPattern: "^CHE-[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}$"
  },
  "Monaco": {
    primary: "RCI Number",
    secondary: "VAT",
    primaryPlaceholder: "123456",
    secondaryPlaceholder: "MC12345678901",
    primaryPattern: "^[0-9]{6}$",
    secondaryPattern: "^MC[0-9]{11}$"
  },
  "Andorra": {
    primary: "NRT",
    secondary: "NIF",
    primaryPlaceholder: "A1234567",
    secondaryPlaceholder: "A123456E",
    primaryPattern: "^[A-Z][0-9]{7}$",
    secondaryPattern: "^[A-Z][0-9]{6}[A-Z]$"
  },
  "San Marino": {
    primary: "COE Code",
    secondary: "Tax Code",
    primaryPlaceholder: "12345",
    secondaryPlaceholder: "123456",
    primaryPattern: "^[0-9]{5}$",
    secondaryPattern: "^[0-9]{6}$"
  },
  "Vatican City": {
    primary: "Registration Number",
    primaryPlaceholder: "123",
    primaryPattern: "^[0-9]{1,3}$"
  },
  // Caribbean & Island Nations
  "Cayman Islands": {
    primary: "Company Number",
    secondary: "Tax ID",
    primaryPlaceholder: "123456",
    secondaryPlaceholder: "12345678",
    primaryPattern: "^[0-9]{6}$",
    secondaryPattern: "^[0-9]{8}$"
  },
  "British Virgin Islands": {
    primary: "Company Number",
    primaryPlaceholder: "123456",
    primaryPattern: "^[0-9]{6}$"
  },
  "Bermuda": {
    primary: "Registration Number",
    primaryPlaceholder: "12345",
    primaryPattern: "^[0-9]{5}$"
  },
  "Barbados": {
    primary: "Registration Number",
    secondary: "VAT",
    primaryPlaceholder: "123456789",
    secondaryPlaceholder: "123456789012",
    primaryPattern: "^[0-9]{9}$",
    secondaryPattern: "^[0-9]{12}$"
  },
  "Jamaica": {
    primary: "Company Number",
    secondary: "TRN",
    primaryPlaceholder: "123456789",
    secondaryPlaceholder: "123456789",
    primaryPattern: "^[0-9]{9}$",
    secondaryPattern: "^[0-9]{9}$"
  },
  "Trinidad and Tobago": {
    primary: "Registration Number",
    secondary: "VAT",
    primaryPlaceholder: "123456",
    secondaryPlaceholder: "123456789012",
    primaryPattern: "^[0-9]{6}$",
    secondaryPattern: "^[0-9]{12}$"
  },
  "Mauritius": {
    primary: "BRN",
    secondary: "VAT",
    primaryPlaceholder: "C12345678",
    secondaryPlaceholder: "12345678910",
    primaryPattern: "^C[0-9]{8}$",
    secondaryPattern: "^[0-9]{11}$"
  },
  "Seychelles": {
    primary: "Company Number",
    secondary: "Business Tax",
    primaryPlaceholder: "12345",
    secondaryPlaceholder: "123456789",
    primaryPattern: "^[0-9]{5}$",
    secondaryPattern: "^[0-9]{9}$"
  },
  // Additional African Markets
  "Algeria": {
    primary: "RC Number",
    secondary: "NIF",
    primaryPlaceholder: "123456",
    secondaryPlaceholder: "123456789012345",
    primaryPattern: "^[0-9]{6}$",
    secondaryPattern: "^[0-9]{15}$"
  },
  "Tunisia": {
    primary: "Registration Number",
    secondary: "Tax ID",
    primaryPlaceholder: "123456B",
    secondaryPlaceholder: "1234567",
    primaryPattern: "^[0-9]{6}[A-Z]$",
    secondaryPattern: "^[0-9]{7}$"
  },
  "Angola": {
    primary: "NIF",
    secondary: "Registration Number",
    primaryPlaceholder: "123456789",
    secondaryPlaceholder: "12345",
    primaryPattern: "^[0-9]{9}$",
    secondaryPattern: "^[0-9]{5}$"
  },
  "Rwanda": {
    primary: "TIN",
    secondary: "Registration Number",
    primaryPlaceholder: "123456789",
    secondaryPlaceholder: "12345",
    primaryPattern: "^[0-9]{9}$",
    secondaryPattern: "^[0-9]{5}$"
  },
  // Additional Trade Partner Countries
  "Belarus": {
    primary: "UNP",
    secondary: "VAT",
    primaryPlaceholder: "123456789",
    secondaryPlaceholder: "123456789",
    primaryPattern: "^[0-9]{9}$",
    secondaryPattern: "^[0-9]{9}$"
  },
  "Ukraine": {
    primary: "EDRPOU",
    secondary: "VAT",
    primaryPlaceholder: "12345678",
    secondaryPlaceholder: "123456789012",
    primaryPattern: "^[0-9]{8}$",
    secondaryPattern: "^[0-9]{12}$"
  },
  "Kazakhstan": {
    primary: "BIN",
    secondary: "RNN",
    primaryPlaceholder: "123456789012",
    secondaryPlaceholder: "123456789012",
    primaryPattern: "^[0-9]{12}$",
    secondaryPattern: "^[0-9]{12}$"
  },
  "Uzbekistan": {
    primary: "STIR",
    secondary: "OKPO",
    primaryPlaceholder: "123456789",
    secondaryPlaceholder: "12345678",
    primaryPattern: "^[0-9]{9}$",
    secondaryPattern: "^[0-9]{8}$"
  },
  "Azerbaijan": {
    primary: "VOEN",
    secondary: "Registration Number",
    primaryPlaceholder: "1234567890",
    secondaryPlaceholder: "123456",
    primaryPattern: "^[0-9]{10}$",
    secondaryPattern: "^[0-9]{6}$"
  },
  "Georgia": {
    primary: "Registration Number",
    secondary: "Tax Number",
    primaryPlaceholder: "123456789",
    secondaryPlaceholder: "123456789",
    primaryPattern: "^[0-9]{9}$",
    secondaryPattern: "^[0-9]{9}$"
  },
  "Armenia": {
    primary: "State Register Number",
    secondary: "Tax ID",
    primaryPlaceholder: "123.456.789",
    secondaryPlaceholder: "12345678",
    primaryPattern: "^[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}$",
    secondaryPattern: "^[0-9]{8}$"
  },
  // Baltic States
  "Estonia": {
    primary: "Registration Code",
    secondary: "VAT",
    primaryPlaceholder: "12345678",
    secondaryPlaceholder: "EE123456789",
    primaryPattern: "^[0-9]{8}$",
    secondaryPattern: "^EE[0-9]{9}$"
  },
  "Latvia": {
    primary: "Registration Number",
    secondary: "VAT",
    primaryPlaceholder: "40003123456",
    secondaryPlaceholder: "LV40003123456",
    primaryPattern: "^[0-9]{11}$",
    secondaryPattern: "^LV[0-9]{11}$"
  },
  "Lithuania": {
    primary: "Company Code",
    secondary: "VAT",
    primaryPlaceholder: "123456789",
    secondaryPlaceholder: "LT123456789",
    primaryPattern: "^[0-9]{9}$",
    secondaryPattern: "^LT[0-9]{9}$"
  },
  // Additional European Countries
  "Slovakia": {
    primary: "IČO",
    secondary: "VAT",
    primaryPlaceholder: "12345678",
    secondaryPlaceholder: "SK1234567890",
    primaryPattern: "^[0-9]{8}$",
    secondaryPattern: "^SK[0-9]{10}$"
  },
  "Bulgaria": {
    primary: "UIC/BULSTAT",
    secondary: "VAT",
    primaryPlaceholder: "123456789",
    secondaryPlaceholder: "BG123456789",
    primaryPattern: "^[0-9]{9,10}$",
    secondaryPattern: "^BG[0-9]{9,10}$"
  },
  "Croatia": {
    primary: "MBS",
    secondary: "VAT",
    primaryPlaceholder: "12345678",
    secondaryPlaceholder: "HR12345678901",
    primaryPattern: "^[0-9]{8}$",
    secondaryPattern: "^HR[0-9]{11}$"
  },
  "Slovenia": {
    primary: "Company Number",
    secondary: "VAT",
    primaryPlaceholder: "1234567000",
    secondaryPlaceholder: "SI12345678",
    primaryPattern: "^[0-9]{10}$",
    secondaryPattern: "^SI[0-9]{8}$"
  },
  "Serbia": {
    primary: "Registration Number",
    secondary: "PIB",
    primaryPlaceholder: "12345678",
    secondaryPlaceholder: "123456789",
    primaryPattern: "^[0-9]{8}$",
    secondaryPattern: "^[0-9]{9}$"
  },
  "Albania": {
    primary: "NUIS",
    secondary: "VAT",
    primaryPlaceholder: "J12345678N",
    secondaryPlaceholder: "AL123456789",
    primaryPattern: "^[A-Z][0-9]{8}[A-Z]$",
    secondaryPattern: "^AL[0-9]{9}[A-Z]$"
  },
  "Bosnia and Herzegovina": {
    primary: "JIB",
    secondary: "PDV",
    primaryPlaceholder: "123456789012",
    secondaryPlaceholder: "123456789",
    primaryPattern: "^[0-9]{12}$",
    secondaryPattern: "^[0-9]{9}$"
  },
  "Montenegro": {
    primary: "Registration Number",
    secondary: "PIB",
    primaryPlaceholder: "12345678",
    secondaryPlaceholder: "12345678",
    primaryPattern: "^[0-9]{8}$",
    secondaryPattern: "^[0-9]{8}$"
  },
  "North Macedonia": {
    primary: "Company Number",
    secondary: "Tax Number",
    primaryPlaceholder: "1234567",
    secondaryPlaceholder: "4012345678901",
    primaryPattern: "^[0-9]{7}$",
    secondaryPattern: "^[0-9]{13}$"
  },
  "Kosovo": {
    primary: "Business Number",
    secondary: "VAT",
    primaryPlaceholder: "123456789",
    secondaryPlaceholder: "123456789",
    primaryPattern: "^[0-9]{9}$",
    secondaryPattern: "^[0-9]{9}$"
  },
  // Nordic & Island Nations
  "Iceland": {
    primary: "Company Registration",
    secondary: "VSK Number",
    primaryPlaceholder: "123456-7890",
    secondaryPlaceholder: "12345",
    primaryPattern: "^[0-9]{6}-[0-9]{4}$",
    secondaryPattern: "^[0-9]{5}$"
  },
  "Malta": {
    primary: "Company Number",
    secondary: "VAT",
    primaryPlaceholder: "C12345",
    secondaryPlaceholder: "MT12345678",
    primaryPattern: "^C[0-9]{5}$",
    secondaryPattern: "^MT[0-9]{8}$"
  },
  "Cyprus": {
    primary: "Company Number",
    secondary: "VAT",
    primaryPlaceholder: "HE123456",
    secondaryPlaceholder: "CY12345678L",
    primaryPattern: "^HE[0-9]{6}$",
    secondaryPattern: "^CY[0-9]{8}[A-Z]$"
  },
  // Central Asian Countries
  "Kyrgyzstan": {
    primary: "Registration Number",
    secondary: "TIN/PIN",
    primaryPlaceholder: "123456789012",
    secondaryPlaceholder: "12345678901234",
    primaryPattern: "^[0-9]{12}$",
    secondaryPattern: "^[0-9]{14}$"
  },
  "Tajikistan": {
    primary: "Registration Number",
    secondary: "TIN",
    primaryPlaceholder: "12345678",
    secondaryPlaceholder: "123456789012",
    primaryPattern: "^[0-9]{8}$",
    secondaryPattern: "^[0-9]{12}$"
  },
  "Turkmenistan": {
    primary: "State Registration",
    secondary: "Tax Number",
    primaryPlaceholder: "1234567890",
    secondaryPlaceholder: "1234567890",
    primaryPattern: "^[0-9]{10}$",
    secondaryPattern: "^[0-9]{10}$"
  },
  "Moldova": {
    primary: "IDNO",
    secondary: "VAT",
    primaryPlaceholder: "1234567890123",
    secondaryPlaceholder: "MD123456789",
    primaryPattern: "^[0-9]{13}$",
    secondaryPattern: "^MD[0-9]{9}$"
  },
  // Asian Island Nations
  "Maldives": {
    primary: "Business Registration",
    secondary: "TIN",
    primaryPlaceholder: "NPR-12345",
    secondaryPlaceholder: "1000001GST501",
    primaryPattern: "^NPR-[0-9]{5}$",
    secondaryPattern: "^[0-9]{7}GST[0-9]{3}$"
  },
  "Bhutan": {
    primary: "License Number",
    secondary: "TIN",
    primaryPlaceholder: "BL/12345/2024",
    secondaryPlaceholder: "123456789",
    primaryPattern: "^BL/[0-9]{5}/[0-9]{4}$",
    secondaryPattern: "^[0-9]{9}$"
  },
  // Pacific Nations
  "Tonga": {
    primary: "Registration Number",
    secondary: "TIN",
    primaryPlaceholder: "12345",
    secondaryPlaceholder: "123456789",
    primaryPattern: "^[0-9]{5}$",
    secondaryPattern: "^[0-9]{9}$"
  },
  "Samoa": {
    primary: "Registration Number",
    secondary: "Tax ID",
    primaryPlaceholder: "123456",
    secondaryPlaceholder: "12345678",
    primaryPattern: "^[0-9]{6}$",
    secondaryPattern: "^[0-9]{8}$"
  },
  "Palau": {
    primary: "Registration Number",
    secondary: "Tax ID",
    primaryPlaceholder: "12345",
    secondaryPlaceholder: "123456789",
    primaryPattern: "^[0-9]{5}$",
    secondaryPattern: "^[0-9]{9}$"
  },
  "Vanuatu": {
    primary: "Registration Number",
    secondary: "VAT",
    primaryPlaceholder: "12345",
    secondaryPlaceholder: "123456789",
    primaryPattern: "^[0-9]{5}$",
    secondaryPattern: "^[0-9]{9}$"
  },
  "Cook Islands": {
    primary: "Company Number",
    secondary: "Tax ID",
    primaryPlaceholder: "123456",
    secondaryPlaceholder: "12345678",
    primaryPattern: "^[0-9]{6}$",
    secondaryPattern: "^[0-9]{8}$"
  },
  "Solomon Islands": {
    primary: "Company Number",
    secondary: "TIN",
    primaryPlaceholder: "F/123456",
    secondaryPlaceholder: "123456789",
    primaryPattern: "^F/[0-9]{6}$",
    secondaryPattern: "^[0-9]{9}$"
  },
  // Additional African Countries
  "Namibia": {
    primary: "Registration Number",
    secondary: "VAT",
    primaryPlaceholder: "CC/123456",
    secondaryPlaceholder: "123456789012",
    primaryPattern: "^CC/[0-9]{6}$",
    secondaryPattern: "^[0-9]{12}$"
  },
  "Lesotho": {
    primary: "Registration Number",
    secondary: "TIN",
    primaryPlaceholder: "12345678",
    secondaryPlaceholder: "123456789",
    primaryPattern: "^[0-9]{8}$",
    secondaryPattern: "^[0-9]{9}$"
  },
  "Eswatini": {
    primary: "Registration Number",
    secondary: "TIN",
    primaryPlaceholder: "123456789",
    secondaryPlaceholder: "1234567890",
    primaryPattern: "^[0-9]{9}$",
    secondaryPattern: "^[0-9]{10}$"
  },
  "Mozambique": {
    primary: "NUEL",
    secondary: "NUIT",
    primaryPlaceholder: "123456789",
    secondaryPlaceholder: "123456789",
    primaryPattern: "^[0-9]{9}$",
    secondaryPattern: "^[0-9]{9}$"
  },
  "Madagascar": {
    primary: "NIF",
    secondary: "STAT",
    primaryPlaceholder: "12345678901",
    secondaryPlaceholder: "12345678901234",
    primaryPattern: "^[0-9]{11}$",
    secondaryPattern: "^[0-9]{14}$"
  },
  "Senegal": {
    primary: "NINEA",
    secondary: "VAT",
    primaryPlaceholder: "123456789012345",
    secondaryPlaceholder: "M123456789123",
    primaryPattern: "^[0-9]{15}$",
    secondaryPattern: "^M[0-9]{12}$"
  },
  "Ivory Coast": {
    primary: "Account Number",
    secondary: "VAT",
    primaryPlaceholder: "1234567890123",
    secondaryPlaceholder: "CI123456789",
    primaryPattern: "^[0-9]{13}$",
    secondaryPattern: "^CI[0-9]{9}$"
  },
  "Libya": {
    primary: "Registration Number",
    secondary: "Tax Number",
    primaryPlaceholder: "12345678",
    secondaryPlaceholder: "123456789",
    primaryPattern: "^[0-9]{8}$",
    secondaryPattern: "^[0-9]{9}$"
  },
  "Iraq": {
    primary: "Registration Number",
    secondary: "TIN",
    primaryPlaceholder: "123456789",
    secondaryPlaceholder: "1234567890",
    primaryPattern: "^[0-9]{9}$",
    secondaryPattern: "^[0-9]{10}$"
  },
  "Iran": {
    primary: "Registration Number",
    secondary: "Tax ID",
    primaryPlaceholder: "12345678901",
    secondaryPlaceholder: "1234567890",
    primaryPattern: "^[0-9]{11}$",
    secondaryPattern: "^[0-9]{10}$"
  },
  "Afghanistan": {
    primary: "Business License",
    secondary: "TIN",
    primaryPlaceholder: "BL-123456",
    secondaryPlaceholder: "123456789",
    primaryPattern: "^BL-[0-9]{6}$",
    secondaryPattern: "^[0-9]{9}$"
  },
  // Additional Countries Found Through Research
  "Micronesia": {
    primary: "Business License",
    primaryPlaceholder: "BL-12345",
    primaryPattern: "^BL-[0-9]{5}$"
  },
  "Marshall Islands": {
    primary: "Registration Number",
    primaryPlaceholder: "12345",
    primaryPattern: "^[0-9]{5}$"
  },
  "Kiribati": {
    primary: "Registration Number",
    primaryPlaceholder: "12345",
    primaryPattern: "^[0-9]{5}$"
  },
  "Tuvalu": {
    primary: "Registration Number",
    primaryPlaceholder: "12345",
    primaryPattern: "^[0-9]{5}$"
  },
  "Nauru": {
    primary: "Business License",
    primaryPlaceholder: "BL-123",
    primaryPattern: "^BL-[0-9]{3}$"
  },
  "Papua New Guinea": {
    primary: "Registration Number",
    secondary: "TIN",
    primaryPlaceholder: "123456789",
    secondaryPlaceholder: "1234567890",
    primaryPattern: "^[0-9]{9}$",
    secondaryPattern: "^[0-9]{10}$"
  }
};

// Export countries in alphabetical order for consistent UI
export const COUNTRIES = Object.keys(COUNTRY_IDENTIFIERS).sort((a, b) => a.localeCompare(b));

// LEI validation pattern
export const LEI_PATTERN = /^[A-Z0-9]{20}$/;

// Get label for national registration number based on country
export function getNationalRegistrationLabel(country: string): string {
  if (!country || !COUNTRY_IDENTIFIERS[country]) {
    return "National Company Registration Number";
  }
  return `National Company Registration Number (${COUNTRY_IDENTIFIERS[country].primary})`;
}

// Validate LEI
export function validateLEI(lei: string): boolean {
  return LEI_PATTERN.test(lei.toUpperCase());
}

// Validate country-specific identifier
export function validateCountryIdentifier(
  identifier: string,
  pattern: string | undefined
): boolean {
  if (!pattern) return true; // No pattern means any format is acceptable
  return new RegExp(pattern).test(identifier);
}

// Get country config
export function getCountryConfig(country: string): CountryConfig | null {
  return COUNTRY_IDENTIFIERS[country] || null;
}