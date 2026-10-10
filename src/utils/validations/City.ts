import { z } from 'zod';

export const citySchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  province_id: z.string().uuid('Silakan pilih provinsi'),
});

export type CityFormData = z.infer<typeof citySchema>;
