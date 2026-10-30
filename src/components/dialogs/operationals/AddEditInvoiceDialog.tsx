import React, { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invoicesAPI, projectsAPI } from '@/api/endpoints';
import { useForm, Controller, useWatch } from 'react-hook-form';
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
import { invoiceSchema } from '@/utils/validations/Invoice';
import { useToast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { Save, Loader2 } from 'lucide-react';
import type { z } from 'zod';
import type { Invoice, UUID } from '@/types';

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export interface AddEditInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Locks the Project field when opened from a project's own Invoice tab. */
  projectId?: UUID;
  /** Invoice to edit; undefined when creating. */
  editingItem?: Invoice;
  /** Called with `shouldRefresh` after successful save. */
  onFinish: (shouldRefresh: boolean) => void;
}

const statusOptions = [
  { value: 'Submit', label: 'Submit' },
  { value: 'Clearing', label: 'Clearing (sudah dibayar)' },
];

const toFormValues = (projectId: UUID | undefined, item?: Invoice): InvoiceFormValues => ({
  no_invoice: item?.no_invoice ?? '',
  project_id: item?.project_id ?? projectId ?? '',
  nama_invoice: item?.nama_invoice ?? '',
  tgl_tagihan: item?.tgl_tagihan ?? '',
  tgl_bayar: item?.tgl_bayar ?? '',
  status: item?.status ?? 'Submit',
  nilai: item?.nilai ?? 0,
  description: item?.description ?? '',
  manajemen_fee: item?.manajemen_fee ?? 0,
});

const AddEditInvoiceDialog = ({
  isOpen,
  onClose,
  projectId,
  editingItem,
  onFinish,
}: AddEditInvoiceDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    setValue,
    formState: { errors },
    reset,
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: toFormValues(projectId, editingItem),
  });

  useEffect(() => {
    reset(toFormValues(projectId, editingItem));
  }, [editingItem, projectId, reset]);

  const status = useWatch({ control, name: 'status' });

  // tgl_bayar only exists for a paid invoice; the server rejects it on Submit.
  useEffect(() => {
    if (status === 'Submit') setValue('tgl_bayar', '');
  }, [status, setValue]);

  const saveMutation = useMutation({
    mutationFn: (data: InvoiceFormValues) => {
      const payload = {
        ...data,
        tgl_bayar: data.status === 'Clearing' ? data.tgl_bayar || undefined : undefined,
        description: data.description || undefined,
      };
      return editingItem?.id
        ? invoicesAPI.update(editingItem.id, payload)
        : invoicesAPI.create(payload);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Invoice ${editingItem ? 'berhasil diperbarui' : 'berhasil ditambahkan'}.`,
        variant: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      onFinish(true);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: getErrorMessage(err, 'Gagal menyimpan invoice.'),
        variant: 'destructive',
      });
    },
  });

  const projectOptions = (projectsData ?? []).map((p) => ({ value: p.id, label: p.judul_pekerjaan }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Ubah Invoice' : 'Tambah Invoice'}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => saveMutation.mutate(data))}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>No. Invoice</Label>
              <Input {...register('no_invoice')} placeholder="INV-001" className="mt-1" />
              {errors.no_invoice && (
                <p className="text-red-500 text-xs mt-1">{errors.no_invoice.message}</p>
              )}
            </div>
            {!projectId && (
              <div>
                <Label>Proyek</Label>
                <Controller
                  name="project_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={projectOptions}
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
          </div>

          <div>
            <Label>Nama Invoice</Label>
            <Input {...register('nama_invoice')} placeholder="Tagihan Termin 1" className="mt-1" />
            {errors.nama_invoice && (
              <p className="text-red-500 text-xs mt-1">{errors.nama_invoice.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    options={statusOptions}
                    value={field.value}
                    onChange={field.onChange}
                    className="mt-1"
                  />
                )}
              />
            </div>
            <div>
              <Label>Tanggal Tagihan</Label>
              <Input type="date" {...register('tgl_tagihan')} className="mt-1" />
              {errors.tgl_tagihan && (
                <p className="text-red-500 text-xs mt-1">{errors.tgl_tagihan.message}</p>
              )}
            </div>
            <div>
              <Label>Tanggal Bayar</Label>
              <Input
                type="date"
                {...register('tgl_bayar')}
                disabled={status !== 'Clearing'}
                className="mt-1"
              />
              {errors.tgl_bayar && (
                <p className="text-red-500 text-xs mt-1">{errors.tgl_bayar.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nilai</Label>
              <CurrencyInput control={control} name="nilai" placeholder="Rp 0" className="mt-1" />
              {errors.nilai && <p className="text-red-500 text-xs mt-1">{errors.nilai.message}</p>}
            </div>
            <div>
              <Label>Manajemen Fee</Label>
              <CurrencyInput control={control} name="manajemen_fee" placeholder="Rp 0" className="mt-1" />
              {errors.manajemen_fee && (
                <p className="text-red-500 text-xs mt-1">{errors.manajemen_fee.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label>
              Deskripsi <span className="text-slate-400 text-xs">(opsional)</span>
            </Label>
            <Input {...register('description')} className="mt-1" />
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

export default AddEditInvoiceDialog;
