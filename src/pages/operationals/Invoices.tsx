import { useState, useMemo, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesAPI } from '@/api/endpoints';
import { AgGridReact } from 'ag-grid-react';
import { appTheme } from '@/lib/agGridTheme';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AboutCard from '@/components/ui/AboutCard';
import { Button } from '@/components/ui/button';
import { Plus, Upload, FileText } from 'lucide-react';
import ImportExcelDialog from '@/components/dialogs/operationals/ImportExcelDialog';
import { useToast } from '@/components/ui/use-toast';
import AddEditInvoiceDialog from '@/components/dialogs/operationals/AddEditInvoiceDialog';
import { createInvoicesColumnDefs, defaultColDef } from '@/config/invoicesGridColumns';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { Invoice } from '@/types';

const Invoices = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const gridRef = useRef<AgGridReact | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingItem, setEditingItem] = useState<Invoice | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesAPI.getAll({ all: true }),
    select: (res) => res.data?.invoices ?? [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => invoicesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
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

  // ActionMenuCellRenderer already confirms destructive actions before calling
  // onDelete, so this just performs the mutation.
  const handleDelete = useCallback(
    (row: Invoice) => {
      deleteMutation.mutate(row.id);
    },
    [deleteMutation],
  );

  const columnDefs = useMemo(
    () =>
      createInvoicesColumnDefs({
        onEdit: (row: Invoice) => {
          setEditingItem(row);
          setShowDialog(true);
        },
        onDelete: handleDelete,
      }),
    [handleDelete],
  );

  const finishSubmit = (shouldRefresh: boolean) => {
    if (shouldRefresh) queryClient.invalidateQueries({ queryKey: ['invoices'] });
    setShowDialog(false);
    setEditingItem(null);
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Invoice</h1>
            <p className="text-slate-500 mt-1">Tagihan di seluruh proyek</p>
          </div>
        </div>
        <AboutCard icon={FileText} title="Tentang Invoice" storageKey="invoice_card">
          <p className="text-sm text-slate-700 mb-3">
            Seluruh tagihan proyek. Penerimaan pembayaran per bulan dapat dilihat di Laporan Bulanan.
          </p>
          <div className="space-y-1 text-sm text-slate-600">
            <p>
              • <strong className="font-semibold">No. Invoice:</strong> nomor tagihan, harus unik
            </p>
            <p>
              • <strong className="font-semibold">Proyek:</strong> proyek yang ditagihkan
            </p>
            <p>
              • <strong className="font-semibold">Nama Invoice:</strong> judul tagihan
            </p>
            <p>
              • <strong className="font-semibold">Tanggal Tagihan:</strong> tanggal tagihan diterbitkan
            </p>
            <p>
              • <strong className="font-semibold">Status:</strong> Submit = sudah ditagihkan; Clearing = sudah dibayar
            </p>
            <p>
              • <strong className="font-semibold">Tanggal Bayar:</strong> tanggal pembayaran diterima; wajib diisi saat status Clearing, kosong saat Submit
            </p>
            <p>
              • <strong className="font-semibold">Nilai:</strong> nominal tagihan
            </p>
            <p>
              • <strong className="font-semibold">Manajemen Fee:</strong> nominal fee tetap yang diinput manual, tidak boleh melebihi Nilai; dijumlahkan per proyek sebagai profit margin
            </p>
            <p>
              • <strong className="font-semibold">Deskripsi:</strong> keterangan tambahan (opsional)
            </p>
            <p>
              • <strong className="font-semibold">Import Excel:</strong> unduh template, isi, lalu import; proyek dirujuk lewat No SP2K; No Invoice yang sudah ada diperbarui; tidak ada yang tersimpan bila ada kesalahan
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
              <Button onClick={() => setShowDialog(true)} className="bg-blue-900 hover:bg-blue-800">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Invoice
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">Memuat...</div>
            ) : (data?.length ?? 0) === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Belum ada invoice. Tambahkan invoice pertama Anda.
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

      <AddEditInvoiceDialog
        isOpen={showDialog}
        onClose={() => finishSubmit(false)}
        editingItem={editingItem ?? undefined}
        onFinish={finishSubmit}
      />

      <ImportExcelDialog
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        kind="invoices"
        onImported={() => queryClient.invalidateQueries({ queryKey: ['invoices'] })}
      />
    </div>
  );
};

export default Invoices;
