import { ActionMenuCellRenderer } from '@/components/ag-grid/cellRenderers';
import { TooltipCellRenderer } from '@/components/ag-grid/cellRenderers';

export const defaultColDef = {
  sortable: true,
  resizable: true,
  filter: 'agTextColumnFilter',
  floatingFilter: true,
  suppressHeaderMenuButton: true,
};

export const createAddressesColumnDefs = ({ onEdit, onDelete }) => [
  {
    field: 'name',
    headerName: 'Label',
    width: 130,
  },
  {
    field: 'address',
    headerName: 'Address',
    flex: 1,
    minWidth: 200,
    cellRenderer: TooltipCellRenderer,
  },
  {
    field: 'city.name',
    headerName: 'City',
    width: 160,
  },
  {
    field: 'province.name',
    headerName: 'Province',
    width: 160,
  },
  {
    field: 'zipcode',
    headerName: 'Zipcode',
    width: 100,
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
