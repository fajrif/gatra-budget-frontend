import { z } from 'zod';

export const areaSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  city_id: z.string().uuid('Silakan pilih kota'),
});

export type AreaFormData = z.infer<typeof areaSchema>;
