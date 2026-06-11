import { ActionMenuCellRenderer } from '@/components/ag-grid/cellRenderers';

export const defaultColDef = {
  sortable: true,
  resizable: true,
  filter: 'agTextColumnFilter',
  floatingFilter: true,
  suppressHeaderMenuButton: true,
};

export const createProvincesColumnDefs = ({ onEdit, onDelete }) => [
  {
    field: 'name',
    headerName: 'Province Name',
    flex: 1,
    minWidth: 180,
  },
  {
    field: 'country.name',
    headerName: 'Country',
    width: 160,
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
