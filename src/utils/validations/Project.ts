import { z } from 'zod';

export const projectSchema = z
  .object({
    no_sp2k: z.string().min(1, 'No. SP2K wajib diisi'),
    no_perjanjian: z.string().optional(),
    no_amandemen: z.string().optional(),
    tanggal_perjanjian: z.string().optional().or(z.literal('')),
    judul_pekerjaan: z.string().min(1, 'Judul pekerjaan wajib diisi'),
    tanggal_mulai: z.string().min(1, 'Tanggal mulai wajib diisi'),
    tanggal_selesai: z.string().optional().or(z.literal('')),
    nilai_pekerjaan: z.number().positive('Nilai pekerjaan wajib diisi dan harus lebih besar dari 0'),
    management_fee: z.number().optional(),
    tarif_management_fee_persen: z.number().min(0).max(100).optional(),
    client_id: z.string().uuid().optional().or(z.literal('')),
    contract_type_id: z.string().uuid().optional().or(z.literal('')),
    status_kontrak: z.enum(['Active', 'Pending', 'Non Aktif']),
  })
  .refine(
    (data) =>
      !data.tanggal_selesai || data.tanggal_selesai === '' || data.tanggal_selesai > data.tanggal_mulai,
    { message: 'Tanggal selesai harus setelah tanggal mulai', path: ['tanggal_selesai'] },
  )
  .refine(
    (data) =>
      !data.tanggal_perjanjian ||
      data.tanggal_perjanjian === '' ||
      data.tanggal_perjanjian <= data.tanggal_mulai,
    { message: 'Tanggal perjanjian tidak boleh setelah tanggal mulai', path: ['tanggal_perjanjian'] },
  )
  .refine(
    (data) =>
      data.management_fee === undefined || data.management_fee < data.nilai_pekerjaan,
    { message: 'Management fee tidak boleh melebihi nilai pekerjaan', path: ['management_fee'] },
  );

export type ProjectFormData = z.infer<typeof projectSchema>;
