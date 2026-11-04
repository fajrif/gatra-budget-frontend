import { formatPeriods } from '@/utils/billingPeriods';
import type { Invoice, Project, ProjectGroup } from '@/types';
import type { SelectOption } from '@/components/ui/select';

export const MONITORING_MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export type MonitoringFilter =
  | { kind: 'group'; id: string }
  | { kind: 'project'; id: string }
  | null;

/** Parses the value of the Group/Proyek dropdown ("group:<id>" / "project:<id>"). */
export const parseMonitoringFilter = (value: string): MonitoringFilter => {
  const [kind, ...rest] = value.split(':');
  const id = rest.join(':');
  if (!id) return null;
  if (kind === 'group' || kind === 'project') return { kind, id };
  return null;
};

/**
 * One nested option list: every group (selectable) followed by its projects
 * (indented, disabled: an invoice list is only reachable through the group),
 * and projects without a group (selectable). Sorted by name; a group's
 * projects by contract start.
 */
export const buildGroupedOptions = (
  groups: ProjectGroup[],
  projects: Project[],
): SelectOption[] => {
  type Entry = { label: string; options: SelectOption[] };
  const entries: Entry[] = [];

  for (const g of groups) {
    const children = projects
      .filter((p) => p.project_group_id === g.id)
      .sort((a, b) => a.tanggal_mulai.localeCompare(b.tanggal_mulai));
    entries.push({
      label: g.nama,
      options: [
        { value: `group:${g.id}`, label: g.nama },
        ...children.map((p) => ({
          value: `project:${p.id}`,
          label: p.judul_pekerjaan,
          disabled: true,
          indent: true,
        })),
      ],
    });
  }

  const groupIds = new Set(groups.map((g) => g.id));
  for (const p of projects) {
    // A project whose group is unknown (not loaded) is treated as ungrouped so it stays reachable.
    if (p.project_group_id && groupIds.has(p.project_group_id)) continue;
    entries.push({
      label: p.judul_pekerjaan,
      options: [{ value: `project:${p.id}`, label: p.judul_pekerjaan }],
    });
  }

  return entries
    .sort((a, b) => a.label.localeCompare(b.label, 'id'))
    .flatMap((e) => e.options);
};

export interface MonitoringLine {
  /** Stable React key. */
  key: string;
  /** 1-12. */
  month: number;
  /** Month name on the first line of the month ('' on the following ones); includes the year for lines outside the report year. */
  bulan: string;
  /** True for a month before/after the report year (an invoice billed late or early); rendered italic. */
  outsideYear: boolean;
  /** null for a month without invoices. */
  invoice: Invoice | null;
  periodeText: string;
  /** True when the billing period is not exactly the month the invoice was billed in. */
  periodeMismatch: boolean;
}

export interface MonitoringResult {
  lines: MonitoringLine[];
  total: number;
  /** Sum of the invoices already paid (Kliring). */
  paid: number;
  /** Sum of the invoices still in Submit (not yet paid). */
  unpaid: number;
  invoiceCount: number;
}

/**
 * January-December of `year`, extended with extra months (outsideYear) up to the
 * last month an invoice was billed in, or back to the first, so an invoice
 * whose period belongs to `year` but was billed in the next year (or before it)
 * still has a line. An invoice sits in the month of its tgl_tagihan (SPR
 * included). A month with several invoices gets several lines, a month with
 * none gets one empty line. Which invoices belong to `year` is decided by the
 * server (periode_year); nothing is filtered out here.
 */
export const buildMonitoringLines = (invoices: Invoice[], year: number): MonitoringResult => {
  // Absolute month index: year * 12 + (month - 1)
  const byMonth = new Map<number, Invoice[]>();
  let first = year * 12;
  let last = year * 12 + 11;
  let total = 0;
  let unpaid = 0;
  let invoiceCount = 0;

  for (const inv of invoices) {
    const y = Number(inv.tgl_tagihan.slice(0, 4));
    const m = Number(inv.tgl_tagihan.slice(5, 7));
    if (!y || m < 1 || m > 12) continue;
    const idx = y * 12 + (m - 1);
    byMonth.set(idx, [...(byMonth.get(idx) ?? []), inv]);
    first = Math.min(first, idx);
    last = Math.max(last, idx);
    total += Number(inv.nilai);
    if (inv.status === 'Submit') unpaid += Number(inv.nilai);
    invoiceCount += 1;
  }

  const lines: MonitoringLine[] = [];
  for (let idx = first; idx <= last; idx++) {
    const lineYear = Math.floor(idx / 12);
    const month = (idx % 12) + 1;
    const outsideYear = lineYear !== year;
    const name = MONITORING_MONTH_NAMES[month - 1] + (outsideYear ? ` ${lineYear}` : '');
    const items = (byMonth.get(idx) ?? []).sort(
      (a, b) =>
        a.tgl_tagihan.localeCompare(b.tgl_tagihan) || a.no_invoice.localeCompare(b.no_invoice),
    );
    if (items.length === 0) {
      lines.push({ key: `m${idx}`, month, bulan: name, outsideYear, invoice: null, periodeText: '-', periodeMismatch: false });
      continue;
    }
    const billedMonth = `${lineYear}-${String(month).padStart(2, '0')}`;
    items.forEach((inv, i) => {
      const periods = inv.periode_tagihan ?? [];
      lines.push({
        key: inv.id,
        month,
        bulan: i === 0 ? name : '',
        outsideYear,
        invoice: inv,
        periodeText: formatPeriods(periods),
        periodeMismatch: periods.length !== 1 || periods[0] !== billedMonth,
      });
    });
  }
  return { lines, total, paid: total - unpaid, unpaid, invoiceCount };
};

/** "2026-02-10" -> "10/02/2026" (string split, so no timezone shift). */
export const toDMY = (date: string | null | undefined): string => {
  if (!date) return '';
  const [y, m, d] = date.slice(0, 10).split('-');
  return y && m && d ? `${d}/${m}/${y}` : '';
};
