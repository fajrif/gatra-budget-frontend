import type { ISODateString, UUID } from './common';

/**
 * Client, ContractType, and CostType are simple master data referenced by
 * Project (Client/ContractType) and Transaction (CostType). They
 * follow the same shape as the location reference tables in `location.ts`.
 */

export interface Client {
  id: UUID;
  name: string;
  contact_name?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ContractType {
  id: UUID;
  name: string;
  code?: string | null;
  description?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface CostType {
  id: UUID;
  nama_biaya: string;
  kode?: string | null;
  deskripsi?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/** Mirrors `models.OperationalCostType`: category for operational expenses. */
export interface OperationalCostType {
  id: UUID;
  nama_biaya: string;
  deskripsi?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/**
 * Mirrors `handlers.ProjectGroupResponse`: groups the project records (contract
 * periods) of one piece of work. `project_count` / `total_nilai` come from the
 * list endpoint (sum of the child projects' `nilai_pekerjaan`).
 */
export interface ProjectGroup {
  id: UUID;
  nama: string;
  deskripsi?: string | null;
  project_count?: number;
  total_nilai?: number;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/** YYYY-MM-DD, as emitted by Go's models.Date. */
export type DateOnlyString = string;

/**
 * Where today falls relative to a project's start/end dates. Derived by the
 * server on every read (`handlers.ProjectResponse`); never sent in a payload.
 */
export type ContractStatus = 'not_started' | 'ongoing' | 'expired';

/**
 * Mirrors `handlers.ProjectResponse` (= `models.Project` plus the derived
 * contract fields). `jangka_waktu` is server-computed from the dates, and
 * `contract_status` / `ending_soon` / `days_remaining` are derived — never
 * send any of them in a create/update payload.
 */
export interface Project {
  id: UUID;
  no_sp2k: string;
  no_perjanjian?: string | null;
  no_amandemen?: string | null;
  tanggal_perjanjian?: DateOnlyString | null;
  judul_pekerjaan: string;
  jangka_waktu?: number | null;
  tanggal_mulai: DateOnlyString;
  tanggal_selesai: DateOnlyString;
  nilai_pekerjaan: number;
  client_id?: UUID | null;
  client?: Client | null;
  contract_type_id?: UUID | null;
  contract_type?: ContractType | null;
  project_group_id?: UUID | null;
  project_group?: ProjectGroup | null;
  contract_status: ContractStatus;
  /** True for an ongoing contract that ends within one month. */
  ending_soon: boolean;
  days_remaining: number;
  created_by: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/**
 * Mirrors `models.Transaction`: a project expense. `bulan_realisasi` is
 * always server-computed from `tanggal_transaksi` — never send it.
 */
export interface Transaction {
  id: UUID;
  project_id: UUID;
  project?: Project | null;
  cost_type_id: UUID;
  cost_type?: CostType | null;
  tanggal_transaksi: DateOnlyString;
  bulan_realisasi?: string | null;
  deskripsi_realisasi?: string | null;
  jumlah_realisasi: number;
  jumlah_tenaga_kerja?: number | null;
  created_by: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/**
 * Mirrors `models.CostOperation`: an operational expense with no project.
 * `bulan_realisasi` is server-computed from `tanggal_transaksi`.
 */
export interface CostOperation {
  id: UUID;
  operational_cost_type_id: UUID;
  operational_cost_type?: OperationalCostType | null;
  tanggal_transaksi: DateOnlyString;
  bulan_realisasi?: string | null;
  deskripsi?: string | null;
  jumlah: number;
  created_by: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/** Submit = billed, Kliring = paid (tgl_bayar required). */
export type InvoiceStatus = 'Submit' | 'Kliring';

/**
 * Kontrak = paid per contract (bills exactly one month); SPR = the client's cash
 * advance (bills one or more months).
 */
export type PaymentMethod = 'Kontrak' | 'SPR';

/** Mirrors `models.Invoice`. `manajemen_fee` is a fixed amount typed in by the user. */
export interface Invoice {
  id: UUID;
  no_invoice: string;
  project_id: UUID;
  project?: Project | null;
  nama_invoice: string;
  tgl_tagihan: DateOnlyString;
  tgl_bayar?: DateOnlyString | null;
  status: InvoiceStatus;
  metode_pembayaran: PaymentMethod;
  /** Months (YYYY-MM) this invoice bills for; may differ from tgl_tagihan/tgl_bayar. */
  periode_tagihan: string[];
  nilai: number;
  description?: string | null;
  manajemen_fee: number;
  created_by: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/**
 * Mirrors `handlers.ProjectSummary`. Admin-only: only served from
 * `/api/reports/...`, never from the plain project payloads.
 * `profit_margin` is the sum of the project's invoice `manajemen_fee`.
 * `absorption_alert` is true above 80% of the contract value realized.
 */
export interface ProjectSummary {
  project_id: UUID;
  no_sp2k: string;
  judul_pekerjaan: string;
  contract_status: ContractStatus;
  nilai_pekerjaan: number;
  total_realisasi: number;
  remaining_budget: number;
  absorption_pct: number;
  absorption_alert: boolean;
  total_invoice: number;
  total_kliring: number;
  total_outstanding: number;
  total_manajemen_fee: number;
  profit_margin: number;
}

/** Mirrors `handlers.MonthlyReportRow`: one calendar month, month = "YYYY-MM". */
export interface MonthlyReportRow {
  month: string;
  /** Project expenses (transactions). */
  pengeluaran: number;
  /** Operational expenses (cost_operations); 0 when a project filter is active. */
  operasional: number;
  /** pengeluaran + operasional. */
  total_pengeluaran: number;
  tagihan: number;
  penerimaan: number;
  manajemen_fee: number;
  selisih: number;
}

/** Mirrors `handlers.MonthlyReportTotals`. */
export interface MonthlyReportTotals {
  pengeluaran: number;
  operasional: number;
  total_pengeluaran: number;
  tagihan: number;
  penerimaan: number;
  manajemen_fee: number;
  selisih: number;
}

/** Mirrors `handlers.OperationalSummaryRow`. */
export interface OperationalSummaryRow {
  operational_cost_type_id: UUID;
  nama_biaya: string;
  total: number;
}

/** Mirrors `models.ForecastExpense`: one planned expense line of a Forecast Kas sheet. */
export interface ForecastExpense {
  id: UUID;
  forecast_sheet_id: UUID;
  item: string;
  tanggal: DateOnlyString;
  jumlah: number;
  urutan: number;
}

/** A sheet as listed (`handlers.ForecastSheetListItem`). `total_pemasukan` counts ticked invoices still unpaid. */
export interface ForecastSheetListItem {
  id: UUID;
  nama: string;
  /** YYYY-MM */
  bulan: string;
  saldo: number;
  created_by: string;
  created_at: ISODateString;
  updated_at: ISODateString;
  total_pengeluaran: number;
  total_pemasukan: number;
  jumlah_invoice: number;
}

/** A whole sheet (`handlers.ForecastSheetDetail`). `invoice_ids` are the ticked invoices still unpaid. */
export interface ForecastSheet {
  id: UUID;
  nama: string;
  bulan: string;
  saldo: number;
  created_by: string;
  created_at: ISODateString;
  updated_at: ISODateString;
  expenses: ForecastExpense[];
  invoice_ids: UUID[];
}

/** Body of POST/PUT /forecast-sheets: the whole sheet replaces what was stored. */
export interface ForecastSheetPayload {
  nama: string;
  bulan: string;
  saldo: number;
  expenses: { item: string; tanggal: DateOnlyString; jumlah: number }[];
  invoice_ids: UUID[];
}
