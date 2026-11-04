import type { ICellRendererParams } from 'ag-grid-community';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { contractStatusClasses, contractStatusLabels } from '@/components/projects/contractStatus';
import ActionMenuCellRenderer from './ActionMenuCellRenderer';
import type { ProjectGroupTreeRow } from '@/config/projectGroupsGridColumns';

/** Group rows get an expand/collapse chevron; project rows are indented under their group. */
export const ProjectGroupTreeCellRenderer = (params: ICellRendererParams<ProjectGroupTreeRow>) => {
  const { data, onToggle } = params;
  if (!data) return null;

  if (data.kind === 'project') {
    return <span className="pl-8 text-slate-700">{data.nama}</span>;
  }

  const Icon = data.expanded ? ChevronDown : ChevronRight;
  return (
    <button
      type="button"
      onClick={() => onToggle?.(data)}
      className="flex items-center gap-1 font-semibold text-slate-900 hover:text-blue-900"
      aria-expanded={data.expanded}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className={data.kind === 'ungrouped' ? 'italic text-slate-500' : undefined}>{data.nama}</span>
    </button>
  );
};

/** Contract status badge, for project rows only. */
export const ProjectGroupStatusCellRenderer = ({ data }: ICellRendererParams<ProjectGroupTreeRow>) => {
  if (!data || data.kind !== 'project' || !data.contract_status) return null;
  return (
    <Badge variant="outline" className={contractStatusClasses[data.contract_status]}>
      {contractStatusLabels[data.contract_status]}
    </Badge>
  );
};

/**
 * Edit/Delete menu for real groups, admins only. Project rows and the "no
 * group" bucket have no actions (double-click a project to open it).
 */
export const ProjectGroupActionCellRenderer = (
  params: ICellRendererParams<ProjectGroupTreeRow> & { canEdit?: boolean },
) => {
  const { data, canEdit } = params;
  if (!data || data.kind !== 'group' || !canEdit) return null;
  return <ActionMenuCellRenderer {...params} />;
};
