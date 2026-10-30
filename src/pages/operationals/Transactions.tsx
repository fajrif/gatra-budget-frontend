import { useState, useMemo, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsAPI } from '@/api/endpoints';
import { AgGridReact } from 'ag-grid-react';
import { appTheme } from '@/lib/agGridTheme';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AboutCard from '@/components/ui/AboutCard';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Receipt } from 'lucide-react';
import ImportExcelDialog from '@/components/dialogs/operationals/ImportExcelDialog';
import { useToast } from '@/components/ui/use-toast';
import AddEditTransactionDialog from '@/components/dialogs/operationals/AddEditTransactionDialog';
import { createTransactionsColumnDefs, defaultColDef } from '@/config/transactionsGridColumns';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { Transaction } from '@/types';

const Transactions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const gridRef = useRef<AgGridReact | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingItem, setEditingItem] = useState<Transaction | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionsAPI.getAll({ all: true }),
    select: (res) => res.data?.transactions ?? [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
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

  // ActionMenuCellRenderer already confirms destructive actions before calling
  // onDelete, so this just performs the mutation.
  const handleDelete = useCallback(
    (row: Transaction) => {
      deleteMutation.mutate(row.id);
    },
    [deleteMutation],
  );

  const columnDefs = useMemo(
    () =>
      createTransactionsColumnDefs({
        onEdit: (row: Transaction) => {
          setEditingItem(row);
          setShowDialog(true);
        },
        onDelete: handleDelete,
      }),
    [handleDelete],
  );

  const finishSubmit = (shouldRefresh: boolean) => {
    if (shouldRefresh) queryClient.invalidateQueries({ queryKey: ['transactions'] });
    setShowDialog(false);
    setEditingItem(null);
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Transaksi</h1>
            <p className="text-slate-500 mt-1">Realisasi pengeluaran di seluruh proyek</p>
          </div>
        </div>
        <AboutCard icon={Receipt} title="Tentang Transaksi" storageKey="transaction_card">
          <p className="text-sm text-slate-700 mb-3">
            Seluruh pengeluaran proyek. Total pengeluaran per bulan dapat dilihat di Laporan Bulanan.
          </p>
          <div className="space-y-1 text-sm text-slate-600">
            <p>
              • <strong className="font-semibold">Proyek:</strong> proyek yang menanggung pengeluaran ini
            </p>
            <p>
              • <strong className="font-semibold">Jenis Biaya:</strong> kategori pengeluaran, referensi ke data master
            </p>
            <p>
              • <strong className="font-semibold">Tanggal Transaksi:</strong> tanggal pengeluaran; menentukan bulan pada laporan bulanan
            </p>
            <p>
              • <strong className="font-semibold">Jumlah Realisasi:</strong> nominal pengeluaran, harus lebih dari Rp 100.000
            </p>
            <p>
              • <strong className="font-semibold">Jumlah Tenaga Kerja:</strong> jumlah tenaga kerja terkait pengeluaran (opsional)
            </p>
            <p>
              • <strong className="font-semibold">Deskripsi:</strong> keterangan tambahan (opsional)
            </p>
            <p>
              • <strong className="font-semibold">Import Excel:</strong> unduh template, isi, lalu import; proyek dirujuk lewat No SP2K, jenis biaya lewat nama; tiap baris membuat transaksi baru, jadi jangan import file yang sama dua kali
            </p>
          </div>
        </AboutCard>
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <div className="flex justify-end items-center gap-2">
              <Button variant="outline" onClick={() => setShowImport(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Import Excel
              </Button>
              <Button
                onClick={() => setShowDialog(true)}
                className="bg-blue-900 hover:bg-blue-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Transaksi
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">Memuat...</div>
            ) : (data?.length ?? 0) === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Belum ada transaksi. Tambahkan transaksi pertama Anda.
              </div>
            ) : (
              <div className="ag-grid-wrapper" style={{ height: 500, width: '100%' }}>
                <AgGridReact
                  theme={appTheme}
                  ref={gridRef}
                  rowData={data ?? []}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  getRowId={(params) => params.data.id}
                  pagination
                  paginationPageSize={20}
                  paginationPageSizeSelector={[20, 50, 100]}
                  animateRows
                  suppressCellFocus
                  tooltipShowDelay={200}
                  tooltipHideDelay={2000}
                  overlayNoRowsTemplate="<span>Tidak ada data.</span>"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddEditTransactionDialog
        isOpen={showDialog}
        onClose={() => finishSubmit(false)}
        editingItem={editingItem ?? undefined}
        onFinish={finishSubmit}
      />

      <ImportExcelDialog
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        kind="transactions"
        onImported={() => queryClient.invalidateQueries({ queryKey: ['transactions'] })}
      />
    </div>
  );
};

export default Transactions;
