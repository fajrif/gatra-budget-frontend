import type { ColDef } from 'ag-grid-community';

/**
 * Page-supplied handlers passed down to `ActionMenuCellRenderer` through
 * `cellRendererParams`. Kept generic over the row type so each resource gets
 * a correctly typed `onEdit`.
 */
export interface GridActionHandlers<TData> {
  onEdit: (row: TData) => void;
  onDelete: (row: TData) => void;
  onView?: (row: TData) => void;
}