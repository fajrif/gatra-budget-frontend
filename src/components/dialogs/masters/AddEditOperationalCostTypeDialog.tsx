import React, { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { operationalCostTypesAPI } from '@/api/endpoints';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { operationalCostTypeSchema } from '@/utils/validations/OperationalCostType';
import { useToast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { Save, Loader2 } from 'lucide-react';
import type { z } from 'zod';
import type { OperationalCostType } from '@/types';

export type OperationalCostTypeFormValues = z.infer<typeof operationalCostTypeSchema>;

export interface AddEditOperationalCostTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Cost type to edit; undefined when creating. */
  editingItem?: OperationalCostType;
  /** Called with `shouldRefresh` after successful save. */
  onFinish: (shouldRefresh: boolean) => void;
}

/** Go's `omitempty` nullable strings arrive as `null`; the form wants ''. */
const toFormValues = (costType?: OperationalCostType): OperationalCostTypeFormValues => ({
  nama_biaya: costType?.nama_biaya ?? '',
  deskripsi: costType?.deskripsi ?? '',
});

const AddEditOperationalCostTypeDialog = ({ isOpen, onClose, editingItem, onFinish }: AddEditOperationalCostTypeDialogProps) => {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OperationalCostTypeFormValues>({
    resolver: zodResolver(operationalCostTypeSchema),
    defaultValues: toFormValues(editingItem),
  });

  useEffect(() => {
    reset(toFormValues(editingItem));
  }, [editingItem, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: OperationalCostTypeFormValues) =>
      editingItem?.id ? operationalCostTypesAPI.update(editingItem.id, data) : operationalCostTypesAPI.create(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Jenis beban operasional ${editingItem ? 'berhasil diperbarui' : 'berhasil ditambahkan'}.`,
        variant: 'success',
      });
      onFinish(true);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: getErrorMessage(err, 'Gagal menyimpan jenis beban operasional.'),
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Ubah Jenis Beban Operasional' : 'Tambah Jenis Beban Operasional'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
          <div>
            <Label>Nama Biaya</Label>
            <Input {...register('nama_biaya')} placeholder="Konsumsi" className="mt-1" />
            {errors.nama_biaya && <p className="text-red-500 text-xs mt-1">{errors.nama_biaya.message}</p>}
          </div>
          <div>
            <Label>Deskripsi</Label>
            <Input {...register('deskripsi')} placeholder="Makan dan minum kantor" className="mt-1" />
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

export default AddEditOperationalCostTypeDialog;
