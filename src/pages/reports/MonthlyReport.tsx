import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsAPI, projectsAPI } from '@/api/endpoints';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Select from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { ShieldAlert } from 'lucide-react';
import { formatRupiah, formatRupiahShort } from '@/utils/formatters';
import ProjectContractBadge from '@/components/projects/ProjectContractBadge';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 7 }, (_, i) => {
  const y = currentYear - 5 + i;
  return { value: String(y), label: String(y) };
});

/**
 * Admin-only. The route is gated by ProtectedRoute adminOnly and the endpoints
 * return 403 to anyone else. This page renders the server's figures as-is and
 * does not recompute any total or margin client-side.
 */
const MonthlyReport = () => {
  const [year, setYear] = useState(currentYear);
  const [projectId, setProjectId] = useState('');

  const { data: projects } = useQuery({
    queryKey: ['projects-all'],
    queryFn: () => projectsAPI.getAll({ all: true }),
    select: (res) => res.data?.projects ?? [],
  });

  const { data: monthly, isLoading: monthlyLoading } = useQuery({
    queryKey: ['reports', 'monthly', { year, project_id: projectId || undefined }],
    queryFn: () => reportsAPI.getMonthly({ year, project_id: projectId || undefined }),
    select: (res) => ({ rows: res.data?.rows ?? [], totals: res.data?.totals }),
  });

  const { data: summaries, isLoading: summaryLoading } = useQuery({
    queryKey: ['reports', 'projects-summary'],
    queryFn: () => reportsAPI.getProjectsSummary({ all: true }),
    select: (res) => res.data?.projects_summary ?? [],
  });

  const projectOptions = (projects ?? []).map((p) => ({ value: p.id, label: p.judul_pekerjaan }));
  const totals = monthly?.totals;

  const totalCards = [
    { label: 'Pengeluaran', value: totals?.pengeluaran },
    { label: 'Tagihan', value: totals?.tagihan },
    { label: 'Penerimaan', value: totals?.penerimaan },
    { label: 'Manajemen Fee', value: totals?.manajemen_fee },
    { label: 'Selisih (Penerimaan − Pengeluaran)', value: totals?.selisih },
  ];

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Laporan Bulanan</h1>
          <p className="text-slate-500 mt-1">
            Pengeluaran dan penerimaan pembayaran per bulan, serta sisa anggaran dan margin per proyek
          </p>
        </div>

        <Card className="border-none shadow-lg bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Khusus Internal</h3>
                <p className="text-sm text-slate-700">
                  Laporan ini hanya terlihat oleh administrator. Pengeluaran dihitung dari Transaksi per
                  bulan transaksi. Tagihan dihitung dari Invoice per bulan tagihan. Penerimaan dan
                  manajemen fee dihitung dari Invoice berstatus Clearing per bulan bayar. Server
                  menghitung semua angka.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl">
              <div>
                <Label>Tahun</Label>
                <Select
                  options={yearOptions}
                  value={String(year)}
                  onChange={(v: string) => setYear(Number(v))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Proyek</Label>
                <Select
                  options={projectOptions}
                  value={projectId}
                  onChange={setProjectId}
                  placeholder="Semua proyek"
                  className="mt-1"
                  clearable
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {totalCards.map((c) => (
            <Card key={c.label} className="border-none shadow-md">
              <CardContent className="pt-6">
                <p className="text-xs text-slate-500">{c.label}</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">
                  {c.value === undefined ? '-' : formatRupiah(c.value)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Pengeluaran vs Penerimaan {year}</h2>
          </CardHeader>
          <CardContent className="pt-6">
            {monthlyLoading ? (
              <div className="text-center py-8">Memuat...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthly?.rows.map((r, i) => ({ ...r, label: MONTH_NAMES[i].slice(0, 3) }))}>
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

        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Rincian per Bulan</h2>
          </CardHeader>
          <CardContent className="pt-6">
            {monthlyLoading ? (
              <div className="text-center py-8">Memuat...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bulan</TableHead>
                      <TableHead className="text-right">Pengeluaran</TableHead>
                      <TableHead className="text-right">Tagihan</TableHead>
                      <TableHead className="text-right">Penerimaan</TableHead>
                      <TableHead className="text-right">Manajemen Fee</TableHead>
                      <TableHead className="text-right">Selisih</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthly?.rows.map((row, i) => (
                      <TableRow key={row.month}>
                        <TableCell className="font-medium">{MONTH_NAMES[i]}</TableCell>
                        <TableCell className="text-right">{formatRupiah(row.pengeluaran)}</TableCell>
                        <TableCell className="text-right">{formatRupiah(row.tagihan)}</TableCell>
                        <TableCell className="text-right">{formatRupiah(row.penerimaan)}</TableCell>
                        <TableCell className="text-right">{formatRupiah(row.manajemen_fee)}</TableCell>
                        <TableCell className={`text-right ${row.selisih < 0 ? 'text-red-600' : ''}`}>
                          {formatRupiah(row.selisih)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  {totals && (
                    <TableFooter>
                      <TableRow>
                        <TableCell className="font-semibold">Total</TableCell>
                        <TableCell className="text-right font-semibold">{formatRupiah(totals.pengeluaran)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatRupiah(totals.tagihan)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatRupiah(totals.penerimaan)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatRupiah(totals.manajemen_fee)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatRupiah(totals.selisih)}</TableCell>
                      </TableRow>
                    </TableFooter>
                  )}
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Ringkasan Proyek</h2>
          </CardHeader>
          <CardContent className="pt-6">
            {summaryLoading ? (
              <div className="text-center py-8">Memuat...</div>
            ) : (summaries?.length ?? 0) === 0 ? (
              <div className="text-center py-8 text-slate-500">Belum ada proyek.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. SP2K</TableHead>
                      <TableHead>Proyek</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Nilai Pekerjaan</TableHead>
                      <TableHead className="text-right">Realisasi</TableHead>
                      <TableHead className="text-right">Sisa Anggaran</TableHead>
                      <TableHead className="text-right">Absorpsi</TableHead>
                      <TableHead className="text-right">Total Invoice</TableHead>
                      <TableHead className="text-right">Penerimaan</TableHead>
                      <TableHead className="text-right">Profit Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summaries?.map((s) => (
                      <TableRow key={s.project_id}>
                        <TableCell>{s.no_sp2k}</TableCell>
                        <TableCell className="font-medium">{s.judul_pekerjaan}</TableCell>
                        <TableCell>
                          <ProjectContractBadge
                            project={{ contract_status: s.contract_status, ending_soon: false, days_remaining: 0 }}
                          />
                        </TableCell>
                        <TableCell className="text-right">{formatRupiah(s.nilai_pekerjaan)}</TableCell>
                        <TableCell className="text-right">{formatRupiah(s.total_realisasi)}</TableCell>
                        <TableCell className="text-right">{formatRupiah(s.remaining_budget)}</TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center gap-2">
                            {s.absorption_pct.toFixed(1)}%
                            {s.absorption_alert && (
                              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                                &gt; 80%
                              </Badge>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{formatRupiah(s.total_invoice)}</TableCell>
                        <TableCell className="text-right">{formatRupiah(s.total_clearing)}</TableCell>
                        <TableCell className="text-right">{formatRupiah(s.profit_margin)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonthlyReport;
