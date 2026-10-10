import { z } from 'zod';

export const addressSchema = z.object({
  name: z.string().min(1, 'Label wajib diisi (mis. Rumah, Kantor)'),
  address: z.string().min(1, 'Alamat wajib diisi'),
  country_id: z.string().uuid('Silakan pilih negara'),
  province_id: z.string().uuid('Silakan pilih provinsi'),
  city_id: z.string().uuid('Silakan pilih kota'),
  area_id: z.string().uuid().optional().or(z.literal('')),
  zipcode: z.string().optional(),
});

export type AddressFormData = z.infer<typeof addressSchema>;
