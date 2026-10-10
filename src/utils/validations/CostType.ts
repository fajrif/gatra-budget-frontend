import { z } from 'zod';

export const costTypeSchema = z.object({
  nama_biaya: z.string().min(1, 'Nama biaya wajib diisi'),
  kode: z.string().optional(),
  deskripsi: z.string().optional(),
});

export type CostTypeFormData = z.infer<typeof costTypeSchema>;
