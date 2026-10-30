import type { ICellRendererParams } from 'ag-grid-community';
import { Badge } from '@/components/ui/badge';
import { contractStatusClasses, contractStatusLabels } from '@/components/projects/contractStatus';
import type { Project } from '@/types';

/** Renders a project's derived contract status badge. */
const ContractStatusCellRenderer = (params: ICellRendererParams<Project>) => {
  if (!params.data) return null;
  const status = params.data.contract_status;
  return (
    <Badge variant="outline" className={contractStatusClasses[status]}>
      {contractStatusLabels[status]}
    </Badge>
  );
};

export default ContractStatusCellRenderer;
