import type { ICellRendererParams } from 'ag-grid-community';

/**
 * Truncated cell with a hover tooltip. Supply `tooltipText` via
 * `cellRendererParams` when the full text differs from the cell value.
 */
const TooltipCellRenderer = (params: ICellRendererParams<unknown, string>) => {
  const { value, cellRendererParams } = params;

  if (!value) return <span className="text-slate-400">-</span>;

  const tooltip = cellRendererParams?.tooltipText ?? value;

  return (
    <div className="relative group inline-flex items-center h-full">
      <span className="cursor-help text-sm">{value}</span>
      <div className="absolute left-0 top-full mt-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        <div className="bg-slate-800 text-white text-xs rounded py-1 px-2 shadow-lg">{tooltip}</div>
      </div>
    </div>
  );
};

export default TooltipCellRenderer;