import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesAPI } from '@/api/endpoints';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/components/ui/use-toast';
import AddEditInvoiceDialog from '@/components/dialogs/operationals/AddEditInvoiceDialog';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { formatRupiah, formatDate } from '@/utils/formatters';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Invoice, UUID } from '@/types';

export interface InvoicesPanelProps {
  projectId: UUID;
}

const statusClasses: Record<string, string> = {
  Submit: 'bg-amber-100 text-amber-800 border-amber-200',
  Clearing: 'bg-green-100 text-green-800 border-green-200',
};

const InvoicesPanel = ({ projectId }: InvoicesPanelProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Invoice | null>(null);

  const queryKey = ['invoices', { project_id: projectId }];

  const { data: invoices, isLoading } = useQuery({
    queryKey,
    queryFn: () => invoicesAPI.getAll({ project_id: projectId, all: true }),
    select: (res) => res.data?.invoices ?? [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => invoicesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: 'Success', description: 'Invoice berhasil dihapus.', variant: 'success' });
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: getErrorMessage(err, 'Gagal menghapus invoice.'),
        variant: 'destructive',
      });
    },
  });

  const handleDelete = async (inv: Invoice) => {
    const ok = await confirm({ message: `Hapus invoice ${inv.no_invoice}?`, variant: 'danger' });
    if (ok) deleteMutation.mutate(inv.id);
  };

  const finishSubmit = (shouldRefresh: boolean) => {
    if (shouldRefresh) queryClient.invalidateQueries({ queryKey });
    setShowDialog(false);
    setEditingItem(null);
  };

  if (isLoading) {
    return <div className="text-center py-12 text-slate-500">Memuat...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingItem(null);
            setShowDialog(true);
          }}
          className="bg-blue-900 hover:bg-blue-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Invoice
        </Button>
      </div>

      {(invoices?.length ?? 0) === 0 ? (
        <div className="text-center py-12 text-slate-500">
          Belum ada invoice. Catat tagihan pertama untuk proyek ini.
        </div>
      ) : (
        <div className="space-y-2">
          {(invoices ?? []).map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between gap-3 px-4 py-3 bg-white border border-slate-200 rounded-lg"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-slate-900">{inv.no_invoice}</p>
                  <Badge variant="outline" className={`text-xs ${statusClasses[inv.status] ?? ''}`}>
                    {inv.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {inv.nama_invoice} · Tagihan {formatDate(inv.tgl_tagihan)}
                  {inv.tgl_bayar ? ` · Dibayar ${formatDate(inv.tgl_bayar)}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="font-medium text-slate-900">{formatRupiah(inv.nilai)}</p>
                  <p className="text-xs text-slate-500">Fee {formatRupiah(inv.manajemen_fee)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingItem(inv);
                    setShowDialog(true);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(inv)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddEditInvoiceDialog
        isOpen={showDialog}
        onClose={() => finishSubmit(false)}
        projectId={projectId}
        editingItem={editingItem ?? undefined}
        onFinish={finishSubmit}
      />
    </div>
  );
};

export default InvoicesPanel;
