import { useQuery } from '@tanstack/react-query';
import { reportsAPI } from '@/api/endpoints';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatRupiah } from '@/utils/formatters';
import type { UUID } from '@/types';

export interface ProjectFinancialSummaryProps {
  projectId: UUID;
}

/**
 * Admin-only remaining budget and profit margin for one project. The parent
 * must render this only for admins (no request is made otherwise), and the
 * server returns 403 to anyone else regardless.
 */
const ProjectFinancialSummary = ({ projectId }: ProjectFinancialSummaryProps) => {
  const { data: summary, isLoading, isError } = useQuery({
    queryKey: ['project-financial-summary', projectId],
    queryFn: () => reportsAPI.getProjectSummary(projectId),
    select: (res) => res.data?.project_summary,
  });

  if (isLoading) {
    return <div className="text-sm text-slate-500">Memuat ringkasan keuangan...</div>;
  }

  if (isError || !summary) {
    return <div className="text-sm text-red-600">Ringkasan keuangan tidak dapat dimuat.</div>;
  }

  const tiles = [
    { label: 'Sisa Anggaran', value: formatRupiah(summary.remaining_budget) },
    { label: 'Total Realisasi', value: formatRupiah(summary.total_realisasi) },
    {
      label: 'Total Invoice',
      value: formatRupiah(summary.total_invoice),
      hint: `${formatRupiah(summary.total_clearing)} sudah dibayar`,
    },
    {
      label: 'Profit Margin',
      value: formatRupiah(summary.profit_margin),
      hint: 'total manajemen fee invoice',
    },
  ];

  return (
    <Card className="border-none shadow-md">
      <CardContent className="pt-6 space-y-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">Ringkasan Keuangan</h3>
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
            Khusus Admin
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">{tile.label}</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">{tile.value}</p>
              {tile.hint && <p className="text-xs text-slate-500 mt-1">{tile.hint}</p>}
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
            <span>Penyerapan nilai kontrak</span>
            <span className="font-medium">{summary.absorption_pct.toFixed(1)}%</span>
          </div>
          <Progress
            value={Math.min(summary.absorption_pct, 100)}
            indicatorClassName={summary.absorption_alert ? 'bg-red-600' : 'bg-blue-900'}
          />
          {summary.absorption_alert && (
            <p className="text-xs text-red-700 mt-2">
              Realisasi telah melewati 80% dari nilai kontrak.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectFinancialSummary;
