import type { ICellRendererParams } from 'ag-grid-community';
import { cn } from '@/lib/utils';
import type { BadgeClassNames } from '@/types/ag-grid';

/**
 * Renders a pill badge. The `bg`/`text`/`border` classes are passed per-column
 * via `cellRendererParams.badgeClasses`, so a single renderer covers every
 * status colour without hardcoding a palette here.
 */
const BadgeCellRenderer = (params: ICellRendererParams) => {
  const { value, cellRendererParams } = params;

  if (!value) return <span className="text-slate-400">-</span>;

  const classes: BadgeClassNames = cellRendererParams?.badgeClasses ?? {};

  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-px rounded text-[10px] font-medium border leading-tight',
        classes.bg || 'bg-gray-100',
        classes.text || 'text-gray-800',
        classes.border || 'border-gray-200',
      )}
    >
      {value}
    </span>
  );
};

export default BadgeCellRenderer;