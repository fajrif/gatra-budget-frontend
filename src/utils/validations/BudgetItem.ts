import { z } from 'zod';

export const budgetItemSchema = z.object({
  cost_type_id: z.string().uuid('Jenis biaya wajib dipilih'),
  kategori_anggaran: z.enum(['monthly', 'lumpsum'], {
    error: 'Kategori anggaran wajib dipilih',
  }),
  total_anggaran: z.number().positive('Total anggaran harus lebih besar dari 0'),
  deskripsi_anggaran: z.string().optional(),
});

export type BudgetItemFormData = z.infer<typeof budgetItemSchema>;
