import React, { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionsAPI, costTypesAPI, projectsAPI } from '@/api/endpoints';
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
import { transactionSchema } from '@/utils/validations/Transaction';
import { useToast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { Save, Loader2 } from 'lucide-react';
import type { z } from 'zod';
import type { Transaction, UUID } from '@/types';

export type TransactionFormValues = z.infer<typeof transactionSchema>;

export interface AddEditTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Locks the Project field when opened from a project's own Transaksi tab. */
  projectId?: UUID;
  /** Transaction to edit; undefined when creating. */
  editingItem?: Transaction;
  /** Called with `shouldRefresh` after successful save. */
  onFinish: (shouldRefresh: boolean) => void;
}

const toFormValues = (projectId: UUID | undefined, item?: Transaction): TransactionFormValues => ({
  project_id: item?.project_id ?? projectId ?? '',
  cost_type_id: item?.cost_type_id ?? '',
  tanggal_transaksi: item?.tanggal_transaksi ?? '',
  deskripsi_realisasi: item?.deskripsi_realisasi ?? '',
  jumlah_realisasi: item?.jumlah_realisasi ?? 0,
  jumlah_tenaga_kerja: item?.jumlah_tenaga_kerja ?? undefined,
});

const AddEditTransactionDialog = ({
  isOpen,
  onClose,
  projectId,
  editingItem,
  onFinish,
}: AddEditTransactionDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: costTypesData } = useQuery({
    queryKey: ['cost-types-all'],
    queryFn: () => costTypesAPI.getAll({ all: true }),
    select: (res) => res.data?.cost_types ?? [],
  });

  // Only needed when the dialog isn't already scoped to a single project.
  const { data: projectsData } = useQuery({
    queryKey: ['projects-all'],
    queryFn: () => projectsAPI.getAll({ all: true }),
    select: (res) => res.data?.projects ?? [],
    enabled: !projectId,
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: toFormValues(projectId, editingItem),
  });

  useEffect(() => {
    reset(toFormValues(projectId, editingItem));
  }, [editingItem, projectId, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: TransactionFormValues) =>
      editingItem?.id
        ? transactionsAPI.update(editingItem.id, data)
        : transactionsAPI.create(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Transaksi ${editingItem ? 'berhasil diperbarui' : 'berhasil ditambahkan'}.`,
        variant: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      onFinish(true);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: getErrorMessage(err, 'Gagal menyimpan transaksi.'),
        variant: 'destructive',
      });
    },
  });

  const mapOptions = (items: { id: string; nama_biaya?: string; judul_pekerjaan?: string }[] = []) =>
    items.map((i) => ({ value: i.id, label: i.nama_biaya ?? i.judul_pekerjaan ?? '' }));

  const isBusy = saveMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Ubah Transaksi' : 'Tambah Transaksi'}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => saveMutation.mutate(data))}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
        >
          {!projectId && (
            <div>
              <Label>Proyek</Label>
              <Controller
                name="project_id"
                control={control}
                render={({ field }) => (
                  <Select
                    options={mapOptions(projectsData)}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pilih..."
                    className="mt-1"
                  />
                )}
              />
              {errors.project_id && (
                <p className="text-red-500 text-xs mt-1">{errors.project_id.message}</p>
              )}
            </div>
          )}

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
            <Label>Tanggal Transaksi</Label>
            <Input type="date" {...register('tanggal_transaksi')} className="mt-1" />
            {errors.tanggal_transaksi && (
              <p className="text-red-500 text-xs mt-1">{errors.tanggal_transaksi.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Jumlah Realisasi</Label>
              <CurrencyInput
                control={control}
                name="jumlah_realisasi"
                placeholder="Rp 0"
                className="mt-1"
              />
              {errors.jumlah_realisasi && (
                <p className="text-red-500 text-xs mt-1">{errors.jumlah_realisasi.message}</p>
              )}
            </div>
            <div>
              <Label>
                Jumlah Tenaga Kerja <span className="text-slate-400 text-xs">(opsional)</span>
              </Label>
              <Controller
                name="jumlah_tenaga_kerja"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    min={0}
                    className="mt-1"
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                    }
                  />
                )}
              />
            </div>
          </div>

          <div>
            <Label>
              Deskripsi <span className="text-slate-400 text-xs">(opsional)</span>
            </Label>
            <Input {...register('deskripsi_realisasi')} className="mt-1" />
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

export default AddEditTransactionDialog;
