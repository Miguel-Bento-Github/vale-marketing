export interface Currency {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const currencies: Currency[] = [
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
];

// Fixed rates with round numbers (base: EUR)
// These are approximate and designed for nice round numbers
export const prices: Record<string, { starter: number; business: number }> = {
  EUR: { starter: 99, business: 299 },
  USD: { starter: 109, business: 329 },
  GBP: { starter: 85, business: 259 },
  BRL: { starter: 549, business: 1649 },
  CNY: { starter: 779, business: 2349 },
};

// Yearly prices (2 months free — 10 months worth)
export const yearlyPrices: Record<string, { starter: number; business: number }> = {
  EUR: { starter: 990, business: 2990 },
  USD: { starter: 1090, business: 3290 },
  GBP: { starter: 850, business: 2590 },
  BRL: { starter: 5490, business: 16490 },
  CNY: { starter: 7790, business: 23490 },
};

// Map locales to default currencies
export const localeCurrencyMap: Record<string, string> = {
  en: 'EUR', // Default to EUR for English (UK/international)
  pt: 'EUR', // Portugal uses EUR
  es: 'EUR', // Spain uses EUR
  zh: 'CNY', // China uses CNY
  ar: 'USD', // Middle East often uses USD
};

export function formatPrice(amount: number, currencyCode: string): string {
  const currency = currencies.find((c) => c.code === currencyCode) || currencies[0];

  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getDefaultCurrency(locale: string): string {
  return localeCurrencyMap[locale] || 'EUR';
}
