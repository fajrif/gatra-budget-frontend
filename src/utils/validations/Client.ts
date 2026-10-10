import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  contact_name: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
