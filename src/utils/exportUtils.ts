import { format } from 'date-fns';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

type AmountLike = number | string | null | undefined;

export const generateReportFilename = (reportType: string, extension: string): string => {
  const date = format(new Date(), 'yyyy-MM-dd');
  return `Laporan-${reportType}-${date}.${extension}`;
};

export interface ExportPdfOptions {
  margin?: number;
  filename: string;
  image?: {
    type: 'jpeg' | 'png' | 'webp';
    quality: number;
  };
  html2canvas?: {
    scale: number;
    useCORS: boolean;
  };
  jsPDF?: {
    unit: string;
    format: string;
    orientation: 'portrait' | 'landscape';
  };
}

export const exportToPDF = async (elementRef: HTMLElement | null, filename: string): Promise<void> => {
  if (!elementRef) {
    throw new Error('Referensi elemen diperlukan untuk ekspor PDF');
  }

  const html2pdf = (await import('html2pdf.js')).default;

  const opt: ExportPdfOptions = {
    margin: 10,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
  };

  await html2pdf().set(opt).from(elementRef).save();
};

export interface ExportColumn<T = unknown> {
  header: string;
  key: string;
  width?: number;
  accessor?: (item: T) => unknown;
}

export const exportToExcel = async <T extends Record<string, unknown> | object>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
  sheetName = 'Data',
): Promise<void> => {
  if (!data || data.length === 0) {
    throw new Error('Tidak ada data untuk diekspor');
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || 15,
  }));

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  data.forEach((item) => {
    const rowData: Record<string, unknown> = {};
    columns.forEach((col) => {
      const value = col.accessor ? col.accessor(item) : (item as Record<string, unknown>)[col.key];
      rowData[col.key] = value ?? '';
    });
    worksheet.addRow(rowData);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, filename);
};

export const formatCurrencyForExport = (value: number | null | undefined): string => {
  if (!value && value !== 0) return '';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDateForExport = (
  date: string | Date | null | undefined,
  formatStr = 'dd/MM/yyyy',
): string => {
  if (!date) return '';
  try {
    return format(new Date(date), formatStr);
  } catch {
    return '';
  }
};