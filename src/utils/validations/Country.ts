import { z } from 'zod';

export const countrySchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  code: z.string().length(2, 'Kode negara harus tepat 2 karakter').toUpperCase(),
});

export type CountryFormData = z.infer<typeof countrySchema>;
