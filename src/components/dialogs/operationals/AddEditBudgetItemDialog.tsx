import React, { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { budgetItemsAPI, costTypesAPI } from '@/api/endpoints';
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
import { budgetItemSchema } from '@/utils/validations/BudgetItem';
import { useToast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { Save, Loader2 } from 'lucide-react';
import type { z } from 'zod';
import type { BudgetItem, UUID } from '@/types';

export type BudgetItemFormValues = z.infer<typeof budgetItemSchema>;

export interface AddEditBudgetItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: UUID;
  /** Parent budget item to edit; undefined when creating. */
  editingItem?: BudgetItem;
  /** Called with `shouldRefresh` after successful save. */
  onFinish: (shouldRefresh: boolean) => void;
}

const kategoriOptions = [
  { value: 'lumpsum', label: 'Lumpsum' },
  { value: 'monthly', label: 'Bulanan (dibagi rata selama durasi proyek)' },
];

const toFormValues = (item?: BudgetItem): BudgetItemFormValues => ({
  cost_type_id: item?.cost_type_id ?? '',
  kategori_anggaran: item?.kategori_anggaran ?? 'lumpsum',
  total_anggaran: item?.total_anggaran ?? 0,
  deskripsi_anggaran: item?.deskripsi_anggaran ?? '',
});

const AddEditBudgetItemDialog = ({
  isOpen,
  onClose,
  projectId,
  editingItem,
  onFinish,
}: AddEditBudgetItemDialogProps) => {
  const { toast } = useToast();

  const { data: costTypesData } = useQuery({
    queryKey: ['cost-types-all'],
    queryFn: () => costTypesAPI.getAll({ all: true }),
    select: (res) => res.data?.cost_types ?? [],
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BudgetItemFormValues>({
    resolver: zodResolver(budgetItemSchema),
    defaultValues: toFormValues(editingItem),
  });

  useEffect(() => {
    reset(toFormValues(editingItem));
  }, [editingItem, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: BudgetItemFormValues) => {
      const payload = { project_id: projectId, ...data };
      return editingItem?.id
        ? budgetItemsAPI.update(editingItem.id, payload)
        : budgetItemsAPI.create(payload);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Item anggaran ${editingItem ? 'berhasil diperbarui' : 'berhasil ditambahkan'}.`,
        variant: 'success',
      });
      onFinish(true);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: getErrorMessage(err, 'Gagal menyimpan item anggaran.'),
        variant: 'destructive',
      });
    },
  });

  const mapOptions = (items: { id: string; nama_biaya: string }[] = []) =>
    items.map((i) => ({ value: i.id, label: i.nama_biaya }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Ubah Item Anggaran' : 'Tambah Item Anggaran'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
          <div>
            <Label>Jenis Biaya</Label>
            <Controller
              name="cost_type_id"
              control={control}
              render={({ field }) => (
                <Select
                  options={mapOptions(costTypesData)}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Pilih..."
                  className="mt-1"
                />
              )}
            />
            {errors.cost_type_id && (
              <p className="text-red-500 text-xs mt-1">{errors.cost_type_id.message}</p>
            )}
          </div>

          <div>
            <Label>Kategori Anggaran</Label>
            <Controller
              name="kategori_anggaran"
              control={control}
              render={({ field }) => (
                <Select
                  options={kategoriOptions}
                  value={field.value}
                  onChange={field.onChange}
                  className="mt-1"
                />
              )}
            />
            {errors.kategori_anggaran && (
              <p className="text-red-500 text-xs mt-1">{errors.kategori_anggaran.message}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Bulanan membagi total secara merata selama durasi proyek dalam bulan; lumpsum
              menyimpannya sebagai satu jumlah.
            </p>
          </div>

          <div>
            <Label>Total Anggaran</Label>
            <CurrencyInput control={control} name="total_anggaran" placeholder="Rp 0" className="mt-1" />
            {errors.total_anggaran && (
              <p className="text-red-500 text-xs mt-1">{errors.total_anggaran.message}</p>
            )}
          </div>

          <div>
            <Label>
              Deskripsi <span className="text-slate-400 text-xs">(opsional)</span>
            </Label>
            <Input {...register('deskripsi_anggaran')} className="mt-1" />
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

export default AddEditBudgetItemDialog;
