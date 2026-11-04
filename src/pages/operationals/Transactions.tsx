import { useState, useMemo, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsAPI, costOperationsAPI } from '@/api/endpoints';
import { AgGridReact } from 'ag-grid-react';
import { appTheme } from '@/lib/agGridTheme';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AboutCard from '@/components/ui/AboutCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Upload, Receipt } from 'lucide-react';
import ImportExcelDialog from '@/components/dialogs/operationals/ImportExcelDialog';
import { useToast } from '@/components/ui/use-toast';
import AddEditTransactionDialog from '@/components/dialogs/operationals/AddEditTransactionDialog';
import AddEditCostOperationDialog from '@/components/dialogs/operationals/AddEditCostOperationDialog';
import SelectTransactionTypeDialog, {
  type TransactionKind,
} from '@/components/dialogs/operationals/SelectTransactionTypeDialog';
import { createTransactionsColumnDefs, defaultColDef } from '@/config/transactionsGridColumns';
import { createCostOperationsColumnDefs } from '@/config/costOperationsGridColumns';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { CostOperation, Transaction } from '@/types';

const Transactions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const gridRef = useRef<AgGridReact | null>(null);
  const [tab, setTab] = useState<TransactionKind>('project');
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showOperationalDialog, setShowOperationalDialog] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showOperationalImport, setShowOperationalImport] = useState(false);
  const [editingItem, setEditingItem] = useState<Transaction | null>(null);
  const [editingOperational, setEditingOperational] = useState<CostOperation | null>(null);

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

  const { data: operationalData, isLoading: operationalLoading } = useQuery({
    queryKey: ['cost-operations'],
    queryFn: () => costOperationsAPI.getAll({ all: true }),
    select: (res) => res.data?.cost_operations ?? [],
  });

  const deleteOperationalMutation = useMutation({
    mutationFn: (id: string) => costOperationsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-operations'] });
      toast({ title: 'Success', description: 'Beban operasional berhasil dihapus.', variant: 'success' });
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: getErrorMessage(err, 'Gagal menghapus beban operasional.'),
        variant: 'destructive',
      });
    },
  });

  const handleDeleteOperational = useCallback(
    (row: CostOperation) => {
      deleteOperationalMutation.mutate(row.id);
    },
    [deleteOperationalMutation],
  );

  const operationalColumnDefs = useMemo(
    () =>
      createCostOperationsColumnDefs({
        onEdit: (row: CostOperation) => {
          setEditingOperational(row);
          setShowOperationalDialog(true);
        },
        onDelete: handleDeleteOperational,
      }),
    [handleDeleteOperational],
  );

  const handleSelectKind = (kind: TransactionKind) => {
    setShowTypePicker(false);
    setTab(kind);
    if (kind === 'project') {
      setEditingItem(null);
      setShowDialog(true);
    } else {
      setEditingOperational(null);
      setShowOperationalDialog(true);
    }
  };

  const finishOperationalSubmit = (shouldRefresh: boolean) => {
    if (shouldRefresh) queryClient.invalidateQueries({ queryKey: ['cost-operations'] });
    setShowOperationalDialog(false);
    setEditingOperational(null);
  };

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
            <p className="text-slate-500 mt-1">Pengeluaran proyek dan beban operasional</p>
          </div>
        </div>
        <AboutCard icon={Receipt} title="Tentang Transaksi" storageKey="transaction_card">
          <p className="text-sm text-slate-700 mb-3">
            Seluruh pengeluaran. Tab Proyek berisi pengeluaran yang dibebankan ke proyek; tab Beban
            Operasional berisi pengeluaran di luar proyek (biaya kantor, konsumsi, dan sejenisnya).
            Total pengeluaran per bulan dapat dilihat di Laporan Tahunan.
          </p>
          <div className="space-y-1 text-sm text-slate-600">
            <p>
              • <strong className="font-semibold">Proyek:</strong> proyek yang menanggung pengeluaran ini
            </p>
            <p>
              • <strong className="font-semibold">Jenis Biaya:</strong> kategori pengeluaran, referensi ke data master
            </p>
            <p>
              • <strong className="font-semibold">Tanggal Transaksi:</strong> tanggal pengeluaran; menentukan bulan pada laporan tahunan
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
              • <strong className="font-semibold">Beban Operasional:</strong> tidak terkait proyek, memakai Jenis Beban Operasional (data master terpisah); tidak memengaruhi sisa anggaran atau absorpsi proyek
            </p>
            <p>
              • <strong className="font-semibold">Import Excel:</strong> unduh template, isi, lalu import; proyek dirujuk lewat No SP2K, jenis biaya lewat nama; tiap baris membuat transaksi baru, jadi jangan import file yang sama dua kali. Tab Beban Operasional punya template sendiri (jenis beban lewat nama, tanpa proyek)
            </p>
          </div>
        </AboutCard>
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <div className="flex justify-end items-center gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  tab === 'project' ? setShowImport(true) : setShowOperationalImport(true)
                }
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Excel
              </Button>
              <Button
                onClick={() => setShowTypePicker(true)}
                className="bg-blue-900 hover:bg-blue-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Transaksi
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs value={tab} onValueChange={(v) => setTab(v as TransactionKind)}>
              <TabsList>
                <TabsTrigger value="project">Proyek</TabsTrigger>
                <TabsTrigger value="operational">Beban Operasional</TabsTrigger>
              </TabsList>
              <TabsContent value="project" className="mt-4">
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
              </TabsContent>
              <TabsContent value="operational" className="mt-4">
                {operationalLoading ? (
                  <div className="text-center py-8">Memuat...</div>
                ) : (operationalData?.length ?? 0) === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    Belum ada beban operasional. Tambahkan beban operasional pertama Anda.
                  </div>
                ) : (
                  <div className="ag-grid-wrapper" style={{ height: 500, width: '100%' }}>
                    <AgGridReact
                      theme={appTheme}
                      rowData={operationalData ?? []}
                      columnDefs={operationalColumnDefs}
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <SelectTransactionTypeDialog
        isOpen={showTypePicker}
        onClose={() => setShowTypePicker(false)}
        onSelect={handleSelectKind}
      />

      <AddEditCostOperationDialog
        isOpen={showOperationalDialog}
        onClose={() => finishOperationalSubmit(false)}
        editingItem={editingOperational ?? undefined}
        onFinish={finishOperationalSubmit}
      />

      <AddEditTransactionDialog
        isOpen={showDialog}
        onClose={() => finishSubmit(false)}
        editingItem={editingItem ?? undefined}
        onFinish={finishSubmit}
      />

      <ImportExcelDialog
        isOpen={showOperationalImport}
        onClose={() => setShowOperationalImport(false)}
        kind="cost_operations"
        onImported={() => queryClient.invalidateQueries({ queryKey: ['cost-operations'] })}
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
