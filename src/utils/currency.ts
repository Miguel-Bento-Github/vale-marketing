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

// Monthly rate when billed yearly (~20% discount)
export const yearlyMonthlyPrices: Record<string, { starter: number; business: number }> = {
  EUR: { starter: 79, business: 249 },
  USD: { starter: 89, business: 269 },
  GBP: { starter: 69, business: 209 },
  BRL: { starter: 449, business: 1349 },
  CNY: { starter: 639, business: 1949 },
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
