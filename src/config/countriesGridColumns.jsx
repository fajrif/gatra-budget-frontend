import { ActionMenuCellRenderer } from '@/components/ag-grid/cellRenderers';

export const defaultColDef = {
  sortable: true,
  resizable: true,
  filter: 'agTextColumnFilter',
  floatingFilter: true,
  suppressHeaderMenuButton: true,
};

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
    flex: 1,
    minWidth: 180,
  },
  {
    headerName: 'Actions',
    width: 80,
    sortable: false,
    filter: false,
    floatingFilter: false,
    cellRenderer: ActionMenuCellRenderer,
    cellRendererParams: { onEdit, onDelete },
  },
];
