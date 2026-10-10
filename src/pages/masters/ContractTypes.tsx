import { useState, useMemo, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractTypesAPI } from '@/api/endpoints';
import { AgGridReact } from 'ag-grid-react';
import { appTheme } from '@/lib/agGridTheme';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import AddEditContractTypeDialog from '@/components/dialogs/masters/AddEditContractTypeDialog';
import { createContractTypesColumnDefs, defaultColDef } from '@/config/contractTypesGridColumns';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { ContractType } from '@/types';

const ContractTypes = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const gridRef = useRef<AgGridReact | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ContractType | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['contract-types'],
    queryFn: () => contractTypesAPI.getAll({ all: true }),
    select: (res) => res.data?.contract_types ?? [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contractTypesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-types'] });
      toast({ title: 'Success', description: 'Jenis kontrak berhasil dihapus.', variant: 'success' });
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: getErrorMessage(err, 'Gagal menghapus jenis kontrak.'),
        variant: 'destructive',
      });
    },
  });

  // ActionMenuCellRenderer already confirms destructive actions before calling
  // onDelete, so this just performs the mutation.
  const handleDelete = useCallback(
    (row: ContractType) => {
      deleteMutation.mutate(row.id);
    },
    [deleteMutation],
  );

  const columnDefs = useMemo(
    () =>
      createContractTypesColumnDefs({
        onEdit: (row: ContractType) => {
          setEditingItem(row);
          setShowDialog(true);
        },
        onDelete: handleDelete,
      }),
    [handleDelete],
  );

  const finishSubmit = (shouldRefresh: boolean) => {
    if (shouldRefresh) queryClient.invalidateQueries({ queryKey: ['contract-types'] });
    setShowDialog(false);
    setEditingItem(null);
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Jenis Kontrak</h1>
            <p className="text-slate-500 mt-1">Kelola data master jenis kontrak</p>
          </div>
        </div>
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Tentang Jenis Kontrak</h3>
                <p className="text-sm text-slate-700 mb-3">
                  Data master jenis kontrak yang dirujuk oleh proyek (mis. PO / Non-PO).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <div className="flex justify-end items-center">
              <Button
                onClick={() => setShowDialog(true)}
                className="bg-blue-900 hover:bg-blue-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Jenis Kontrak
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">Memuat...</div>
            ) : (data?.length ?? 0) === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Belum ada jenis kontrak. Tambahkan jenis kontrak pertama Anda.
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

      <AddEditContractTypeDialog
        isOpen={showDialog}
        onClose={() => finishSubmit(false)}
        editingItem={editingItem ?? undefined}
        onFinish={finishSubmit}
      />
    </div>
  );
};

export default ContractTypes;
