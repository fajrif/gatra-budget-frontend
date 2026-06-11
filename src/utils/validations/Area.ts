import { z } from 'zod';

export const areaSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  city_id: z.string().uuid('Please select a city'),
});

export type AreaFormData = z.infer<typeof areaSchema>;
