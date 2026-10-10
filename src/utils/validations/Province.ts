import { z } from 'zod';

export const provinceSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  country_id: z.string().uuid('Silakan pilih negara'),
});

export type ProvinceFormData = z.infer<typeof provinceSchema>;
