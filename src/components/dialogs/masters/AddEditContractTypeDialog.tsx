import React, { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { contractTypesAPI } from '@/api/endpoints';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { contractTypeSchema } from '@/utils/validations/ContractType';
import { useToast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { Save, Loader2 } from 'lucide-react';
import type { z } from 'zod';
import type { ContractType } from '@/types';

export type ContractTypeFormValues = z.infer<typeof contractTypeSchema>;

export interface AddEditContractTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Contract type to edit; undefined when creating. */
  editingItem?: ContractType;
  /** Called with `shouldRefresh` after successful save. */
  onFinish: (shouldRefresh: boolean) => void;
}

/** Go's `omitempty` nullable strings arrive as `null`; the form wants ''. */
const toFormValues = (contractType?: ContractType): ContractTypeFormValues => ({
  name: contractType?.name ?? '',
  code: contractType?.code ?? '',
  description: contractType?.description ?? '',
});

const AddEditContractTypeDialog = ({
  isOpen,
  onClose,
  editingItem,
  onFinish,
}: AddEditContractTypeDialogProps) => {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContractTypeFormValues>({
    resolver: zodResolver(contractTypeSchema),
    defaultValues: toFormValues(editingItem),
  });

  useEffect(() => {
    reset(toFormValues(editingItem));
  }, [editingItem, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: ContractTypeFormValues) =>
      editingItem?.id ? contractTypesAPI.update(editingItem.id, data) : contractTypesAPI.create(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Jenis kontrak ${editingItem ? 'berhasil diperbarui' : 'berhasil ditambahkan'}.`,
        variant: 'success',
      });
      onFinish(true);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: getErrorMessage(err, 'Gagal menyimpan jenis kontrak.'),
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Ubah Jenis Kontrak' : 'Tambah Jenis Kontrak'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
          <div>
            <Label>Nama</Label>
            <Input {...register('name')} placeholder="PO" className="mt-1" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label>Kode</Label>
            <Input {...register('code')} placeholder="PO" className="mt-1" />
          </div>
          <div>
            <Label>Deskripsi</Label>
            <Input {...register('description')} placeholder="Kontrak berbasis purchase order" className="mt-1" />
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

export default AddEditContractTypeDialog;
