import { useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI } from '@/api/endpoints';
import { AgGridReact } from 'ag-grid-react';
import { appTheme } from '@/lib/agGridTheme';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AboutCard from '@/components/ui/AboutCard';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Briefcase } from 'lucide-react';
import ImportExcelDialog from '@/components/dialogs/operationals/ImportExcelDialog';
import { useToast } from '@/components/ui/use-toast';
import AddEditProjectDialog from '@/components/dialogs/operationals/AddEditProjectDialog';
import { createProjectsColumnDefs, defaultColDef } from '@/config/projectsGridColumns';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { Project } from '@/types';

const Projects = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const gridRef = useRef<AgGridReact | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingItem, setEditingItem] = useState<Project | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.getAll({ all: true }),
    select: (res) => res.data?.projects ?? [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Success', description: 'Proyek berhasil dihapus.', variant: 'success' });
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: getErrorMessage(err, 'Gagal menghapus proyek.'),
        variant: 'destructive',
      });
    },
  });

  // ActionMenuCellRenderer already confirms destructive actions before calling
  // onDelete, so this just performs the mutation.
  const handleDelete = useCallback(
    (row: Project) => {
      deleteMutation.mutate(row.id);
    },
    [deleteMutation],
  );

  const columnDefs = useMemo(
    () =>
      createProjectsColumnDefs({
        onEdit: (row: Project) => {
          setEditingItem(row);
          setShowDialog(true);
        },
        onDelete: handleDelete,
        onView: (row: Project) => navigate(`/projects/${row.id}`),
      }),
    [handleDelete, navigate],
  );

  const finishSubmit = (shouldRefresh: boolean) => {
    if (shouldRefresh) queryClient.invalidateQueries({ queryKey: ['projects'] });
    setShowDialog(false);
    setEditingItem(null);
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Proyek</h1>
            <p className="text-slate-500 mt-1">Kelola proyek yang sedang dikerjakan</p>
          </div>
        </div>
        <AboutCard icon={Briefcase} title="Tentang Proyek" storageKey="project_card">
          <p className="text-sm text-slate-700 mb-3">
            Proyek yang sedang dikerjakan. Proyek berakhir pada Tanggal Selesai, sehingga statusnya
            dihitung otomatis. Klik menu pada baris dan pilih "Lihat" untuk membuka transaksi dan invoice
            proyek.
          </p>
          <div className="space-y-1 text-sm text-slate-600">
            <p>
              • <strong className="font-semibold">No. SP2K:</strong> nomor surat perintah kerja proyek
            </p>
            <p>
              • <strong className="font-semibold">No. Perjanjian / No. Amandemen:</strong> nomor kontrak dan amandemennya (opsional)
            </p>
            <p>
              • <strong className="font-semibold">Judul Pekerjaan:</strong> nama pekerjaan yang dikerjakan
            </p>
            <p>
              • <strong className="font-semibold">Tanggal Perjanjian:</strong> tanggal kontrak ditandatangani (opsional, tidak boleh setelah Tanggal Mulai)
            </p>
            <p>
              • <strong className="font-semibold">Tanggal Mulai / Tanggal Selesai:</strong> periode kontrak; Tanggal Selesai wajib dan harus setelah Tanggal Mulai
            </p>
            <p>
              • <strong className="font-semibold">Nilai Pekerjaan:</strong> nilai kontrak, dasar penghitungan sisa anggaran
            </p>
            <p>
              • <strong className="font-semibold">Klien / Jenis Kontrak:</strong> referensi ke data master (opsional)
            </p>
            <p>
              • <strong className="font-semibold">Status:</strong> otomatis: Belum mulai sebelum Tanggal Mulai, Berjalan selama periode kontrak, Habis Kontrak setelah Tanggal Selesai
            </p>
            <p>
              • <strong className="font-semibold">Masa Akhir:</strong> pengingat "Kontrak 1 bulan lagi berakhir" saat kontrak berjalan tinggal 1 bulan atau kurang, selain itu "-"
            </p>
            <p>
              • <strong className="font-semibold">Import Excel:</strong> unduh template, isi, lalu import; semua baris diperiksa lebih dulu dan tidak ada yang tersimpan bila ada kesalahan; No SP2K yang sudah ada diperbarui
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
                Tambah Proyek
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">Memuat...</div>
            ) : (data?.length ?? 0) === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Belum ada proyek. Tambahkan proyek pertama Anda.
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
                  onRowDoubleClicked={(params) => params.data && navigate(`/projects/${params.data.id}`)}
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

      <AddEditProjectDialog
        isOpen={showDialog}
        onClose={() => finishSubmit(false)}
        editingItem={editingItem ?? undefined}
        onFinish={finishSubmit}
      />

      <ImportExcelDialog
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        kind="projects"
        onImported={() => queryClient.invalidateQueries({ queryKey: ['projects'] })}
      />
    </div>
  );
};

export default Projects;
