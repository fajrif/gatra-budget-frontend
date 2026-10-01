import { useState, useMemo, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { citiesAPI } from '@/api/endpoints';
import { AgGridReact } from 'ag-grid-react';
import { appTheme } from '@/lib/agGridTheme';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building } from 'lucide-react';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/components/ui/use-toast';
import AddEditCityDialog from '@/components/dialogs/masters/AddEditCityDialog';
import { createCitiesColumnDefs, defaultColDef } from '@/config/citiesGridColumns';

const Cities = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const confirm = useConfirm();
  const gridRef = useRef(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: () => citiesAPI.getAll({ all: true }),
    select: (res) => res.data?.cities ?? [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => citiesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['cities']);
      toast({ title: 'Success', description: 'City deleted.', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.response?.data?.error || 'Failed to delete city.', variant: 'destructive' });
    },
  });

  const handleDelete = useCallback(async (row) => {
    const ok = await confirm({ message: `Delete city "${row.name}"?`, variant: 'danger' });
    if (ok) deleteMutation.mutate(row.id);
  }, [confirm, deleteMutation]);

  const columnDefs = useMemo(() => createCitiesColumnDefs({
    onEdit: (row) => { setEditingItem(row); setShowDialog(true); },
    onDelete: handleDelete,
  }), [handleDelete]);

  const finishSubmit = (shouldRefresh) => {
    if (shouldRefresh) queryClient.invalidateQueries(['cities']);
    setShowDialog(false);
    setEditingItem(null);
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Cities</h1>
            <p className="text-slate-500 mt-1">Manage city reference data</p>
          </div>
        </div>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">About Cities</h3>
                <p className="text-sm text-slate-700 mb-3">City reference data used across the application.</p>
                <div className="space-y-1 text-sm text-slate-600">
                  <p>• <strong className="font-semibold">Name:</strong> City name</p>
                  <p>• <strong className="font-semibold">Province ID:</strong> reference to <code>provinces</code></p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <div className="flex justify-end items-center">
              <Button onClick={() => setShowDialog(true)} className="bg-blue-900 hover:bg-blue-800">
                <Plus className="w-4 h-4 mr-2" />
                Add City
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : data.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No cities yet. Add your first city.
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
                  overlayNoRowsTemplate="<span>No data.</span>"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddEditCityDialog
        isOpen={showDialog}
        onClose={() => finishSubmit(false)}
        editingItem={editingItem}
        onFinish={finishSubmit}
      />
    </div>
  );
};

export default Cities;
