import { z } from 'zod';

export const transactionSchema = z
  .object({
    project_id: z.string().uuid('Proyek wajib dipilih'),
    cost_type_id: z.string().uuid('Jenis biaya wajib dipilih'),
    tanggal_transaksi: z.string().min(1, 'Tanggal transaksi wajib diisi'),
    tanggal_po_tagihan: z.string().optional().or(z.literal('')),
    deskripsi_realisasi: z.string().optional(),
    jumlah_realisasi: z
      .number()
      .gt(100_000, 'Jumlah realisasi harus lebih besar dari Rp 100.000'),
    jumlah_tenaga_kerja: z.number().optional(),
  });

export type TransactionFormData = z.infer<typeof transactionSchema>;
