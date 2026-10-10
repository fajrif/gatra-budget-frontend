import type { ColDef } from 'ag-grid-community';
import { ActionMenuCellRenderer } from '@/components/ag-grid/cellRenderers';
import type { GridActionHandlers } from '@/config/gridTypes';
import type { ContractType } from '@/types';

export { defaultColDef } from '@/config/defaultColDef';

export const createContractTypesColumnDefs = ({
  onEdit,
  onDelete,
}: GridActionHandlers<ContractType>): ColDef<ContractType>[] => [
  {
    field: 'code',
    headerName: 'Kode',
    width: 100,
  },
  {
    field: 'name',
    headerName: 'Nama',
  },
  {
    field: 'description',
    headerName: 'Deskripsi',
  },
  {
    headerName: 'Aksi',
    width: 60,
    resizable: false,
    sortable: false,
    filter: false,
    floatingFilter: false,
    cellRenderer: ActionMenuCellRenderer,
    cellRendererParams: { onEdit, onDelete },
  },
];
