import { z } from 'zod';

export const countrySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().length(2, 'Country code must be exactly 2 characters').toUpperCase(),
});

export type CountryFormData = z.infer<typeof countrySchema>;
