import type { ISODateString, UUID } from './common';

/**
 * Client, ContractType, and CostType are simple master data referenced by
 * Project (Client/ContractType) and BudgetItem/Transaction (CostType). They
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

export type StatusKontrak = 'Active' | 'Pending' | 'Non Aktif';

/**
 * Mirrors `models.Project`. `jangka_waktu` is always server-computed from
 * `tanggal_mulai`/`tanggal_selesai` — never send it in a create/update payload.
 */
export type KategoriAnggaran = 'monthly' | 'lumpsum';

/**
 * Mirrors `models.BudgetItem`. A "monthly" budget item is one parent row
 * (`is_parent: true`, `parent_budget_id: null`) plus N evenly-split monthly
 * child rows; a "lumpsum" budget item is a single parent row with no
 * children. Children are server-computed by the BudgetItemSplitter service —
 * never create/edit them directly, only through their parent.
 */
export interface BudgetItem {
  id: UUID;
  project_id: UUID;
  cost_type_id: UUID;
  cost_type?: CostType | null;
  jenis_biaya_name?: string | null;
  kategori_anggaran?: KategoriAnggaran | null;
  total_anggaran?: number | null;
  deskripsi_anggaran?: string | null;
  periode_bulan?: string | null;
  jumlah_anggaran: number;
  bulan_ke?: number | null;
  parent_budget_id?: UUID | null;
  is_parent: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Project {
  id: UUID;
  no_sp2k: string;
  no_perjanjian?: string | null;
  no_amandemen?: string | null;
  tanggal_perjanjian?: DateOnlyString | null;
  judul_pekerjaan: string;
  jangka_waktu?: number | null;
  tanggal_mulai: DateOnlyString;
  tanggal_selesai?: DateOnlyString | null;
  nilai_pekerjaan: number;
  management_fee?: number | null;
  tarif_management_fee_persen?: number | null;
  client_id?: UUID | null;
  client?: Client | null;
  contract_type_id?: UUID | null;
  contract_type?: ContractType | null;
  status_kontrak: StatusKontrak;
  created_by: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type SLAStatus = 'on_time' | 'h_plus_1' | 'late' | 'no_data';

/**
 * Mirrors `handlers.TransactionResponse` (= `models.Transaction` plus a
 * response-only `sla_status`). `bulan_realisasi` and the management-fee
 * fields are always server-computed — never send them in a create/update
 * payload. `bukti_transaksi_url` is set via the upload endpoint, not here.
 */
export interface Transaction {
  id: UUID;
  project_id: UUID;
  project?: Project | null;
  cost_type_id: UUID;
  cost_type?: CostType | null;
  tanggal_transaksi: DateOnlyString;
  tanggal_po_tagihan?: DateOnlyString | null;
  bulan_realisasi?: string | null;
  deskripsi_realisasi?: string | null;
  jumlah_realisasi: number;
  persentase_management_fee?: number | null;
  nilai_management_fee?: number | null;
  jumlah_tenaga_kerja?: number | null;
  bukti_transaksi_url?: string | null;
  sla_status: SLAStatus;
  created_by: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/**
 * Mirrors `handlers.ProjectSummary`. Admin-only: only served from
 * `/api/reports/...`, never from the plain project payloads.
 * `profit_margin` is the management-fee-style margin: the project's fee rate
 * applied to `total_realisasi`. `absorption_alert` is true above 80% absorbed.
 */
export interface ProjectSummary {
  project_id: UUID;
  no_sp2k: string;
  judul_pekerjaan: string;
  status_kontrak: StatusKontrak;
  nilai_pekerjaan: number;
  total_realisasi: number;
  remaining_budget: number;
  absorption_pct: number;
  absorption_alert: boolean;
  tarif_management_fee_persen?: number | null;
  profit_margin: number;
}

/** Mirrors `handlers.ManagementFeeRow`: one project's realized spend in one month. */
export interface ManagementFeeRow {
  project_id: UUID;
  no_sp2k: string;
  judul_pekerjaan: string;
  bulan_realisasi: string;
  total_realisasi: number;
  tarif_management_fee_persen?: number | null;
  management_fee: number;
}

/** Mirrors `handlers.ManagementFeeTotals`. */
export interface ManagementFeeTotals {
  total_realisasi: number;
  management_fee: number;
}
