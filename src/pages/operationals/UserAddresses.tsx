import { useState, useMemo, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressesAPI } from '@/api/endpoints';
import { AgGridReact } from 'ag-grid-react';
import { appTheme } from '@/lib/agGridTheme';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AboutCard from '@/components/ui/AboutCard';
import { Button } from '@/components/ui/button';
import { Plus, MapPin } from 'lucide-react';
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
      toast({ title: 'Success', description: 'Alamat berhasil dihapus.', variant: 'success' });
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: getErrorMessage(err, 'Gagal menghapus alamat.'),
        variant: 'destructive',
      });
    },
  });

  // ActionMenuCellRenderer already confirms destructive actions before calling
  // onDelete, so this just performs the mutation.
  const handleDelete = useCallback(
    (row: Address) => {
      deleteMutation.mutate(row.id);
    },
    [deleteMutation],
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
            <h1 className="text-2xl font-semibold text-slate-900">Alamat Saya</h1>
            <p className="text-slate-500 mt-1">Kelola alamat tersimpan Anda</p>
          </div>
        </div>

        <AboutCard icon={MapPin} title="Tentang Alamat Saya">
          <p className="text-sm text-slate-700 mb-3">
            Alamat yang tersimpan di profil pengguna Anda.
          </p>
          <div className="space-y-1 text-sm text-slate-600">
            <p>
              • <strong className="font-semibold">Label:</strong> Nama singkat (mis. Rumah, Kantor)
            </p>
            <p>
              • <strong className="font-semibold">Alamat:</strong> Alamat jalan lengkap
            </p>
            <p>
              • <strong className="font-semibold">ID Negara:</strong> referensi ke{' '}
              <code>countries</code>
            </p>
            <p>
              • <strong className="font-semibold">ID Provinsi:</strong> referensi ke{' '}
              <code>provinces</code>
            </p>
            <p>
              • <strong className="font-semibold">ID Kota:</strong> referensi ke <code>cities</code>
            </p>
            <p>
              • <strong className="font-semibold">ID Kecamatan:</strong> referensi ke{' '}
              <code>areas</code> (opsional)
            </p>
            <p>
              • <strong className="font-semibold">Kode Pos:</strong> Kode pos
            </p>
          </div>
        </AboutCard>
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <div className="flex justify-end items-center">
              <Button
                onClick={() => setShowDialog(true)}
                className="bg-blue-900 hover:bg-blue-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Alamat
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">Memuat...</div>
            ) : (data?.length ?? 0) === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Belum ada alamat. Tambahkan alamat pertama Anda.
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
                  overlayNoRowsTemplate="<span>Tidak ada data.</span>"
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