import { ActionMenuCellRenderer } from '@/components/ag-grid/cellRenderers';

export { defaultColDef } from '@/config/defaultColDef';

export const createProvincesColumnDefs = ({ onEdit, onDelete }) => [
  {
    field: 'name',
    headerName: 'Province Name',
  },
  {
    field: 'country.name',
    headerName: 'Country',
    width: 160,
  },
  {
    headerName: 'Actions',
    field: 'actions',
    width: 60,
    resizable: false,
    sortable: false,
    filter: false,
    floatingFilter: false,
    cellRenderer: ActionMenuCellRenderer,
    cellRendererParams: { onEdit, onDelete },
  },
];
