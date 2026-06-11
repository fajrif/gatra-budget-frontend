import { ActionMenuCellRenderer } from '@/components/ag-grid/cellRenderers';
import { BadgeCellRenderer } from '@/components/ag-grid/cellRenderers';

export const defaultColDef = {
  sortable: true,
  resizable: true,
  filter: 'agTextColumnFilter',
  floatingFilter: true,
  suppressHeaderMenuButton: true,
};

const roleColorMap = {
  admin: 'bg-purple-100 text-purple-800',
  user: 'bg-blue-100 text-blue-800',
  operator: 'bg-green-100 text-green-800',
};

export const createUsersColumnDefs = ({ onEdit, onDelete }) => [
  {
    field: 'full_name',
    headerName: 'Full Name',
    flex: 1,
    minWidth: 160,
  },
  {
    field: 'email',
    headerName: 'Email',
    flex: 1,
    minWidth: 200,
  },
  {
    field: 'role',
    headerName: 'Role',
    width: 120,
    cellRenderer: BadgeCellRenderer,
    cellRendererParams: {
      getColorClass: (value) => roleColorMap[value] || 'bg-slate-100 text-slate-700',
    },
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
