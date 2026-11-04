import { z } from 'zod';

export const costOperationSchema = z.object({
  operational_cost_type_id: z.string().uuid('Jenis beban operasional wajib dipilih'),
  tanggal_transaksi: z.string().min(1, 'Tanggal transaksi wajib diisi'),
  deskripsi: z.string().optional(),
  jumlah: z.number().gt(100_000, 'Jumlah harus lebih besar dari Rp 100.000'),
});

export type CostOperationFormData = z.infer<typeof costOperationSchema>;
