import { z } from 'zod';

export const projectGroupSchema = z.object({
  nama: z.string().trim().min(1, 'Nama group wajib diisi'),
  deskripsi: z.string().optional(),
});

export type ProjectGroupFormData = z.infer<typeof projectGroupSchema>;
