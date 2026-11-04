import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { costOperationsAPI, operationalCostTypesAPI } from '@/api/endpoints';
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
import { costOperationSchema } from '@/utils/validations/CostOperation';
import { useToast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { Save, Loader2 } from 'lucide-react';
import type { z } from 'zod';
import type { CostOperation } from '@/types';

export type CostOperationFormValues = z.infer<typeof costOperationSchema>;

export interface AddEditCostOperationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Cost operation to edit; undefined when creating. */
  editingItem?: CostOperation;
  /** Called with `shouldRefresh` after successful save. */
  onFinish: (shouldRefresh: boolean) => void;
}

const toFormValues = (item?: CostOperation): CostOperationFormValues => ({
  operational_cost_type_id: item?.operational_cost_type_id ?? '',
  tanggal_transaksi: item?.tanggal_transaksi ?? '',
  deskripsi: item?.deskripsi ?? '',
  jumlah: item?.jumlah ?? 0,
});

const AddEditCostOperationDialog = ({
  isOpen,
  onClose,
  editingItem,
  onFinish,
}: AddEditCostOperationDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: costTypes } = useQuery({
    queryKey: ['operational-cost-types-all'],
    queryFn: () => operationalCostTypesAPI.getAll({ all: true }),
    select: (res) => res.data?.operational_cost_types ?? [],
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CostOperationFormValues>({
    resolver: zodResolver(costOperationSchema),
    defaultValues: toFormValues(editingItem),
  });

  useEffect(() => {
    reset(toFormValues(editingItem));
  }, [editingItem, isOpen, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: CostOperationFormValues) =>
      editingItem?.id
        ? costOperationsAPI.update(editingItem.id, data)
        : costOperationsAPI.create(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Beban operasional ${editingItem ? 'berhasil diperbarui' : 'berhasil ditambahkan'}.`,
        variant: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['cost-operations'] });
      onFinish(true);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: getErrorMessage(err, 'Gagal menyimpan beban operasional.'),
        variant: 'destructive',
      });
    },
  });

  const options = (costTypes ?? []).map((t) => ({ value: t.id, label: t.nama_biaya }));
  const isBusy = saveMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Ubah Beban Operasional' : 'Tambah Beban Operasional'}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => saveMutation.mutate(data))}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
        >
          <div>
            <Label>Jenis Beban Operasional</Label>
            <Controller
              name="operational_cost_type_id"
              control={control}
              render={({ field }) => (
                <Select
                  options={options}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Pilih..."
                  className="mt-1"
                />
              )}
            />
            {errors.operational_cost_type_id && (
              <p className="text-red-500 text-xs mt-1">{errors.operational_cost_type_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tanggal Transaksi</Label>
              <Input type="date" {...register('tanggal_transaksi')} className="mt-1" />
              {errors.tanggal_transaksi && (
                <p className="text-red-500 text-xs mt-1">{errors.tanggal_transaksi.message}</p>
              )}
            </div>
            <div>
              <Label>Jumlah</Label>
              <CurrencyInput control={control} name="jumlah" placeholder="Rp 0" className="mt-1" />
              {errors.jumlah && <p className="text-red-500 text-xs mt-1">{errors.jumlah.message}</p>}
            </div>
          </div>

          <div>
            <Label>
              Deskripsi <span className="text-slate-400 text-xs">(opsional)</span>
            </Label>
            <Input {...register('deskripsi')} className="mt-1" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isBusy} className="bg-green-600 hover:bg-green-700">
              {isBusy ? (
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

export default AddEditCostOperationDialog;
