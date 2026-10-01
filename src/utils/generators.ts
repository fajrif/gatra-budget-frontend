/**
 * Generate random price within a range.
 */
export const randomPrice = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate random past date from now.
 */
export const randomPastDate = (days = 30): Date => {
  const now = Date.now();
  const past = now - Math.random() * days * 24 * 60 * 60 * 1000;
  return new Date(past);
};

/**
 * Generate random date between two dates.
 */
export const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

/**
 * Billing date based on a transaction date.
 */
export const randomSLADate = (fromDate: Date): Date => {
  const mode = Math.floor(Math.random() * 3); // 0, 1, 2

  switch (mode) {
    case 0:
      // Earlier by 1-3 days
      return new Date(fromDate.getTime() - (1 + Math.floor(Math.random() * 3)) * 86400000);

    case 1:
      // Next day
      return new Date(fromDate.getTime() + 86400000);

    case 2:
      // +5-15 days later
      return new Date(fromDate.getTime() + (5 + Math.floor(Math.random() * 10)) * 86400000);

    default:
      return fromDate;
  }
};