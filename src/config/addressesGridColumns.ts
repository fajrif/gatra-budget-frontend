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
    headerName: 'Alamat',
    cellRenderer: TooltipCellRenderer,
  },
  {
    field: 'city.name',
    headerName: 'Kota',
    width: 160,
  },
  {
    field: 'province.name',
    headerName: 'Provinsi',
    width: 160,
  },
  {
    field: 'zipcode',
    headerName: 'Kode Pos',
    width: 100,
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