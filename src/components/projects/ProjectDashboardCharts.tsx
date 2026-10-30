import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsAPI } from '@/api/endpoints';
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
} from 'recharts';
import { formatRupiahShort, formatRupiah } from '@/utils/formatters';
import type { UUID } from '@/types';

export interface ProjectDashboardChartsProps {
  projectId: UUID;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/**
 * Admin-only monthly expenses vs received payments for one project. Reads the
 * admin-only monthly report, so the parent must render it for admins only.
 */
const ProjectDashboardCharts = ({ projectId }: ProjectDashboardChartsProps) => {
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: rows, isLoading } = useQuery({
    queryKey: ['reports', 'monthly', { year, project_id: projectId }],
    queryFn: () => reportsAPI.getMonthly({ year, project_id: projectId }),
    select: (res) =>
      (res.data?.rows ?? []).map((r, i) => ({ ...r, label: MONTH_LABELS[i] ?? r.month })),
  });

  return (
    <Card className="border-none shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Pengeluaran vs Penerimaan per Bulan</h3>
          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50"
              onClick={() => setYear((y) => y - 1)}
              aria-label="Tahun sebelumnya"
            >
              ‹
            </button>
            <span className="font-medium w-12 text-center">{year}</span>
            <button
              type="button"
              className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50"
              onClick={() => setYear((y) => y + 1)}
              aria-label="Tahun berikutnya"
            >
              ›
            </button>
          </div>
        </div>
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Memuat...</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => formatRupiahShort(v)} tick={{ fontSize: 11 }} width={70} />
              <Tooltip formatter={(value: number) => formatRupiah(value)} />
              <Legend />
              <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#dc2626" radius={[4, 4, 0, 0]} />
              <Bar dataKey="penerimaan" name="Penerimaan" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectDashboardCharts;
