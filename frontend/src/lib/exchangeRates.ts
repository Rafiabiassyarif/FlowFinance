export const EXCHANGE_RATES: Record<string, number> = {
  IDR: 1, // Base currency
  USD: 16400,
  EUR: 17500,
  GBP: 20700,
  SGD: 12100,
  JPY: 104,
  AUD: 10900,
  MYR: 3480
};

/**
 * Converts a raw amount (which is assumed to be in IDR) into the target currency.
 */
export function convertFromBase(amountInIDR: number, targetCurrency: string): number {
  const rate = EXCHANGE_RATES[targetCurrency] || 1;
  return amountInIDR / rate;
}

/**
 * Converts an amount from a target currency back to the base IDR for storage.
 */
export function convertToBase(amountInTarget: number, sourceCurrency: string): number {
  const rate = EXCHANGE_RATES[sourceCurrency] || 1;
  return amountInTarget * rate;
}
