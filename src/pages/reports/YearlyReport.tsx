import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsAPI, projectsAPI } from '@/api/endpoints';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { Download, Settings, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatRupiah, formatRupiahShort } from '@/utils/formatters';
import { exportToExcel, type ExportColumn } from '@/utils/exportUtils';
import ColumnSettingsDialog from '@/components/dialogs/operationals/ColumnSettingsDialog';
import ExportFilenameDialog from '@/components/dialogs/operationals/ExportFilenameDialog';
import type { MonthlyReportTotals } from '@/types';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

type ChartMode = 'separate' | 'combined';

type ValueKey = keyof MonthlyReportTotals;

/** Columns of the Rincian per Bulan table, in display order. Bulan is always shown. */
const DETAIL_COLUMNS: { key: ValueKey; label: string }[] = [
  { key: 'pengeluaran', label: 'Pengeluaran Proyek' },
  { key: 'operasional', label: 'Beban Operasional' },
  { key: 'total_pengeluaran', label: 'Total Pengeluaran' },
  { key: 'tagihan', label: 'Tagihan' },
  { key: 'penerimaan', label: 'Penerimaan' },
  { key: 'manajemen_fee', label: 'Manajemen Fee' },
  { key: 'selisih', label: 'Selisih' },
];

const ALL_COLUMN_KEYS = DETAIL_COLUMNS.map((c) => c.key);
const COLUMNS_STORAGE_KEY = 'yearly_report_columns';

/** Reads the saved column choice; anything missing or invalid falls back to all columns. */
const loadVisibleColumns = (): ValueKey[] => {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(COLUMNS_STORAGE_KEY) ?? 'null');
    if (Array.isArray(saved)) {
      const valid = ALL_COLUMN_KEYS.filter((k) => saved.includes(k));
      if (valid.length > 0) return valid;
    }
  } catch {
    // fall through to the default
  }
  return ALL_COLUMN_KEYS;
};

const RUPIAH_FORMAT = '"Rp" #,##0;[Red]-"Rp" #,##0';

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
const YearlyReport = () => {
  const [year, setYear] = useState(currentYear);
  const [projectId, setProjectId] = useState('');
  const [chartMode, setChartMode] = useState<ChartMode>('separate');
  const [visibleColumns, setVisibleColumns] = useState<ValueKey[]>(loadVisibleColumns);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // The table and the export both read this one list, so they cannot differ.
  const shownColumns = useMemo(
    () => DETAIL_COLUMNS.filter((c) => visibleColumns.includes(c.key)),
    [visibleColumns],
  );

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

  const { data: operationalSummary } = useQuery({
    queryKey: ['reports', 'operational-summary', { year }],
    queryFn: () => reportsAPI.getOperationalSummary({ year }),
    select: (res) => res.data,
    enabled: !projectId,
  });

  const projectOptions = (projects ?? []).map((p) => ({ value: p.id, label: p.judul_pekerjaan }));
  const totals = monthly?.totals;

  const exportDetail = async (filename: string) => {
    const rows = monthly?.rows ?? [];
    if (rows.length === 0 || !totals) throw new Error('Tidak ada data untuk diekspor');

    type Line = { bulan: string } & Partial<Record<ValueKey, number>>;
    const lines: Line[] = rows.map((r, i) => ({ bulan: MONTH_NAMES[i], ...r }));
    lines.push({ bulan: 'Total', ...totals });

    const columns: ExportColumn<Line>[] = [
      { header: 'Bulan', key: 'bulan', width: 16 },
      ...shownColumns.map((c) => ({
        header: c.label,
        key: c.key,
        width: 22,
        accessor: (line: Line) => line[c.key] ?? 0,
        numFmt: RUPIAH_FORMAT,
      })),
    ];
    await exportToExcel(lines, columns, filename, `Laporan ${year}`, { boldLastRow: true });
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Laporan Tahunan</h1>
          <p className="text-slate-500 mt-1">
            Pengeluaran (proyek dan operasional) dan penerimaan pembayaran per bulan
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
                  Laporan ini hanya terlihat oleh administrator. Pengeluaran Proyek dihitung dari Transaksi
                  per bulan transaksi; Beban Operasional dari pengeluaran di luar proyek. Filter Proyek
                  hanya menampilkan Pengeluaran Proyek, sehingga Beban Operasional tidak ikut dihitung. Tagihan dihitung dari Invoice per bulan tagihan. Penerimaan dan
                  manajemen fee dihitung dari Invoice berstatus Kliring per bulan bayar. Server
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

        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900">Pengeluaran vs Penerimaan {year}</h2>
              <div className="inline-flex rounded-md border border-slate-200 p-0.5">
                {(
                  [
                    { value: 'separate', label: 'Terpisah' },
                    { value: 'combined', label: 'Gabungan' },
                  ] as const
                ).map((o) => (
                  <Button
                    key={o.value}
                    type="button"
                    size="sm"
                    variant={chartMode === o.value ? 'default' : 'ghost'}
                    className={chartMode === o.value ? 'bg-blue-900 hover:bg-blue-800' : ''}
                    onClick={() => setChartMode(o.value)}
                  >
                    {o.label}
                  </Button>
                ))}
              </div>
            </div>
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
                  <Tooltip
                    formatter={(value: number) => formatRupiah(value)}
                    contentStyle={{ fontSize: 11, padding: '6px 8px', borderRadius: 6 }}
                    labelStyle={{ fontSize: 11, fontWeight: 600, marginBottom: 2 }}
                    itemStyle={{ fontSize: 11, paddingTop: 1, paddingBottom: 1 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} iconSize={10} />
                  {chartMode === 'separate' ? (
                    <>
                      <Bar dataKey="pengeluaran" name="Pengeluaran Proyek" stackId="biaya" fill="#dc2626" />
                      <Bar
                        dataKey="operasional"
                        name="Beban Operasional"
                        stackId="biaya"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                      />
                    </>
                  ) : (
                    <Bar
                      dataKey="total_pengeluaran"
                      name="Total Pengeluaran"
                      fill="#dc2626"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                  <Bar dataKey="penerimaan" name="Penerimaan" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900">Rincian per Bulan</h2>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Atur kolom"
                  title="Atur kolom"
                  onClick={() => setShowColumnSettings(true)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Export"
                  title="Export"
                  disabled={monthlyLoading || !totals}
                  onClick={() => setShowExport(true)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
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
                      {shownColumns.map((c) => (
                        <TableHead key={c.key} className="text-right">
                          {c.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthly?.rows.map((row, i) => (
                      <TableRow key={row.month}>
                        <TableCell className="font-medium">{MONTH_NAMES[i]}</TableCell>
                        {shownColumns.map((c) => (
                          <TableCell
                            key={c.key}
                            className={`text-right whitespace-nowrap ${c.key === 'selisih' && row.selisih < 0 ? 'text-red-600' : ''}`}
                          >
                            {formatRupiah(row[c.key])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                  {totals && (
                    <TableFooter>
                      <TableRow>
                        <TableCell className="font-semibold">Total</TableCell>
                        {shownColumns.map((c) => (
                          <TableCell
                            key={c.key}
                            className={`text-right font-semibold whitespace-nowrap ${c.key === 'selisih' && totals.selisih < 0 ? 'text-red-600' : ''}`}
                          >
                            {formatRupiah(totals[c.key])}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableFooter>
                  )}
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {!projectId && (
          <Card className="border-none shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Beban Operasional per Jenis {year}</h2>
            </CardHeader>
            <CardContent className="pt-6">
              {(operationalSummary?.rows.length ?? 0) === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  Belum ada beban operasional pada tahun ini.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jenis Beban</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operationalSummary?.rows.map((r) => (
                      <TableRow key={r.operational_cost_type_id}>
                        <TableCell className="font-medium">{r.nama_biaya}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">{formatRupiah(r.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="font-semibold">Total</TableCell>
                      <TableCell className="text-right font-semibold whitespace-nowrap">
                        {formatRupiah(operationalSummary?.total ?? 0)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <ColumnSettingsDialog
        isOpen={showColumnSettings}
        onClose={() => setShowColumnSettings(false)}
        columns={DETAIL_COLUMNS}
        selected={visibleColumns}
        onSave={(keys) => {
          setVisibleColumns(keys as ValueKey[]);
          setShowColumnSettings(false);
        }}
      />

      <ExportFilenameDialog
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        defaultFilename={`Laporan-Tahunan-${year}`}
        onExport={exportDetail}
      />
    </div>
  );
};

export default YearlyReport;
