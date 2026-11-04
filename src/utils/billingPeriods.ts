const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/** "2026-02" -> "Feb 2026". Unparseable input is returned unchanged. */
export const formatPeriod = (period: string): string => {
  const [year, month] = period.split('-');
  const name = MONTH_NAMES[Number(month) - 1];
  return name && year ? `${name} ${year}` : period;
};

/** ["2026-03", "2026-04"] -> "Mar, Apr 2026"; across years: "Des 2025, Jan 2026". */
export const formatPeriods = (periods: string[] | null | undefined): string => {
  if (!periods || periods.length === 0) return '-';
  const sorted = [...periods].sort();
  const byYear = new Map<string, string[]>();
  for (const p of sorted) {
    const [year, month] = p.split('-');
    byYear.set(year, [...(byYear.get(year) ?? []), MONTH_NAMES[Number(month) - 1] ?? p]);
  }
  return [...byYear.entries()].map(([year, months]) => `${months.join(', ')} ${year}`).join(', ');
};

/** Every "YYYY-MM" from the month of `start` through the month of `end` (both "YYYY-MM-DD"). */
export const monthsInRange = (start: string, end: string): string[] => {
  const first = start.slice(0, 7);
  const last = end.slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(first) || !/^\d{4}-\d{2}$/.test(last) || first > last) return [];

  const months: string[] = [];
  let year = Number(first.slice(0, 4));
  let month = Number(first.slice(5, 7));
  const endYear = Number(last.slice(0, 4));
  const endMonth = Number(last.slice(5, 7));
  while (year < endYear || (year === endYear && month <= endMonth)) {
    months.push(`${year}-${String(month).padStart(2, '0')}`);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return months;
};
