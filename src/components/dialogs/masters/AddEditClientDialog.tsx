import React, { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { clientsAPI } from '@/api/endpoints';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { clientSchema } from '@/utils/validations/Client';
import { useToast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { Save, Loader2 } from 'lucide-react';
import type { z } from 'zod';
import type { Client } from '@/types';

export type ClientFormValues = z.infer<typeof clientSchema>;

export interface AddEditClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Client to edit; undefined when creating. */
  editingItem?: Client;
  /** Called with `shouldRefresh` after successful save. */
  onFinish: (shouldRefresh: boolean) => void;
}

/** Go's `omitempty` nullable strings arrive as `null`; the form wants ''. */
const toFormValues = (client?: Client): ClientFormValues => ({
  name: client?.name ?? '',
  contact_name: client?.contact_name ?? '',
  phone: client?.phone ?? '',
  address: client?.address ?? '',
});

const AddEditClientDialog = ({ isOpen, onClose, editingItem, onFinish }: AddEditClientDialogProps) => {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: toFormValues(editingItem),
  });

  useEffect(() => {
    reset(toFormValues(editingItem));
  }, [editingItem, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: ClientFormValues) =>
      editingItem?.id ? clientsAPI.update(editingItem.id, data) : clientsAPI.create(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Klien ${editingItem ? 'berhasil diperbarui' : 'berhasil ditambahkan'}.`,
        variant: 'success',
      });
      onFinish(true);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: getErrorMessage(err, 'Gagal menyimpan klien.'),
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Ubah Klien' : 'Tambah Klien'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
          <div>
            <Label>Nama Klien</Label>
            <Input {...register('name')} placeholder="PT Mitra Jaya" className="mt-1" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label>Nama Kontak</Label>
            <Input {...register('contact_name')} placeholder="Budi Santoso" className="mt-1" />
          </div>
          <div>
            <Label>Telepon</Label>
            <Input {...register('phone')} placeholder="081234567890" className="mt-1" />
          </div>
          <div>
            <Label>Alamat</Label>
            <Input {...register('address')} placeholder="Jl. Sudirman No. 1, Jakarta" className="mt-1" />
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

export default AddEditClientDialog;
