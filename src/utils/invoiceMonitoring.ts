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
  /** Month name on the first line of the month, '' on the following ones. */
  bulan: string;
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
 * Twelve fixed months; an invoice sits in the month of its tgl_tagihan (SPR
 * included). A month with several invoices gets several lines, a month with
 * none gets one empty line. Invoices of another year are ignored.
 */
export const buildMonitoringLines = (invoices: Invoice[], year: number): MonitoringResult => {
  const byMonth = new Map<number, Invoice[]>();
  let total = 0;
  let unpaid = 0;
  let invoiceCount = 0;

  for (const inv of invoices) {
    if (Number(inv.tgl_tagihan.slice(0, 4)) !== year) continue;
    const month = Number(inv.tgl_tagihan.slice(5, 7));
    if (month < 1 || month > 12) continue;
    byMonth.set(month, [...(byMonth.get(month) ?? []), inv]);
    total += Number(inv.nilai);
    if (inv.status === 'Submit') unpaid += Number(inv.nilai);
    invoiceCount += 1;
  }

  const lines: MonitoringLine[] = [];
  for (let month = 1; month <= 12; month++) {
    const name = MONITORING_MONTH_NAMES[month - 1];
    const items = (byMonth.get(month) ?? []).sort(
      (a, b) =>
        a.tgl_tagihan.localeCompare(b.tgl_tagihan) || a.no_invoice.localeCompare(b.no_invoice),
    );
    if (items.length === 0) {
      lines.push({ key: `m${month}`, month, bulan: name, invoice: null, periodeText: '-', periodeMismatch: false });
      continue;
    }
    const billedMonth = `${year}-${String(month).padStart(2, '0')}`;
    items.forEach((inv, i) => {
      const periods = inv.periode_tagihan ?? [];
      lines.push({
        key: inv.id,
        month,
        bulan: i === 0 ? name : '',
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
