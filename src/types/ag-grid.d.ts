import 'ag-grid-community';

/**
 * AG Grid's `cellRendererParams` is typed as `any` by default, which means custom
 * callbacks passed through it are completely unchecked. Merging our own keys in
 * gives those callbacks real signatures everywhere they are declared.
 *
 * AG Grid merges `colDef.cellRendererParams` directly onto the params object a
 * cell renderer receives (there is no nested `params.cellRendererParams` at
 * runtime) — these keys must live at the top level of `ICellRendererParams`
 * itself, not nested under a `cellRendererParams` property.
 */
declare module 'ag-grid-community' {
  interface ICellRendererParams<TData = unknown, TValue = unknown, TContext = unknown> {
    /** Row edit handler supplied by the hosting page. */
    onEdit?: (row: TData) => void;
    /** Row delete handler supplied by the hosting page. */
    onDelete?: (row: TData) => void;
    /** Row view handler, where the resource supports a detail view. */
    onView?: (row: TData) => void;
    /** Tooltip copy for `TooltipCellRenderer`; defaults to the cell value. */
    tooltipText?: string;
    /** Tailwind class fragments for `BadgeCellRenderer`. */
    badgeClasses?: BadgeClassNames;
  }
}

/** Optional Tailwind classes for each part of a `BadgeCellRenderer` pill. */
export interface BadgeClassNames {
  bg?: string;
  text?: string;
  border?: string;
}