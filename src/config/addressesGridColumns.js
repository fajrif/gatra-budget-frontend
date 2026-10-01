import { ActionMenuCellRenderer, TooltipCellRenderer } from '@/components/ag-grid/cellRenderers';

export { defaultColDef } from '@/config/defaultColDef';

export const createAddressesColumnDefs = ({ onEdit, onDelete }) => [
  {
    field: 'name',
    headerName: 'Label',
    width: 130,
  },
  {
    field: 'address',
    headerName: 'Address',
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
