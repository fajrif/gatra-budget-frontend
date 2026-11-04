import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invoicesAPI, projectGroupsAPI, projectsAPI } from '@/api/endpoints';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Select from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, Search } from 'lucide-react';
import ExportFilenameDialog from '@/components/dialogs/operationals/ExportFilenameDialog';
import InvoiceDetailDialog from '@/components/dialogs/reports/InvoiceDetailDialog';
import { invoiceStatusBadgeClasses } from '@/config/invoicesGridColumns';
import type { Invoice } from '@/types';
import { exportToExcel, type ExportColumn } from '@/utils/exportUtils';
import { formatDate, formatRupiah } from '@/utils/formatters';
import {
  buildGroupedOptions,
  buildMonitoringLines,
  parseMonitoringFilter,
  toDMY,
  type MonitoringLine,
} from '@/utils/invoiceMonitoring';

const RUPIAH_FORMAT = '"Rp" #,##0;[Red]-"Rp" #,##0';
const RED_ARGB = 'FFDC2626';

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 7 }, (_, i) => {
  const y = currentYear - 5 + i;
  return { value: String(y), label: String(y) };
});

type ExportLine = {
  bulan: string;
  outsideYear: boolean;
  noInvoice: string;
  periode: string;
  mismatch: boolean;
  tglTagihan: string;
  tglBayar: string;
  nilai: number | '';
  status: string;
};

const InvoiceMonitoring = () => {
  const [year, setYear] = useState(currentYear);
  const [selection, setSelection] = useState('');
  // The table loads only when "Cari" is pressed, and shows exactly what was searched
  // (changing the filters afterwards does not touch it until the next search).
  const [searched, setSearched] = useState<{ year: number; selection: string } | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [detail, setDetail] = useState<Invoice | null>(null);

  const filter = searched ? parseMonitoringFilter(searched.selection) : null;

  const { data: groups } = useQuery({
    queryKey: ['project-groups-all'],
    queryFn: () => projectGroupsAPI.getAll({ all: true }),
    select: (res) => res.data?.project_groups ?? [],
  });

  const { data: projects } = useQuery({
    queryKey: ['projects-all'],
    queryFn: () => projectsAPI.getAll({ all: true }),
    select: (res) => res.data?.projects ?? [],
  });

  const { data: invoices, isFetching, refetch } = useQuery({
    queryKey: ['reports', 'invoice-monitoring', searched],
    enabled: searched !== null,
    queryFn: () =>
      invoicesAPI.getAll({
        all: true,
        periode_year: searched?.year,
        project_group_id: filter?.kind === 'group' ? filter.id : undefined,
        project_id: filter?.kind === 'project' ? filter.id : undefined,
      }),
    select: (res) => res.data?.invoices ?? [],
  });

  const options = useMemo(
    () => buildGroupedOptions(groups ?? [], projects ?? []),
    [groups, projects],
  );
  const reportYear = searched?.year ?? year;
  const { lines, total, paid, unpaid, invoiceCount } = useMemo(
    () => buildMonitoringLines(invoices ?? [], reportYear),
    [invoices, reportYear],
  );
  const groupNameOf = (inv: Invoice | null) =>
    (groups ?? []).find((g) => g.id === inv?.project?.project_group_id)?.nama ?? null;

  const exportExcel = async (filename: string) => {
    const data: ExportLine[] = lines.map((l: MonitoringLine) => ({
      bulan: l.bulan,
      outsideYear: l.outsideYear,
      noInvoice: l.invoice?.no_invoice ?? '-',
      periode: l.periodeText,
      mismatch: l.periodeMismatch,
      tglTagihan: toDMY(l.invoice?.tgl_tagihan) || '-',
      tglBayar: l.invoice ? toDMY(l.invoice.tgl_bayar) || '-' : '-',
      nilai: l.invoice ? Number(l.invoice.nilai) : '',
      status: l.invoice?.status ?? '-',
    }));
    const totalLine = (bulan: string, nilai: number): ExportLine => ({
      bulan,
      outsideYear: false,
      noInvoice: '',
      periode: '',
      mismatch: false,
      tglTagihan: '',
      tglBayar: '',
      nilai,
      status: '',
    });
    data.push(
      totalLine('Total', total),
      totalLine('Total Dibayarkan', paid),
      totalLine('Total Belum Dibayar', unpaid),
    );

    const baseColumns: ExportColumn<ExportLine>[] = [
      { header: 'Bulan', key: 'bulan', width: 22 },
      { header: 'No. Invoice', key: 'noInvoice', width: 22 },
      {
        header: 'Periode Tagihan',
        key: 'periode',
        width: 22,
        fontColorWhen: (l) => (l.mismatch ? RED_ARGB : undefined),
      },
      { header: 'Tgl Tagihan', key: 'tglTagihan', width: 14 },
      { header: 'Tgl Bayar', key: 'tglBayar', width: 14 },
      {
        header: 'Nilai Tagihan',
        key: 'nilai',
        width: 22,
        numFmt: RUPIAH_FORMAT,
        fontColorWhen: (l) => (l.bulan === 'Total Belum Dibayar' && l.nilai ? RED_ARGB : undefined),
      },
      { header: 'Status Tagihan', key: 'status', width: 16 },
    ];
    const columns = baseColumns.map((c) => ({ ...c, italicWhen: (l: ExportLine) => l.outsideYear }));
    await exportToExcel(data, columns, filename, `Monitoring ${reportYear}`, { boldLastRows: 3 });
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Monitoring Invoice</h1>
          <p className="text-slate-500 mt-1">
            Invoice per bulan tagihan untuk satu Group Proyek atau proyek, Januari sampai Desember
          </p>
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-[10rem_1fr_auto] gap-3 max-w-3xl items-end">
              <div>
                <Label>Tahun</Label>
                <Select
                  options={yearOptions}
                  value={String(year)}
                  onChange={(v: string) => v && setYear(Number(v))}
                  clearable={false}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Group Proyek / Proyek</Label>
                <Select
                  options={options}
                  value={selection}
                  onChange={setSelection}
                  placeholder="Semua proyek"
                  className="mt-1"
                  clearable
                />
              </div>
              <Button
                type="button"
                className="bg-blue-900 hover:bg-blue-800 h-10"
                disabled={isFetching}
                onClick={() => {
                  const next = { year, selection };
                  // Same search again: refetch instead of waiting for a key change.
                  if (searched && searched.year === next.year && searched.selection === next.selection) {
                    void refetch();
                  } else {
                    setSearched(next);
                  }
                }}
              >
                <Search className="w-4 h-4 mr-2" />
                Cari
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Rincian per Bulan</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tahun mengikuti periode tagihan. Invoice ditempatkan pada bulan tanggal tagihannya;{' '}
                  <span className="italic">baris miring</span> berarti ditagih di luar tahun itu.{' '}
                  <span className="text-red-600">Periode merah</span> berarti periode tagihan tidak
                  sama dengan bulan tagihnya.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Export"
                title="Export"
                disabled={!searched || isFetching}
                onClick={() => setShowExport(true)}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {!searched ? (
              <div className="text-center py-8 text-slate-500">
                Pilih tahun dan Group Proyek / Proyek, lalu klik Cari untuk menampilkan invoice.
              </div>
            ) : isFetching ? (
              <div className="text-center py-8">Memuat...</div>
            ) : (
              <div className="overflow-x-auto">
                {invoiceCount === 0 && (
                  <div className="text-center pb-4 text-slate-500">
                    Belum ada invoice dengan periode tagihan tahun {reportYear}
                    {filter ? ' untuk pilihan ini' : ''}.
                  </div>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bulan</TableHead>
                      <TableHead>No. Invoice</TableHead>
                      <TableHead>Periode Tagihan</TableHead>
                      <TableHead>Tgl Tagihan</TableHead>
                      <TableHead>Tgl Bayar</TableHead>
                      <TableHead className="text-right">Nilai Tagihan</TableHead>
                      <TableHead>Status Tagihan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line) => {
                      const inv = line.invoice;
                      return (
                        <TableRow key={line.key} className={line.outsideYear ? 'italic' : undefined}>
                          <TableCell className="font-medium whitespace-nowrap">{line.bulan}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {inv ? (
                              <Tooltip content={inv.nama_invoice} className="justify-start">
                                <button
                                  type="button"
                                  className="text-blue-700 hover:underline cursor-pointer"
                                  onClick={() => setDetail(inv)}
                                >
                                  {inv.no_invoice}
                                </button>
                              </Tooltip>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell
                            className={`whitespace-nowrap ${line.periodeMismatch ? 'text-red-600 font-medium' : ''} ${inv ? '' : 'text-slate-400'}`}
                          >
                            {line.periodeText}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {inv ? formatDate(inv.tgl_tagihan) : <span className="text-slate-400">-</span>}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {inv?.tgl_bayar ? formatDate(inv.tgl_bayar) : <span className="text-slate-400">-</span>}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {inv ? formatRupiah(inv.nilai) : <span className="text-slate-400">-</span>}
                          </TableCell>
                          <TableCell>
                            {inv ? (
                              <span
                                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${invoiceStatusBadgeClasses[inv.status]?.bg ?? ''} ${invoiceStatusBadgeClasses[inv.status]?.text ?? ''} ${invoiceStatusBadgeClasses[inv.status]?.border ?? ''}`}
                              >
                                {inv.status}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={5} className="font-semibold">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-semibold whitespace-nowrap">
                        {formatRupiah(total)}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={5} className="font-semibold">
                        Total Dibayarkan
                      </TableCell>
                      <TableCell className="text-right font-semibold whitespace-nowrap">
                        {formatRupiah(paid)}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={5} className="font-semibold text-red-600">
                        Total Belum Dibayar
                      </TableCell>
                      <TableCell className="text-right font-semibold whitespace-nowrap text-red-600">
                        {formatRupiah(unpaid)}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <InvoiceDetailDialog
        isOpen={detail !== null}
        onClose={() => setDetail(null)}
        invoice={detail}
        groupName={groupNameOf(detail)}
      />

      <ExportFilenameDialog
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        defaultFilename={`Monitoring-Invoice-${reportYear}`}
        onExport={exportExcel}
      />
    </div>
  );
};

export default InvoiceMonitoring;
