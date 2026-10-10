import { z } from 'zod';

export const contractTypeSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  code: z.string().optional(),
  description: z.string().optional(),
});

export type ContractTypeFormData = z.infer<typeof contractTypeSchema>;
