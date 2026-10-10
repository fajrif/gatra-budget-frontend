import React, { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { countriesAPI } from '@/api/endpoints';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { countrySchema } from '@/utils/validations/Country';
import { useToast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { Save, Loader2 } from 'lucide-react';
import type { z } from 'zod';

export type CountryFormValues = z.infer<typeof countrySchema>;

export interface AddEditCountryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Country to edit; undefined when creating. */
  editingItem?: CountryFormValues & { id?: string };
  /** Called with `shouldRefresh` after successful save. */
  onFinish: (shouldRefresh: boolean) => void;
}

const AddEditCountryDialog = ({
  isOpen,
  onClose,
  editingItem,
  onFinish,
}: AddEditCountryDialogProps) => {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CountryFormValues>({
    resolver: zodResolver(countrySchema),
    defaultValues: editingItem || { name: '', code: '' },
  });

  useEffect(() => {
    reset(editingItem || { name: '', code: '' });
  }, [editingItem, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: CountryFormValues) =>
      editingItem?.id ? countriesAPI.update(editingItem.id, data) : countriesAPI.create(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Negara ${editingItem ? 'berhasil diperbarui' : 'berhasil ditambahkan'}.`,
        variant: 'success',
      });
      onFinish(true);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: getErrorMessage(err, 'Gagal menyimpan negara.'),
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Ubah Negara' : 'Tambah Negara'}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => saveMutation.mutate(data))}
          className="space-y-4"
        >
          <div>
            <Label>Nama Negara</Label>
            <Input {...register('name')} placeholder="Indonesia" className="mt-1" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label>Kode (ISO 3166-1 alpha-2)</Label>
            <Input
              {...register('code')}
              placeholder="ID"
              maxLength={2}
              className="mt-1 uppercase"
            />
            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
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

export default AddEditCountryDialog;