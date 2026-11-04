import { z } from 'zod';

export const operationalCostTypeSchema = z.object({
  nama_biaya: z.string().trim().min(1, 'Nama biaya wajib diisi'),
  deskripsi: z.string().optional(),
});

export type OperationalCostTypeFormData = z.infer<typeof operationalCostTypeSchema>;
