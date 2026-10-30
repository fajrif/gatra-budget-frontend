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

/** Submit = billed, Clearing = paid (tgl_bayar required). */
export type InvoiceStatus = 'Submit' | 'Clearing';

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
  total_clearing: number;
  total_outstanding: number;
  total_manajemen_fee: number;
  profit_margin: number;
}

/** Mirrors `handlers.MonthlyReportRow`: one calendar month, month = "YYYY-MM". */
export interface MonthlyReportRow {
  month: string;
  pengeluaran: number;
  tagihan: number;
  penerimaan: number;
  manajemen_fee: number;
  selisih: number;
}

/** Mirrors `handlers.MonthlyReportTotals`. */
export interface MonthlyReportTotals {
  pengeluaran: number;
  tagihan: number;
  penerimaan: number;
  manajemen_fee: number;
  selisih: number;
}
