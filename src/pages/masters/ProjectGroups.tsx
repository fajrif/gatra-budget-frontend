import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectGroupsAPI, projectsAPI } from '@/api/endpoints';
import { AgGridReact } from 'ag-grid-react';
import { appTheme } from '@/lib/agGridTheme';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AboutCard from '@/components/ui/AboutCard';
import { Button } from '@/components/ui/button';
import { Plus, Layers, ChevronsDown, ChevronsUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import AddEditProjectGroupDialog from '@/components/dialogs/masters/AddEditProjectGroupDialog';
import {
  createProjectGroupsColumnDefs,
  defaultColDef,
  type ProjectGroupTreeRow,
} from '@/config/projectGroupsGridColumns';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { Project, ProjectGroup } from '@/types';

const UNGROUPED_ID = 'ungrouped';

const sumNilai = (projects: Project[]): number => projects.reduce((sum, p) => sum + p.nilai_pekerjaan, 0);

const projectRow = (p: Project): ProjectGroupTreeRow => ({
  id: p.id,
  kind: 'project',
  nama: p.judul_pekerjaan,
  no_sp2k: p.no_sp2k,
  tanggal_mulai: p.tanggal_mulai,
  tanggal_selesai: p.tanggal_selesai,
  nilai: p.nilai_pekerjaan,
  contract_status: p.contract_status,
  project: p,
});

/**
 * Flattens groups and their projects into the rows the grid shows: a group row,
 * then its projects (earliest contract first) unless the group is collapsed.
 * Projects without a group go under a trailing "Tanpa Group" row.
 */
const buildTreeRows = (
  groups: ProjectGroup[],
  projects: Project[],
  collapsed: Set<string>,
): ProjectGroupTreeRow[] => {
  const byGroup = new Map<string, Project[]>();
  const ungrouped: Project[] = [];
  for (const p of projects) {
    if (p.project_group_id) {
      byGroup.set(p.project_group_id, [...(byGroup.get(p.project_group_id) ?? []), p]);
    } else {
      ungrouped.push(p);
    }
  }
  const byStart = (a: Project, b: Project) => a.tanggal_mulai.localeCompare(b.tanggal_mulai);

  const rows: ProjectGroupTreeRow[] = [];
  for (const group of groups) {
    const children = (byGroup.get(group.id) ?? []).sort(byStart);
    const expanded = !collapsed.has(group.id);
    rows.push({
      id: group.id,
      kind: 'group',
      nama: group.nama,
      project_count: children.length,
      nilai: group.total_nilai ?? sumNilai(children),
      expanded,
      group,
    });
    if (expanded) rows.push(...children.map(projectRow));
  }

  if (ungrouped.length > 0) {
    const expanded = !collapsed.has(UNGROUPED_ID);
    rows.push({
      id: UNGROUPED_ID,
      kind: 'ungrouped',
      nama: 'Tanpa Group',
      project_count: ungrouped.length,
      nilai: sumNilai(ungrouped),
      expanded,
    });
    if (expanded) rows.push(...ungrouped.sort(byStart).map(projectRow));
  }
  return rows;
};

const ProjectGroups = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjectGroup | null>(null);
  // Groups are expanded by default; this tracks the ones the user collapsed.
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ['project-groups'],
    queryFn: () => projectGroupsAPI.getAll({ all: true }),
    select: (res) => res.data?.project_groups ?? [],
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.getAll({ all: true }),
    select: (res) => res.data?.projects ?? [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectGroupsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-groups'] });
      toast({ title: 'Success', description: 'Group proyek berhasil dihapus.', variant: 'success' });
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: getErrorMessage(err, 'Gagal menghapus group proyek.'),
        variant: 'destructive',
      });
    },
  });

  const toggle = useCallback((row: ProjectGroupTreeRow) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(row.id)) next.delete(row.id);
      else next.add(row.id);
      return next;
    });
  }, []);

  // ActionMenuCellRenderer already confirms before calling onDelete. A group
  // that still has projects is refused here (and by the server with a 409).
  const handleDelete = useCallback(
    (row: ProjectGroupTreeRow) => {
      if ((row.project_count ?? 0) > 0) {
        toast({
          title: 'Tidak dapat menghapus',
          description: `Group "${row.nama}" masih memiliki ${row.project_count} proyek. Pindahkan atau hapus proyeknya terlebih dahulu.`,
          variant: 'destructive',
        });
        return;
      }
      deleteMutation.mutate(row.id);
    },
    [deleteMutation, toast],
  );

  const columnDefs = useMemo(
    () =>
      createProjectGroupsColumnDefs({
        onToggle: toggle,
        onEdit: (row) => {
          setEditingItem(row.group ?? null);
          setShowDialog(true);
        },
        onDelete: handleDelete,
        canEdit: true,
      }),
    [toggle, handleDelete],
  );

  const rows = useMemo(
    () => buildTreeRows(groups ?? [], projects ?? [], collapsed),
    [groups, projects, collapsed],
  );

  const collapsibleIds = useMemo(() => {
    const ids = (groups ?? []).map((g) => g.id);
    if ((projects ?? []).some((p) => !p.project_group_id)) ids.push(UNGROUPED_ID);
    return ids;
  }, [groups, projects]);

  const finishSubmit = (shouldRefresh: boolean) => {
    if (shouldRefresh) queryClient.invalidateQueries({ queryKey: ['project-groups'] });
    setShowDialog(false);
    setEditingItem(null);
  };

  const isLoading = groupsLoading || projectsLoading;

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Group Proyek</h1>
            <p className="text-slate-500 mt-1">Kelompokkan proyek yang merupakan satu pekerjaan</p>
          </div>
        </div>
        <AboutCard icon={Layers} title="Tentang Group Proyek" storageKey="project_group_card">
          <p className="text-sm text-slate-700 mb-3">
            Satu pekerjaan sering dikontrakkan bertahap (mis. Jan-Feb, Mar-Apr, Mei-Okt) sehingga tercatat
            sebagai beberapa proyek. Group Proyek menyatukannya. Tabel ini menampilkan tiap group beserta
            proyek di dalamnya.
          </p>
          <div className="space-y-1 text-sm text-slate-600">
            <p>
              • <strong className="font-semibold">Nilai Pekerjaan group:</strong> total nilai seluruh proyek di dalam group
            </p>
            <p>
              • <strong className="font-semibold">Memasukkan proyek:</strong> pilih Group Proyek saat menambah atau mengubah proyek (opsional)
            </p>
            <p>
              • <strong className="font-semibold">Menghapus group:</strong> hanya bisa bila group tidak memiliki proyek
            </p>
            <p>
              • <strong className="font-semibold">Membuka proyek:</strong> klik dua kali baris proyek
            </p>
          </div>
        </AboutCard>
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <div className="flex justify-end items-center gap-2">
              <Button variant="outline" onClick={() => setCollapsed(new Set())}>
                <ChevronsDown className="w-4 h-4 mr-2" />
                Buka Semua
              </Button>
              <Button variant="outline" onClick={() => setCollapsed(new Set(collapsibleIds))}>
                <ChevronsUp className="w-4 h-4 mr-2" />
                Tutup Semua
              </Button>
              <Button onClick={() => setShowDialog(true)} className="bg-blue-900 hover:bg-blue-800">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Group Proyek
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">Memuat...</div>
            ) : rows.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Belum ada group proyek. Tambahkan group proyek pertama Anda.
              </div>
            ) : (
              <div className="ag-grid-wrapper" style={{ height: 560, width: '100%' }}>
                <AgGridReact<ProjectGroupTreeRow>
                  theme={appTheme}
                  rowData={rows}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  getRowId={(params) => params.data.id}
                  rowClassRules={{
                    'font-semibold bg-slate-50': (p) => p.data?.kind !== 'project',
                  }}
                  onRowDoubleClicked={(params) => {
                    if (params.data?.kind === 'project') navigate(`/projects/${params.data.id}`);
                  }}
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

      <AddEditProjectGroupDialog
        isOpen={showDialog}
        onClose={() => finishSubmit(false)}
        editingItem={editingItem ?? undefined}
        onFinish={finishSubmit}
      />
    </div>
  );
};

export default ProjectGroups;
