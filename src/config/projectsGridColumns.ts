import type { ColDef } from 'ag-grid-community';
import { ActionMenuCellRenderer, CurrencyCellRenderer, BadgeCellRenderer } from '@/components/ag-grid/cellRenderers';
import { formatDate } from '@/utils/formatters';
import type { GridActionHandlers } from '@/config/gridTypes';
import type { Project } from '@/types';

export { defaultColDef } from '@/config/defaultColDef';

const statusBadgeClasses: Record<string, { bg: string; text: string; border: string }> = {
  Active: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  Pending: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  'Non Aktif': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
};

const statusLabels: Record<string, string> = {
  Active: 'Aktif',
  Pending: 'Pending',
  'Non Aktif': 'Non Aktif',
};

export const createProjectsColumnDefs = ({
  onEdit,
  onDelete,
  onView,
}: GridActionHandlers<Project>): ColDef<Project>[] => [
  {
    field: 'no_sp2k',
    headerName: 'No. SP2K',
    width: 140,
  },
  {
    field: 'judul_pekerjaan',
    headerName: 'Judul Pekerjaan',
  },
  {
    field: 'client.name',
    headerName: 'Klien',
  },
  {
    field: 'tanggal_mulai',
    headerName: 'Mulai',
    width: 120,
    valueFormatter: (p) => formatDate(p.value),
  },
  {
    field: 'nilai_pekerjaan',
    headerName: 'Nilai Pekerjaan',
    cellRenderer: CurrencyCellRenderer,
  },
  {
    field: 'status_kontrak',
    headerName: 'Status',
    width: 110,
    valueGetter: (p) => statusLabels[p.data?.status_kontrak ?? ''] ?? p.data?.status_kontrak,
    cellRendererSelector: (params) => ({
      component: BadgeCellRenderer,
      params: { badgeClasses: statusBadgeClasses[params.data?.status_kontrak ?? ''] },
    }),
  },
  {
    headerName: 'Aksi',
    width: 60,
    resizable: false,
    sortable: false,
    filter: false,
    floatingFilter: false,
    cellRenderer: ActionMenuCellRenderer,
    cellRendererParams: { onEdit, onDelete, onView },
  },
];
