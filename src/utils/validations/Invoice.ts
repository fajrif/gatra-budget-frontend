import { z } from 'zod';

export const invoiceSchema = z
  .object({
    no_invoice: z.string().min(1, 'No. invoice wajib diisi'),
    project_id: z.string().uuid('Proyek wajib dipilih'),
    nama_invoice: z.string().min(1, 'Nama invoice wajib diisi'),
    tgl_tagihan: z.string().min(1, 'Tanggal tagihan wajib diisi'),
    tgl_bayar: z.string().optional().or(z.literal('')),
    status: z.enum(['Submit', 'Kliring']),
    metode_pembayaran: z.enum(['Kontrak', 'SPR']),
    periode_tagihan: z.array(z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)).min(1, 'Periode tagihan wajib dipilih'),
    nilai: z.number().positive('Nilai wajib diisi dan harus lebih besar dari 0'),
    description: z.string().optional(),
    manajemen_fee: z.number().min(0, 'Manajemen fee tidak boleh negatif'),
  })
  .refine((data) => data.status !== 'Kliring' || !!data.tgl_bayar, {
    message: 'Tanggal bayar wajib diisi untuk status Kliring',
    path: ['tgl_bayar'],
  })
  .refine((data) => !data.tgl_bayar || data.tgl_bayar > data.tgl_tagihan, {
    message: 'Tanggal bayar harus setelah tanggal tagihan',
    path: ['tgl_bayar'],
  })
  .refine((data) => data.metode_pembayaran !== 'Kontrak' || data.periode_tagihan.length === 1, {
    message: 'Metode Kontrak hanya boleh satu periode',
    path: ['periode_tagihan'],
  })
  .refine((data) => data.manajemen_fee <= data.nilai, {
    message: 'Manajemen fee tidak boleh melebihi nilai invoice',
    path: ['manajemen_fee'],
  });

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
