export interface CountryCode {
  code: string;
  iso: string;
  name: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+233', iso: 'GH', name: 'Ghana' },
  { code: '+234', iso: 'NG', name: 'Nigeria' },
  { code: '+225', iso: 'CI', name: "Côte d'Ivoire" },
  { code: '+228', iso: 'TG', name: 'Togo' },
  { code: '+226', iso: 'BF', name: 'Burkina Faso' },
  { code: '+231', iso: 'LR', name: 'Liberia' },
  { code: '+232', iso: 'SL', name: 'Sierra Leone' },
  { code: '+1', iso: 'US', name: 'USA / Canada' },
  { code: '+44', iso: 'GB', name: 'United Kingdom' }
];
