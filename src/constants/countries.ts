export interface CountryCode {
  code: string;
  iso: string;
  flag: string;
  name: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+233', iso: 'GH', flag: '🇬🇭', name: 'Ghana' },
  { code: '+234', iso: 'NG', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+225', iso: 'CI', flag: '🇨🇮', name: "Côte d'Ivoire" },
  { code: '+228', iso: 'TG', flag: '🇹🇬', name: 'Togo' },
  { code: '+226', iso: 'BF', flag: '🇧🇫', name: 'Burkina Faso' },
  { code: '+231', iso: 'LR', flag: '🇱🇷', name: 'Liberia' },
  { code: '+232', iso: 'SL', flag: '🇸🇱', name: 'Sierra Leone' },
  { code: '+1', iso: 'US', flag: '🇺🇸', name: 'USA / Canada' },
  { code: '+44', iso: 'GB', flag: '🇬🇧', name: 'United Kingdom' }
];
