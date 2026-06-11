import { z } from 'zod';

export const citySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  province_id: z.string().uuid('Please select a province'),
});

export type CityFormData = z.infer<typeof citySchema>;
