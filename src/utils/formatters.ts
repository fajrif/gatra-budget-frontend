// Utility functions for formatting data
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Amounts arrive as either a number or a numeric string depending on whether the
 * value came straight from JSON or out of a form field.
 */
type AmountLike = number | string | null | undefined;

const toNumber = (amount: Exclude<AmountLike, null | undefined>): number =>
  typeof amount === 'string' ? parseFloat(amount) : amount;

export const formatRupiah = (amount: AmountLike): string => {
  if (amount === null || amount === undefined) return 'Rp 0';

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(toNumber(amount));
};

export const formatRupiahNoSymbol = (amount: AmountLike): string => {
  if (amount === null || amount === undefined) return '0';

  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(toNumber(amount));
};

export const formatRupiahShort = (amount: AmountLike): string => {
  if (amount === null || amount === undefined) return 'Rp 0';

  const numberAmount = toNumber(amount);

  if (numberAmount >= 1000000000) {
    return `Rp ${(numberAmount / 1000000000).toFixed(2)}M`;
  } else if (numberAmount >= 1000000) {
    return `Rp ${(numberAmount / 1000000).toFixed(0)}Jt`;
  } else if (numberAmount >= 1000) {
    return `Rp ${(numberAmount / 1000).toFixed(0)}Rb`;
  }

  return formatRupiah(numberAmount);
};

export const formatShortRupiah = formatRupiahShort;

export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('id-ID').format(num);
};

export const formatDate = (date: string | Date | null | undefined, fmt = 'dd MMM yyyy'): string => {
  if (!date) return '-';
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return '-';
  return format(parsed, fmt, { locale: id });
};