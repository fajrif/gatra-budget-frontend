import React, { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { costTypesAPI } from '@/api/endpoints';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { costTypeSchema } from '@/utils/validations/CostType';
import { useToast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { Save, Loader2 } from 'lucide-react';
import type { z } from 'zod';
import type { CostType } from '@/types';

export type CostTypeFormValues = z.infer<typeof costTypeSchema>;

export interface AddEditCostTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Cost type to edit; undefined when creating. */
  editingItem?: CostType;
  /** Called with `shouldRefresh` after successful save. */
  onFinish: (shouldRefresh: boolean) => void;
}

/** Go's `omitempty` nullable strings arrive as `null`; the form wants ''. */
const toFormValues = (costType?: CostType): CostTypeFormValues => ({
  nama_biaya: costType?.nama_biaya ?? '',
  kode: costType?.kode ?? '',
  deskripsi: costType?.deskripsi ?? '',
});

const AddEditCostTypeDialog = ({ isOpen, onClose, editingItem, onFinish }: AddEditCostTypeDialogProps) => {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CostTypeFormValues>({
    resolver: zodResolver(costTypeSchema),
    defaultValues: toFormValues(editingItem),
  });

  useEffect(() => {
    reset(toFormValues(editingItem));
  }, [editingItem, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: CostTypeFormValues) =>
      editingItem?.id ? costTypesAPI.update(editingItem.id, data) : costTypesAPI.create(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Jenis biaya ${editingItem ? 'berhasil diperbarui' : 'berhasil ditambahkan'}.`,
        variant: 'success',
      });
      onFinish(true);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: getErrorMessage(err, 'Gagal menyimpan jenis biaya.'),
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Ubah Jenis Biaya' : 'Tambah Jenis Biaya'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
          <div>
            <Label>Nama Biaya</Label>
            <Input {...register('nama_biaya')} placeholder="Gaji & Tunjangan" className="mt-1" />
            {errors.nama_biaya && <p className="text-red-500 text-xs mt-1">{errors.nama_biaya.message}</p>}
          </div>
          <div>
            <Label>Kode</Label>
            <Input {...register('kode')} placeholder="SAL" className="mt-1" />
          </div>
          <div>
            <Label>Deskripsi</Label>
            <Input {...register('deskripsi')} placeholder="Beban gaji karyawan" className="mt-1" />
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

export default AddEditCostTypeDialog;
