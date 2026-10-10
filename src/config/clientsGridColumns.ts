import type { ColDef } from 'ag-grid-community';
import { ActionMenuCellRenderer } from '@/components/ag-grid/cellRenderers';
import type { GridActionHandlers } from '@/config/gridTypes';
import type { Client } from '@/types';

export { defaultColDef } from '@/config/defaultColDef';

export const createClientsColumnDefs = ({
  onEdit,
  onDelete,
}: GridActionHandlers<Client>): ColDef<Client>[] => [
  {
    field: 'name',
    headerName: 'Nama Klien',
  },
  {
    field: 'contact_name',
    headerName: 'Nama Kontak',
  },
  {
    field: 'phone',
    headerName: 'Telepon',
    width: 150,
  },
  {
    field: 'address',
    headerName: 'Alamat',
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
