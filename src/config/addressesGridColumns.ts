import type { ColDef } from 'ag-grid-community';
import { ActionMenuCellRenderer, TooltipCellRenderer } from '@/components/ag-grid/cellRenderers';
import type { GridActionHandlers } from '@/config/gridTypes';
import type { Address } from '@/types';

export { defaultColDef } from '@/config/defaultColDef';

export const createAddressesColumnDefs = ({
  onEdit,
  onDelete,
}: GridActionHandlers<Address>): ColDef<Address>[] => [
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
    width: 60,
    resizable: false,
    sortable: false,
    filter: false,
    floatingFilter: false,
    cellRenderer: ActionMenuCellRenderer,
    cellRendererParams: { onEdit, onDelete },
  },
];