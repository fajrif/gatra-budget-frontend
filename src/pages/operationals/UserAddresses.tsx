import { useState, useMemo, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressesAPI } from '@/api/endpoints';
import { AgGridReact } from 'ag-grid-react';
import { appTheme } from '@/lib/agGridTheme';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MapPin } from 'lucide-react';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/components/ui/use-toast';
import AddEditAddressDialog, {
  type AddressEditingItem,
} from '@/components/dialogs/operationals/AddEditAddressDialog';
import { createAddressesColumnDefs, defaultColDef } from '@/config/addressesGridColumns';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { Address } from '@/types';

const UserAddresses = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const confirm = useConfirm();
  const gridRef = useRef<AgGridReact | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<AddressEditingItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-addresses'],
    queryFn: () => addressesAPI.getMine(),
    select: (res) => res.data?.addresses ?? [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressesAPI.deleteMine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
      toast({ title: 'Success', description: 'Address deleted.', variant: 'success' });
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: getErrorMessage(err, 'Failed to delete address.'),
        variant: 'destructive',
      });
    },
  });

  const handleDelete = useCallback(
    async (row: Address) => {
      const ok = await confirm({ message: `Delete address "${row.name}"?`, variant: 'danger' });
      if (ok) deleteMutation.mutate(row.id);
    },
    [confirm, deleteMutation],
  );

  const columnDefs = useMemo(
    () =>
      createAddressesColumnDefs({
        onEdit: (row: Address) => {
          setEditingItem(row);
          setShowDialog(true);
        },
        onDelete: handleDelete,
      }),
    [handleDelete],
  );

  const finishSubmit = (shouldRefresh: boolean) => {
    if (shouldRefresh) queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
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
        </div>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">About My Addresses</h3>
                <p className="text-sm text-slate-700 mb-3">
                  Addresses saved to your user profile.
                </p>
                <div className="space-y-1 text-sm text-slate-600">
                  <p>
                    • <strong className="font-semibold">Label:</strong> Short name (e.g. Home,
                    Office)
                  </p>
                  <p>
                    • <strong className="font-semibold">Address:</strong> Full street address
                  </p>
                  <p>
                    • <strong className="font-semibold">Country ID:</strong> reference to{' '}
                    <code>countries</code>
                  </p>
                  <p>
                    • <strong className="font-semibold">Province ID:</strong> reference to{' '}
                    <code>provinces</code>
                  </p>
                  <p>
                    • <strong className="font-semibold">City ID:</strong> reference to{' '}
                    <code>cities</code>
                  </p>
                  <p>
                    • <strong className="font-semibold">Area ID:</strong> reference to{' '}
                    <code>areas</code> (optional)
                  </p>
                  <p>
                    • <strong className="font-semibold">Zipcode:</strong> Postal code
                  </p>
                </div>
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
                Add Address
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (data?.length ?? 0) === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No addresses yet. Add your first address.
              </div>
            ) : (
              <div className="ag-grid-wrapper" style={{ height: 600, width: '100%' }}>
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

      <AddEditAddressDialog
        isOpen={showDialog}
        onClose={() => finishSubmit(false)}
        editingItem={editingItem ?? undefined}
        onFinish={finishSubmit}
      />
    </div>
  );
};

export default UserAddresses;