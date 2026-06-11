import { z } from 'zod';

export const provinceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  country_id: z.string().uuid('Please select a country'),
});

export type ProvinceFormData = z.infer<typeof provinceSchema>;
