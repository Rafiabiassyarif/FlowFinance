import { convertFromBase } from './exchangeRates';

export function formatCurrency(amountInIDR: number, currency: string = 'USD'): string {
  const convertedAmount = convertFromBase(amountInIDR, currency);
  
  return new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'IDR' || currency === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency === 'IDR' || currency === 'JPY' ? 0 : 2
  }).format(convertedAmount);
}
