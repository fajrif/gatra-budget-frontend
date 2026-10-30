import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { clientsAPI, contractTypesAPI, costTypesAPI, projectsAPI } from '@/api/endpoints';
import type { ImportKind, ImportRow } from '@/types';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const DATA_SHEET = 'Data';
const MAX_ROWS = 1000;

type ColumnKind = 'text' | 'date' | 'number' | 'integer';

interface TemplateColumn {
  /** Header text; also the field name the server reports errors against. */
  key: string;
  label: string;
  required: boolean;
  type: ColumnKind;
  width: number;
  note: string;
  example: string | number;
}

interface TemplateDefinition {
  filename: string;
  columns: TemplateColumn[];
  rules: string[];
}

const DATE_NOTE = 'format YYYY-MM-DD, mis. 2026-10-31';

const TEMPLATES: Record<ImportKind, TemplateDefinition> = {
  projects: {
    filename: 'Template-Import-Proyek.xlsx',
    columns: [
      { key: 'no_sp2k', label: 'No SP2K', required: true, type: 'text', width: 20, note: 'unik; bila sudah ada, proyek tsb diperbarui', example: 'SP2K-001' },
      { key: 'judul_pekerjaan', label: 'Judul Pekerjaan', required: true, type: 'text', width: 40, note: 'nama pekerjaan', example: 'Pembangunan Gedung A' },
      { key: 'tanggal_mulai', label: 'Tanggal Mulai', required: true, type: 'date', width: 16, note: DATE_NOTE, example: '2026-01-01' },
      { key: 'tanggal_selesai', label: 'Tanggal Selesai', required: true, type: 'date', width: 16, note: `${DATE_NOTE}; harus setelah Tanggal Mulai`, example: '2026-12-31' },
      { key: 'nilai_pekerjaan', label: 'Nilai Pekerjaan', required: true, type: 'number', width: 20, note: 'angka tanpa titik/koma pemisah', example: 1000000000 },
      { key: 'no_perjanjian', label: 'No Perjanjian', required: false, type: 'text', width: 20, note: 'opsional', example: 'PRJ-001' },
      { key: 'no_amandemen', label: 'No Amandemen', required: false, type: 'text', width: 20, note: 'opsional', example: '' },
      { key: 'tanggal_perjanjian', label: 'Tanggal Perjanjian', required: false, type: 'date', width: 18, note: `${DATE_NOTE}; opsional, tidak boleh setelah Tanggal Mulai`, example: '2025-12-15' },
      { key: 'client', label: 'Klien', required: false, type: 'text', width: 28, note: 'nama klien persis seperti di sheet Referensi; opsional', example: '' },
      { key: 'contract_type', label: 'Jenis Kontrak', required: false, type: 'text', width: 24, note: 'nama jenis kontrak persis seperti di sheet Referensi; opsional', example: '' },
    ],
    rules: [
      'tanggal_selesai harus setelah tanggal_mulai.',
      'tanggal_perjanjian (bila diisi) tidak boleh setelah tanggal_mulai.',
      'No SP2K tidak boleh sama dengan baris lain di file ini.',
      'Bila No SP2K sudah ada di sistem, data proyek tsb diperbarui (bukan dibuat ganda).',
    ],
  },
  transactions: {
    filename: 'Template-Import-Transaksi.xlsx',
    columns: [
      { key: 'no_sp2k', label: 'No SP2K', required: true, type: 'text', width: 20, note: 'No SP2K proyek yang sudah ada di sistem', example: 'SP2K-001' },
      { key: 'cost_type', label: 'Jenis Biaya', required: true, type: 'text', width: 28, note: 'nama jenis biaya persis seperti di sheet Referensi', example: '' },
      { key: 'tanggal_transaksi', label: 'Tanggal Transaksi', required: true, type: 'date', width: 18, note: DATE_NOTE, example: '2026-03-15' },
      { key: 'jumlah_realisasi', label: 'Jumlah Realisasi', required: true, type: 'number', width: 20, note: 'angka, harus lebih dari 100.000', example: 2500000 },
      { key: 'deskripsi_realisasi', label: 'Deskripsi', required: false, type: 'text', width: 40, note: 'opsional', example: 'Gaji tukang bulan Maret' },
      { key: 'jumlah_tenaga_kerja', label: 'Jumlah Tenaga Kerja', required: false, type: 'integer', width: 20, note: 'bilangan bulat, opsional', example: 12 },
    ],
    rules: [
      'No SP2K harus sudah ada di sistem (import Proyek terlebih dahulu).',
      'jumlah_realisasi harus lebih dari 100.000.',
      'Transaksi tidak punya kunci unik: setiap baris selalu membuat transaksi BARU. Jangan import file yang sama dua kali.',
    ],
  },
  invoices: {
    filename: 'Template-Import-Invoice.xlsx',
    columns: [
      { key: 'no_sp2k', label: 'No SP2K', required: true, type: 'text', width: 20, note: 'No SP2K proyek yang sudah ada di sistem', example: 'SP2K-001' },
      { key: 'no_invoice', label: 'No Invoice', required: true, type: 'text', width: 20, note: 'unik; bila sudah ada, invoice tsb diperbarui', example: 'INV-001' },
      { key: 'nama_invoice', label: 'Nama Invoice', required: true, type: 'text', width: 36, note: 'judul tagihan', example: 'Termin 1' },
      { key: 'tgl_tagihan', label: 'Tanggal Tagihan', required: true, type: 'date', width: 16, note: DATE_NOTE, example: '2026-10-01' },
      { key: 'status', label: 'Status', required: true, type: 'text', width: 14, note: 'Submit (belum dibayar) atau Clearing (sudah dibayar)', example: 'Clearing' },
      { key: 'tgl_bayar', label: 'Tanggal Bayar', required: false, type: 'date', width: 16, note: `${DATE_NOTE}; wajib bila Clearing, kosong bila Submit, harus setelah Tanggal Tagihan`, example: '2026-10-20' },
      { key: 'nilai', label: 'Nilai', required: true, type: 'number', width: 20, note: 'angka, harus lebih dari 0', example: 100000000 },
      { key: 'manajemen_fee', label: 'Manajemen Fee', required: false, type: 'number', width: 20, note: 'angka tetap; kosong = 0; tidak boleh melebihi Nilai', example: 5000000 },
      { key: 'description', label: 'Deskripsi', required: false, type: 'text', width: 40, note: 'opsional', example: '' },
    ],
    rules: [
      'No SP2K harus sudah ada di sistem (import Proyek terlebih dahulu).',
      'Status Clearing wajib punya Tanggal Bayar; status Submit tidak boleh punya Tanggal Bayar.',
      'Tanggal Bayar harus setelah Tanggal Tagihan.',
      'Manajemen Fee tidak boleh negatif dan tidak boleh melebihi Nilai.',
      'No Invoice tidak boleh sama dengan baris lain di file ini.',
      'Bila No Invoice sudah ada di sistem, invoice tsb diperbarui (bukan dibuat ganda).',
    ],
  },
};

interface ReferenceList {
  heading: string;
  values: string[];
}

/** Master data the user must copy names from, fetched when the template is downloaded. */
const loadReferences = async (kind: ImportKind): Promise<ReferenceList[]> => {
  if (kind === 'projects') {
    const [clients, contractTypes] = await Promise.all([
      clientsAPI.getAll({ all: true }),
      contractTypesAPI.getAll({ all: true }),
    ]);
    return [
      { heading: 'Klien', values: (clients.data?.clients ?? []).map((c) => c.name) },
      { heading: 'Jenis Kontrak', values: (contractTypes.data?.contract_types ?? []).map((c) => c.name) },
    ];
  }

  const projects = await projectsAPI.getAll({ all: true });
  const projectList: ReferenceList = {
    heading: 'No SP2K (proyek yang sudah ada)',
    values: (projects.data?.projects ?? []).map((p) => `${p.no_sp2k} — ${p.judul_pekerjaan}`),
  };
  if (kind === 'invoices') return [projectList];

  const costTypes = await costTypesAPI.getAll({ all: true });
  return [
    { heading: 'Jenis Biaya', values: (costTypes.data?.cost_types ?? []).map((c) => c.nama_biaya) },
    projectList,
  ];
};

const columnLetter = (index: number): string => String.fromCharCode('A'.charCodeAt(0) + index);

/**
 * Builds and downloads the .xlsx template for a resource: a Data sheet to fill
 * in, a Petunjuk sheet with the rules and an example row, and a Referensi sheet
 * with the master data names the rows may refer to.
 */
export const downloadImportTemplate = async (kind: ImportKind): Promise<void> => {
  const definition = TEMPLATES[kind];
  const references = await loadReferences(kind);

  const workbook = new ExcelJS.Workbook();
  const data = workbook.addWorksheet(DATA_SHEET);
  const guide = workbook.addWorksheet('Petunjuk');
  const reference = workbook.addWorksheet('Referensi');

  // Data: header row only. Header text is the field name the server reports
  // errors against, so a row error can be matched to its column.
  data.columns = definition.columns.map((col) => ({ header: col.key, key: col.key, width: col.width }));
  const header = data.getRow(1);
  header.font = { bold: true };
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
  data.views = [{ state: 'frozen', ySplit: 1 }];

  definition.columns.forEach((col, i) => {
    const cell = header.getCell(i + 1);
    cell.note = `${col.required ? 'Wajib' : 'Opsional'}: ${col.note}`;
    if (col.required) cell.font = { bold: true, color: { argb: 'FFB00020' } };
    if (col.type === 'date') data.getColumn(i + 1).numFmt = 'yyyy-mm-dd';
  });

  // Dropdowns for fixed or master-data values.
  const dropdowns: Record<string, string> = {};
  if (kind === 'invoices') dropdowns.status = '"Submit,Clearing"';

  references.forEach((list, listIndex) => {
    reference.getCell(1, listIndex + 1).value = list.heading;
    list.values.forEach((v, i) => {
      reference.getCell(i + 2, listIndex + 1).value = v;
    });
    reference.getColumn(listIndex + 1).width = 40;

    const key = { Klien: 'client', 'Jenis Kontrak': 'contract_type', 'Jenis Biaya': 'cost_type' }[list.heading];
    if (key && list.values.length > 0) {
      const letter = columnLetter(listIndex);
      dropdowns[key] = `Referensi!$${letter}$2:$${letter}$${list.values.length + 1}`;
    }
  });
  reference.getRow(1).font = { bold: true };

  Object.entries(dropdowns).forEach(([key, formula]) => {
    const colIndex = definition.columns.findIndex((c) => c.key === key);
    if (colIndex < 0) return;
    for (let row = 2; row <= MAX_ROWS + 1; row++) {
      data.getCell(row, colIndex + 1).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [formula],
        showErrorMessage: true,
        errorTitle: 'Nilai tidak dikenal',
        error: 'Pilih salah satu nilai dari daftar.',
      };
    }
  });

  // Petunjuk: columns, rules and one example row.
  guide.columns = [
    { width: 24 },
    { width: 12 },
    { width: 60 },
    { width: 24 },
  ];
  guide.addRow(['Kolom (judul di sheet Data)', 'Wajib?', 'Keterangan', 'Contoh']).font = { bold: true };
  definition.columns.forEach((col) => {
    guide.addRow([col.key, col.required ? 'Ya' : 'Tidak', col.note, col.example]);
  });
  guide.addRow([]);
  guide.addRow(['Aturan']).font = { bold: true };
  [
    'Isi data mulai baris 2 di sheet Data; jangan ubah judul kolom di baris 1.',
    `Maksimal ${MAX_ROWS} baris per import.`,
    'Seluruh baris divalidasi lebih dulu. Bila ada yang salah, tidak ada data yang disimpan: perbaiki file lalu import lagi.',
    ...definition.rules,
  ].forEach((rule) => guide.addRow([`• ${rule}`]));

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer], { type: XLSX_MIME }), definition.filename);
};

const pad = (n: number): string => String(n).padStart(2, '0');

/** Converts any ExcelJS cell value to the trimmed text the server expects. */
const cellToText = (value: ExcelJS.CellValue): string => {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) {
    // ExcelJS reads date cells as UTC midnight; local getters would shift the day.
    return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'string') return value.trim();
  if ('richText' in value) return value.richText.map((part) => part.text).join('').trim();
  if ('result' in value) return cellToText(value.result as ExcelJS.CellValue);
  if ('text' in value) return String(value.text).trim();
  return '';
};

/**
 * Reads the Data sheet of a filled-in template into rows for the import
 * endpoint. Throws an Error with a user-facing message when the file is not a
 * usable template. Empty rows are skipped; `row` keeps the original sheet row.
 */
export const parseImportFile = async (file: File, kind: ImportKind): Promise<ImportRow[]> => {
  const definition = TEMPLATES[kind];

  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(await file.arrayBuffer());
  } catch {
    throw new Error('File tidak dapat dibaca. Gunakan file .xlsx dari template.');
  }

  const sheet = workbook.getWorksheet(DATA_SHEET) ?? workbook.worksheets[0];
  if (!sheet) throw new Error('File tidak memiliki sheet. Gunakan file .xlsx dari template.');

  const columnByKey = new Map<string, number>();
  sheet.getRow(1).eachCell((cell, colNumber) => {
    columnByKey.set(cellToText(cell.value).toLowerCase(), colNumber);
  });

  const missing = definition.columns.filter((col) => !columnByKey.has(col.key)).map((col) => col.key);
  if (missing.length > 0) {
    throw new Error(`Kolom tidak ditemukan: ${missing.join(', ')}. Gunakan template terbaru.`);
  }

  const rows: ImportRow[] = [];
  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
    const sheetRow = sheet.getRow(rowNumber);
    const row: ImportRow = { row: rowNumber };
    let hasValue = false;
    for (const col of definition.columns) {
      const text = cellToText(sheetRow.getCell(columnByKey.get(col.key) as number).value);
      if (text !== '') hasValue = true;
      row[col.key] = text;
    }
    if (hasValue) rows.push(row);
  }

  if (rows.length === 0) throw new Error('File tidak berisi baris data.');
  if (rows.length > MAX_ROWS) throw new Error(`Maksimal ${MAX_ROWS} baris per import (file berisi ${rows.length}).`);
  return rows;
};
