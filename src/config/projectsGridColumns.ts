import type { ColDef } from 'ag-grid-community';
import {
  ActionMenuCellRenderer,
  BadgeCellRenderer,
  ContractStatusCellRenderer,
  CurrencyCellRenderer,
} from '@/components/ag-grid/cellRenderers';
import { formatDate } from '@/utils/formatters';
import type { GridActionHandlers } from '@/config/gridTypes';
import type { Project } from '@/types';

export { defaultColDef } from '@/config/defaultColDef';

const contractStatusLabels: Record<string, string> = {
  not_started: 'Belum mulai',
  ongoing: 'Berjalan',
  expired: 'Habis Kontrak',
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
    field: 'tanggal_selesai',
    headerName: 'Selesai',
    width: 120,
    valueFormatter: (p) => formatDate(p.value),
  },
  {
    field: 'nilai_pekerjaan',
    headerName: 'Nilai Pekerjaan',
    cellRenderer: CurrencyCellRenderer,
  },
  {
    field: 'contract_status',
    headerName: 'Status',
    width: 130,
    // The value (used for sorting/filtering) is the human label; the renderer
    // draws the badge from the row.
    valueGetter: (p) => contractStatusLabels[p.data?.contract_status ?? ''] ?? p.data?.contract_status,
    cellRenderer: ContractStatusCellRenderer,
  },
  {
    headerName: 'Masa Akhir',
    width: 210,
    // Only an ongoing contract ending within a month has a reminder; anything
    // else is empty, which BadgeCellRenderer shows as "-".
    valueGetter: (p) => (p.data?.ending_soon ? 'Kontrak 1 bulan lagi berakhir' : ''),
    cellRenderer: BadgeCellRenderer,
    cellRendererParams: {
      badgeClasses: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
    },
    tooltipValueGetter: (p) => (p.data?.ending_soon ? `${p.data.days_remaining} hari lagi` : undefined),
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
