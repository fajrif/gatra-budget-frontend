import { z } from 'zod';

export const addressSchema = z.object({
  name: z.string().min(1, 'Label is required (e.g. Home, Office)'),
  address: z.string().min(1, 'Address is required'),
  country_id: z.string().uuid('Please select a country'),
  province_id: z.string().uuid('Please select a province'),
  city_id: z.string().uuid('Please select a city'),
  area_id: z.string().uuid().optional().or(z.literal('')),
  zipcode: z.string().optional(),
});

export type AddressFormData = z.infer<typeof addressSchema>;
