import { useQuery } from '@tanstack/react-query';
import { projectReportsAPI } from '@/api/endpoints';
import { Card, CardContent } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatRupiahShort, formatRupiah } from '@/utils/formatters';
import type { UUID } from '@/types';

export interface ProjectDashboardChartsProps {
  projectId: UUID;
}

const SLA_COLORS: Record<string, string> = {
  on_time: '#16a34a',
  h_plus_1: '#d97706',
  late: '#dc2626',
  no_data: '#94a3b8',
};

const SLA_LABELS: Record<string, string> = {
  on_time: 'Tepat Waktu',
  h_plus_1: 'H+1',
  late: 'Terlambat',
  no_data: 'Tidak Ada Data',
};

const ProjectDashboardCharts = ({ projectId }: ProjectDashboardChartsProps) => {
  const { data: trend, isLoading: trendLoading } = useQuery({
    queryKey: ['project-budget-trend', projectId],
    queryFn: () => projectReportsAPI.getBudgetTrend(projectId),
    select: (res) => res.data?.budget_trend ?? [],
  });

  const { data: sla, isLoading: slaLoading } = useQuery({
    queryKey: ['project-sla-breakdown', projectId],
    queryFn: () => projectReportsAPI.getSLABreakdown(projectId),
    select: (res) => res.data?.sla_breakdown ?? {},
  });

  const slaData = Object.entries(sla ?? {})
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({ status, count, label: SLA_LABELS[status] ?? status }));

  const hasTrend = (trend?.length ?? 0) > 0;
  const hasSLA = slaData.length > 0;

  if (trendLoading || slaLoading) {
    return <div className="text-center py-12 text-slate-500">Memuat...</div>;
  }

  if (!hasTrend && !hasSLA) {
    return (
      <div className="text-center py-12 text-slate-500">
        Grafik tren anggaran dan SLA akan muncul di sini setelah item anggaran dan transaksi tersedia
        untuk proyek ini.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="border-none shadow-md">
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Anggaran vs Realisasi</h3>
          {hasTrend ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => formatRupiahShort(v)} tick={{ fontSize: 11 }} width={70} />
                <Tooltip formatter={(value: number) => formatRupiah(value)} />
                <Legend />
                <Bar dataKey="anggaran" name="Anggaran" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="realisasi" name="Realisasi" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">Belum ada data anggaran.</div>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-md">
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">SLA Pembayaran</h3>
          {hasSLA ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={slaData}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {slaData.map((entry) => (
                    <Cell key={entry.status} fill={SLA_COLORS[entry.status] ?? '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">Belum ada transaksi.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDashboardCharts;
