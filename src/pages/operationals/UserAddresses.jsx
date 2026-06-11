import { useState, useMemo, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressesAPI } from '@/api/endpoints';
import { AgGridReact } from 'ag-grid-react';
import { appTheme } from '@/lib/agGridTheme';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/components/ui/use-toast';
import AddEditAddressDialog from '@/components/dialogs/operationals/AddEditAddressDialog';
import { createAddressesColumnDefs, defaultColDef } from '@/config/addressesGridColumns';

const UserAddresses = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const confirm = useConfirm();
  const gridRef = useRef(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-addresses'],
    queryFn: () => addressesAPI.getMine(),
    select: (res) => res.data?.addresses ?? [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => addressesAPI.deleteMine(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-addresses']);
      toast({ title: 'Success', description: 'Address deleted.', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.response?.data?.error || 'Failed to delete address.', variant: 'destructive' });
    },
  });

  const handleDelete = useCallback(async (row) => {
    const ok = await confirm({ message: `Delete address "${row.name}"?`, variant: 'danger' });
    if (ok) deleteMutation.mutate(row.id);
  }, [confirm, deleteMutation]);

  const columnDefs = useMemo(() => createAddressesColumnDefs({
    onEdit: (row) => { setEditingItem(row); setShowDialog(true); },
    onDelete: handleDelete,
  }), [handleDelete]);

  const finishSubmit = (shouldRefresh) => {
    if (shouldRefresh) queryClient.invalidateQueries(['my-addresses']);
    setShowDialog(false);
    setEditingItem(null);
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">My Addresses</h1>
            <p className="text-slate-500 mt-1">Manage your saved addresses</p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="bg-blue-900 hover:bg-blue-800">
            <Plus className="w-4 h-4 mr-2" />
            Add Address
          </Button>
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 animate-pulse">Loading...</div>
            ) : (
              <div style={{ height: 500, width: '100%' }}>
                <AgGridReact
                  theme={appTheme}
                  ref={gridRef}
                  rowData={data ?? []}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  suppressCellFocus
                  rowHeight={44}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddEditAddressDialog
        isOpen={showDialog}
        onClose={() => finishSubmit(false)}
        editingItem={editingItem}
        onFinish={finishSubmit}
      />
    </div>
  );
};

export default UserAddresses;
