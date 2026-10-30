import React, { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { projectsAPI, clientsAPI, contractTypesAPI } from '@/api/endpoints';
import { isAxiosError } from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import Select from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { projectSchema } from '@/utils/validations/Project';
import { useToast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { Save, Loader2 } from 'lucide-react';
import type { z } from 'zod';
import type { Project } from '@/types';

export type ProjectFormValues = z.infer<typeof projectSchema>;

export interface AddEditProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Project to edit; undefined when creating. */
  editingItem?: Project;
  /** Called with `shouldRefresh` after successful save. */
  onFinish: (shouldRefresh: boolean) => void;
}

/** Go's `omitempty` nullable fields arrive as `null`; the form wants '' or undefined. */
const toFormValues = (project?: Project): ProjectFormValues => ({
  no_sp2k: project?.no_sp2k ?? '',
  no_perjanjian: project?.no_perjanjian ?? '',
  no_amandemen: project?.no_amandemen ?? '',
  tanggal_perjanjian: project?.tanggal_perjanjian ?? '',
  judul_pekerjaan: project?.judul_pekerjaan ?? '',
  tanggal_mulai: project?.tanggal_mulai ?? '',
  tanggal_selesai: project?.tanggal_selesai ?? '',
  nilai_pekerjaan: project?.nilai_pekerjaan ?? 0,
  client_id: project?.client_id ?? '',
  contract_type_id: project?.contract_type_id ?? '',
});

const AddEditProjectDialog = ({
  isOpen,
  onClose,
  editingItem,
  onFinish,
}: AddEditProjectDialogProps) => {
  const { toast } = useToast();

  const { data: clientsData } = useQuery({
    queryKey: ['clients-all'],
    queryFn: () => clientsAPI.getAll({ all: true }),
    select: (res) => res.data?.clients ?? [],
  });

  const { data: contractTypesData } = useQuery({
    queryKey: ['contract-types-all'],
    queryFn: () => contractTypesAPI.getAll({ all: true }),
    select: (res) => res.data?.contract_types ?? [],
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: toFormValues(editingItem),
  });

  useEffect(() => {
    reset(toFormValues(editingItem));
  }, [editingItem, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: ProjectFormValues) => {
      const payload = {
        ...data,
        client_id: data.client_id || undefined,
        contract_type_id: data.contract_type_id || undefined,
        tanggal_perjanjian: data.tanggal_perjanjian || undefined,
      };
      return editingItem?.id ? projectsAPI.update(editingItem.id, payload) : projectsAPI.create(payload);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Proyek ${editingItem ? 'berhasil diperbarui' : 'berhasil ditambahkan'}.`,
        variant: 'success',
      });
      onFinish(true);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: isAxiosError(err) && err.response?.status === 409
          ? 'No SP2K sudah dipakai proyek lain.'
          : getErrorMessage(err, 'Gagal menyimpan proyek.'),
        variant: 'destructive',
      });
    },
  });

  const mapOptions = (items: { id: string; name: string }[] = []) =>
    items.map((i) => ({ value: i.id, label: i.name }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Ubah Proyek' : 'Tambah Proyek'}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => saveMutation.mutate(data))}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>No. SP2K</Label>
              <Input {...register('no_sp2k')} placeholder="SP2K-001" className="mt-1" />
              {errors.no_sp2k && <p className="text-red-500 text-xs mt-1">{errors.no_sp2k.message}</p>}
            </div>
            <div>
              <Label>
                No. Perjanjian <span className="text-slate-400 text-xs">(opsional)</span>
              </Label>
              <Input {...register('no_perjanjian')} className="mt-1" />
            </div>
          </div>

          <div>
            <Label>Judul Pekerjaan</Label>
            <Input {...register('judul_pekerjaan')} placeholder="Pembangunan Gedung" className="mt-1" />
            {errors.judul_pekerjaan && (
              <p className="text-red-500 text-xs mt-1">{errors.judul_pekerjaan.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Tanggal Perjanjian</Label>
              <Input type="date" {...register('tanggal_perjanjian')} className="mt-1" />
              {errors.tanggal_perjanjian && (
                <p className="text-red-500 text-xs mt-1">{errors.tanggal_perjanjian.message}</p>
              )}
            </div>
            <div>
              <Label>Tanggal Mulai</Label>
              <Input type="date" {...register('tanggal_mulai')} className="mt-1" />
              {errors.tanggal_mulai && (
                <p className="text-red-500 text-xs mt-1">{errors.tanggal_mulai.message}</p>
              )}
            </div>
            <div>
              <Label>Tanggal Selesai</Label>
              <Input type="date" {...register('tanggal_selesai')} className="mt-1" />
              {errors.tanggal_selesai && (
                <p className="text-red-500 text-xs mt-1">{errors.tanggal_selesai.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label>Nilai Pekerjaan</Label>
            <CurrencyInput control={control} name="nilai_pekerjaan" placeholder="Rp 0" className="mt-1" />
            {errors.nilai_pekerjaan && (
              <p className="text-red-500 text-xs mt-1">{errors.nilai_pekerjaan.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>
                Klien <span className="text-slate-400 text-xs">(opsional)</span>
              </Label>
              <Controller
                name="client_id"
                control={control}
                render={({ field }) => (
                  <Select
                    options={mapOptions(clientsData)}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pilih..."
                    className="mt-1"
                    clearable
                  />
                )}
              />
            </div>
            <div>
              <Label>
                Jenis Kontrak <span className="text-slate-400 text-xs">(opsional)</span>
              </Label>
              <Controller
                name="contract_type_id"
                control={control}
                render={({ field }) => (
                  <Select
                    options={mapOptions(contractTypesData)}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pilih..."
                    className="mt-1"
                    clearable
                  />
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditProjectDialog;
