import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsAPI } from '@/api/endpoints';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/components/ui/use-toast';
import AddEditTransactionDialog from '@/components/dialogs/operationals/AddEditTransactionDialog';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { formatRupiah, formatDate } from '@/utils/formatters';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Transaction, UUID } from '@/types';

export interface TransactionsPanelProps {
  projectId: UUID;
}

const TransactionsPanel = ({ projectId }: TransactionsPanelProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Transaction | null>(null);

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', { project_id: projectId }],
    queryFn: () => transactionsAPI.getAll({ project_id: projectId, all: true }),
    select: (res) => res.data?.transactions ?? [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', { project_id: projectId }] });
      toast({ title: 'Success', description: 'Transaksi berhasil dihapus.', variant: 'success' });
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: getErrorMessage(err, 'Gagal menghapus transaksi.'),
        variant: 'destructive',
      });
    },
  });

  const handleDelete = async (t: Transaction) => {
    const ok = await confirm({
      message: `Hapus transaksi sebesar ${formatRupiah(t.jumlah_realisasi)} pada ${formatDate(t.tanggal_transaksi)}?`,
      variant: 'danger',
    });
    if (ok) deleteMutation.mutate(t.id);
  };

  const finishSubmit = (shouldRefresh: boolean) => {
    if (shouldRefresh) {
      queryClient.invalidateQueries({ queryKey: ['transactions', { project_id: projectId }] });
    }
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
          Tambah Transaksi
        </Button>
      </div>

      {(transactions?.length ?? 0) === 0 ? (
        <div className="text-center py-12 text-slate-500">
          Belum ada transaksi. Catat pengeluaran pertama untuk proyek ini.
        </div>
      ) : (
        <div className="space-y-2">
          {(transactions ?? []).map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-3 px-4 py-3 bg-white border border-slate-200 rounded-lg"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-slate-900">{formatDate(t.tanggal_transaksi)}</p>
                  <Badge variant="outline" className="text-xs">
                    {t.cost_type?.nama_biaya ?? '-'}
                  </Badge>
                </div>
                {t.deskripsi_realisasi && (
                  <p className="text-xs text-slate-500 truncate mt-0.5">{t.deskripsi_realisasi}</p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="font-medium text-slate-900">{formatRupiah(t.jumlah_realisasi)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingItem(t);
                    setShowDialog(true);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(t)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddEditTransactionDialog
        isOpen={showDialog}
        onClose={() => finishSubmit(false)}
        projectId={projectId}
        editingItem={editingItem ?? undefined}
        onFinish={finishSubmit}
      />
    </div>
  );
};

export default TransactionsPanel;
