import type { ColDef } from 'ag-grid-community';
import {
  CurrencyCellRenderer,
  ProjectGroupActionCellRenderer,
  ProjectGroupStatusCellRenderer,
  ProjectGroupTreeCellRenderer,
} from '@/components/ag-grid/cellRenderers';
import { formatDate } from '@/utils/formatters';
import type { ContractStatus, Project, ProjectGroup } from '@/types';

export { defaultColDef } from '@/config/defaultColDef';

/**
 * One flattened row of the Group Proyek tree. AG Grid Tree Data is an
 * Enterprise feature, so the page builds this list itself: each group row is
 * followed by its project rows while the group is expanded.
 */
export interface ProjectGroupTreeRow {
  /** Group id, project id, or 'ungrouped' for the bucket of projects without a group. */
  id: string;
  kind: 'group' | 'ungrouped' | 'project';
  /** Group name, or the project's judul_pekerjaan. */
  nama: string;
  no_sp2k?: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  /** Number of child projects (group rows only). */
  project_count?: number;
  /** Group total, or the project's nilai_pekerjaan. */
  nilai: number;
  contract_status?: ContractStatus;
  expanded?: boolean;
  group?: ProjectGroup;
  project?: Project;
}

export interface ProjectGroupTreeHandlers {
  onToggle: (row: ProjectGroupTreeRow) => void;
  onEdit: (row: ProjectGroupTreeRow) => void;
  onDelete: (row: ProjectGroupTreeRow) => void;
  /** Hides the edit/delete menu (non-admins cannot change groups). */
  canEdit: boolean;
}

export const createProjectGroupsColumnDefs = ({
  onToggle,
  onEdit,
  onDelete,
  canEdit,
}: ProjectGroupTreeHandlers): ColDef<ProjectGroupTreeRow>[] => {
  const columns: ColDef<ProjectGroupTreeRow>[] = [
    {
      field: 'nama',
      headerName: 'Group / Proyek',
      minWidth: 320,
      flex: 2,
      sortable: false,
      filter: false,
      floatingFilter: false,
      cellRenderer: ProjectGroupTreeCellRenderer,
      cellRendererParams: { onToggle },
    },
    {
      field: 'no_sp2k',
      headerName: 'No. SP2K',
      width: 150,
      sortable: false,
      filter: false,
      floatingFilter: false,
    },
    {
      headerName: 'Periode Kontrak',
      width: 270,
      sortable: false,
      filter: false,
      floatingFilter: false,
      valueGetter: (p) =>
        p.data?.kind === 'project' && p.data.tanggal_mulai && p.data.tanggal_selesai
          ? `${formatDate(p.data.tanggal_mulai)} - ${formatDate(p.data.tanggal_selesai)}`
          : '',
    },
    {
      field: 'project_count',
      headerName: 'Jumlah Proyek',
      width: 140,
      sortable: false,
      filter: false,
      floatingFilter: false,
      valueFormatter: (p) => (p.data?.kind === 'project' ? '' : String(p.value ?? 0)),
    },
    {
      field: 'nilai',
      headerName: 'Nilai Pekerjaan',
      sortable: false,
      filter: false,
      floatingFilter: false,
      cellRenderer: CurrencyCellRenderer,
    },
    {
      headerName: 'Status',
      width: 130,
      sortable: false,
      filter: false,
      floatingFilter: false,
      cellRenderer: ProjectGroupStatusCellRenderer,
    },
  ];

  columns.push({
    headerName: 'Aksi',
    width: 60,
    resizable: false,
    sortable: false,
    filter: false,
    floatingFilter: false,
    cellRenderer: ProjectGroupActionCellRenderer,
    cellRendererParams: { onEdit, onDelete, canEdit },
  });
  return columns;
};
