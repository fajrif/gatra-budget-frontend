import { ActionMenuCellRenderer } from '@/components/ag-grid/cellRenderers';

export const defaultColDef = {
  sortable: true,
  resizable: true,
  filter: 'agTextColumnFilter',
  floatingFilter: true,
  suppressHeaderMenuButton: true,
};

export const createCitiesColumnDefs = ({ onEdit, onDelete }) => [
  {
    field: 'name',
    headerName: 'City Name',
    flex: 1,
    minWidth: 180,
  },
  {
    field: 'province.name',
    headerName: 'Province',
    width: 180,
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
