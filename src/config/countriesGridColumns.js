import { ActionMenuCellRenderer } from '@/components/ag-grid/cellRenderers';

export { defaultColDef } from '@/config/defaultColDef';

export const createCountriesColumnDefs = ({ onEdit, onDelete }) => [
  {
    field: 'code',
    headerName: 'Code',
    width: 90,
    cellStyle: { fontWeight: 600, textTransform: 'uppercase' },
  },
  {
    field: 'name',
    headerName: 'Country Name',
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
