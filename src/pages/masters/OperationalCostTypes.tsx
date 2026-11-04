import { useState, useMemo, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { operationalCostTypesAPI } from '@/api/endpoints';
import { AgGridReact } from 'ag-grid-react';
import { appTheme } from '@/lib/agGridTheme';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AboutCard from '@/components/ui/AboutCard';
import { Button } from '@/components/ui/button';
import { Plus, Building2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import AddEditOperationalCostTypeDialog from '@/components/dialogs/masters/AddEditOperationalCostTypeDialog';
import { createOperationalCostTypesColumnDefs, defaultColDef } from '@/config/operationalCostTypesGridColumns';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { OperationalCostType } from '@/types';

const OperationalCostTypes = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const gridRef = useRef<AgGridReact | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<OperationalCostType | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['operational-cost-types'],
    queryFn: () => operationalCostTypesAPI.getAll({ all: true }),
    select: (res) => res.data?.operational_cost_types ?? [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => operationalCostTypesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operational-cost-types'] });
      toast({ title: 'Success', description: 'Jenis beban operasional berhasil dihapus.', variant: 'success' });
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: getErrorMessage(err, 'Gagal menghapus jenis beban operasional.'),
        variant: 'destructive',
      });
    },
  });

  // ActionMenuCellRenderer already confirms destructive actions before calling
  // onDelete, so this just performs the mutation.
  const handleDelete = useCallback(
    (row: OperationalCostType) => {
      deleteMutation.mutate(row.id);
    },
    [deleteMutation],
  );

  const columnDefs = useMemo(
    () =>
      createOperationalCostTypesColumnDefs({
        onEdit: (row: OperationalCostType) => {
          setEditingItem(row);
          setShowDialog(true);
        },
        onDelete: handleDelete,
      }),
    [handleDelete],
  );

  const finishSubmit = (shouldRefresh: boolean) => {
    if (shouldRefresh) queryClient.invalidateQueries({ queryKey: ['operational-cost-types'] });
    setShowDialog(false);
    setEditingItem(null);
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Jenis Beban Operasional</h1>
            <p className="text-slate-500 mt-1">Kelola kategori pengeluaran di luar proyek</p>
          </div>
        </div>
        <AboutCard icon={Building2} title="Tentang Jenis Beban Operasional">
          <p className="text-sm text-slate-700 mb-3">
            Data master kategori Beban Operasional (biaya kantor, konsumsi, dan sejenisnya). Terpisah dari Jenis Biaya yang dipakai Transaksi Proyek.
          </p>
        </AboutCard>
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <div className="flex justify-end items-center">
              <Button
                onClick={() => setShowDialog(true)}
                className="bg-blue-900 hover:bg-blue-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Jenis Beban Operasional
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">Memuat...</div>
            ) : (data?.length ?? 0) === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Belum ada jenis beban operasional. Tambahkan jenis beban operasional pertama Anda.
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

      <AddEditOperationalCostTypeDialog
        isOpen={showDialog}
        onClose={() => finishSubmit(false)}
        editingItem={editingItem ?? undefined}
        onFinish={finishSubmit}
      />
    </div>
  );
};

export default OperationalCostTypes;
