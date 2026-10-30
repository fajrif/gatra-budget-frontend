import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { contractStatusClasses, contractStatusLabels } from '@/components/projects/contractStatus';
import type { Project } from '@/types';

export interface ProjectContractBadgeProps {
  project: Pick<Project, 'contract_status' | 'ending_soon' | 'days_remaining'>;
  className?: string;
}

/**
 * Status badge for a project's contract, derived by the server from its dates.
 * An ongoing contract ending within a month also gets a reminder badge.
 */
const ProjectContractBadge = ({ project, className }: ProjectContractBadgeProps) => (
  <span className={cn('inline-flex items-center gap-1.5 flex-wrap', className)}>
    <Badge variant="outline" className={contractStatusClasses[project.contract_status]}>
      {contractStatusLabels[project.contract_status]}
    </Badge>
    {project.ending_soon && (
      <Badge
        variant="outline"
        className="bg-amber-100 text-amber-800 border-amber-200"
        title={`${project.days_remaining} hari lagi`}
      >
        Kontrak 1 bulan lagi berakhir
      </Badge>
    )}
  </span>
);

export default ProjectContractBadge;
