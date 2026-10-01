import type { ColDef } from 'ag-grid-community';

/**
 * Shared defaults for every grid column. Column-specific definitions should
 * omit `flex`/`minWidth` — they inherit from here.
 */
export const defaultColDef: ColDef = {
  flex: 1,
  minWidth: 80,
  sortable: true,
  resizable: true,
  filter: 'agTextColumnFilter',
  floatingFilter: true,
  suppressHeaderFilterButton: true,
  suppressHeaderMenuButton: true,
  suppressFloatingFilterButton: true,
  cellStyle: { display: 'flex', alignItems: 'center' },
};