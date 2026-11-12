import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AgGridReact } from 'ag-grid-react';
import type { CellValueChangedEvent } from 'ag-grid-community';
import { Download, FileText, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { forecastSheetsAPI, invoicesAPI } from '@/api/endpoints';
import { appTheme } from '@/lib/agGridTheme';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import Select from '@/components/ui/select';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/use-toast';
import ExportFilenameDialog from '@/components/dialogs/operationals/ExportFilenameDialog';
import ForecastReportView from '@/components/reports/ForecastReportView';
import { defaultColDef } from '@/config/defaultColDef';
import {
  forecastExpenseColumnDefs,
  forecastInvoiceColumnDefs,
  forecastInvoiceDefaultColDef,
} from '@/config/forecastGridColumns';
import type {
  ForecastExpenseContext,
  ForecastInvoiceContext,
} from '@/components/ag-grid/cellRenderers/ForecastCellRenderers';
import {
  bulanLabel,
  computeForecastSummary,
  defaultSheetName,
  firstExpenseError,
  isDateInMonth,
  monthBounds,
  type ForecastExpenseRow,
} from '@/utils/forecast';
import { exportForecastToExcel, type ForecastReportData } from '@/utils/forecastExport';
import { exportToPDF } from '@/utils/exportUtils';
import { formatRupiah } from '@/utils/formatters';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { MONITORING_MONTH_NAMES } from '@/utils/invoiceMonitoring';
import type { ForecastSheet, ForecastSheetPayload, Invoice } from '@/types';

const now = new Date();
const currentBulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

const monthOptions = MONITORING_MONTH_NAMES.map((label, i) => ({
  value: String(i + 1).padStart(2, '0'),
  label,
}));
const yearOptions = Array.from({ length: 7 }, (_, i) => {
  const y = now.getFullYear() - 3 + i;
  return { value: String(y), label: String(y) };
});

const newRid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Math.random());

/** Today when it falls in the sheet's month, otherwise the 1st of that month. */
const defaultExpenseDate = (bulan: string): string => {
  const today = new Date().toISOString().slice(0, 10);
  return isDateInMonth(today, bulan) ? today : monthBounds(bulan).min;
};

type PendingAction = { kind: 'open'; id: string } | { kind: 'new' } | null;
type ExportKind = 'xlsx' | 'pdf' | null;

const Forecast = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const expenseGridRef = useRef<AgGridReact<ForecastExpenseRow> | null>(null);
  const invoiceGridRef = useRef<AgGridReact<Invoice> | null>(null);
  const reportRef = useRef<HTMLDivElement | null>(null);

  // The sheet being edited. Nothing reaches the server until Simpan.
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [nama, setNama] = useState(defaultSheetName(currentBulan));
  const [bulan, setBulan] = useState(currentBulan);
  const [saldo, setSaldo] = useState(0);
  const [expenses, setExpenses] = useState<ForecastExpenseRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());
  const [showPaid, setShowPaid] = useState(true);
  const [dirty, setDirty] = useState(false);

  const [pending, setPending] = useState<PendingAction>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [exportKind, setExportKind] = useState<ExportKind>(null);

  const [year, month] = bulan.split('-');

  const { data: sheets = [] } = useQuery({
    queryKey: ['forecast-sheets'],
    queryFn: () => forecastSheetsAPI.getAll({ all: true }),
    select: (res) => res.data?.forecast_sheets ?? [],
  });

  // Every unpaid invoice, whatever its month: the user decides which ones count.
  const { data: unpaid = [], isLoading: loadingUnpaid } = useQuery({
    queryKey: ['forecast-invoices', 'submit'],
    queryFn: () => invoicesAPI.getAll({ all: true, status: 'Submit' }),
    select: (res) => [...(res.data?.invoices ?? [])].sort((a, b) => a.tgl_tagihan.localeCompare(b.tgl_tagihan)),
  });

  // Invoices paid in the sheet's month: grey, information only.
  const { data: paid = [] } = useQuery({
    queryKey: ['forecast-invoices', 'kliring', bulan],
    queryFn: () => invoicesAPI.getAll({ all: true, status: 'Kliring', paid_month: bulan }),
    select: (res) => res.data?.invoices ?? [],
  });

  const invoiceRows = useMemo(() => (showPaid ? [...unpaid, ...paid] : unpaid), [unpaid, paid, showPaid]);

  const summary = useMemo(
    () => computeForecastSummary(saldo, expenses, unpaid, selectedIds),
    [saldo, expenses, unpaid, selectedIds],
  );

  const markDirty = useCallback(() => setDirty(true), []);

  // The suggested name follows the month until the user types their own.
  const changeBulan = (next: string) => {
    if (nama === defaultSheetName(bulan)) setNama(defaultSheetName(next));
    setBulan(next);
    markDirty();
  };

  const resetToNew = useCallback(() => {
    setSheetId(null);
    setNama(defaultSheetName(currentBulan));
    setBulan(currentBulan);
    setSaldo(0);
    setExpenses([]);
    setSelectedIds(new Set());
    setDirty(false);
  }, []);

  const applySheet = useCallback((sheet: ForecastSheet) => {
    setSheetId(sheet.id);
    setNama(sheet.nama);
    setBulan(sheet.bulan);
    setSaldo(sheet.saldo);
    setExpenses(
      sheet.expenses.map((e) => ({ rid: e.id, item: e.item, tanggal: e.tanggal.slice(0, 10), jumlah: e.jumlah })),
    );
    setSelectedIds(new Set(sheet.invoice_ids));
    setDirty(false);
  }, []);

  const openSheet = useCallback(
    async (id: string) => {
      try {
        const res = await forecastSheetsAPI.getById(id);
        applySheet(res.data.forecast_sheet);
      } catch (err) {
        toast({ title: 'Error', description: getErrorMessage(err, 'Gagal membuka sheet.'), variant: 'destructive' });
      }
    },
    [applySheet, toast],
  );

  // Switching sheets while there are unsaved changes asks first.
  const requestAction = (action: Exclude<PendingAction, null>) => {
    if (dirty) setPending(action);
    else void runAction(action);
  };
  const runAction = async (action: Exclude<PendingAction, null>) => {
    setPending(null);
    if (action.kind === 'new') resetToNew();
    else await openSheet(action.id);
  };

  const saveMutation = useMutation({
    mutationFn: (payload: ForecastSheetPayload) =>
      sheetId ? forecastSheetsAPI.update(sheetId, payload) : forecastSheetsAPI.create(payload),
    onSuccess: (res) => {
      applySheet(res.data.forecast_sheet);
      queryClient.invalidateQueries({ queryKey: ['forecast-sheets'] });
      toast({ title: 'Success', description: 'Sheet berhasil disimpan.', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Error', description: getErrorMessage(err, 'Gagal menyimpan sheet.'), variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => forecastSheetsAPI.delete(id),
    onSuccess: () => {
      setConfirmDelete(false);
      resetToNew();
      queryClient.invalidateQueries({ queryKey: ['forecast-sheets'] });
      toast({ title: 'Success', description: 'Sheet berhasil dihapus.', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Error', description: getErrorMessage(err, 'Gagal menghapus sheet.'), variant: 'destructive' });
    },
  });

  const handleSave = () => {
    if (!nama.trim()) {
      toast({ title: 'Error', description: 'Nama sheet wajib diisi.', variant: 'destructive' });
      return;
    }
    const problem = firstExpenseError(expenses, bulan);
    if (problem) {
      toast({ title: 'Error', description: problem, variant: 'destructive' });
      return;
    }
    saveMutation.mutate({
      nama: nama.trim(),
      bulan,
      saldo,
      expenses: expenses.map((e) => ({ item: e.item.trim(), tanggal: e.tanggal, jumlah: e.jumlah ?? 0 })),
      invoice_ids: unpaid.filter((i) => selectedIds.has(i.id)).map((i) => i.id),
    });
  };

  // --- expense grid -------------------------------------------------------
  const addRow = () => {
    const row: ForecastExpenseRow = { rid: newRid(), item: '', tanggal: defaultExpenseDate(bulan), jumlah: null };
    const index = expenses.length;
    setExpenses((prev) => [...prev, row]);
    markDirty();
    // Wait for the grid to receive the new row, then start typing in it.
    setTimeout(() => expenseGridRef.current?.api?.startEditingCell({ rowIndex: index, colKey: 'item' }), 60);
  };

  const onExpenseChanged = (e: CellValueChangedEvent<ForecastExpenseRow>) => {
    if (!e.data) return;
    const updated = { ...e.data };
    setExpenses((prev) => prev.map((r) => (r.rid === updated.rid ? updated : r)));
    markDirty();
  };

  const expenseContext = useMemo<ForecastExpenseContext>(
    () => ({
      bulan,
      onDelete: (rid) => {
        setExpenses((prev) => prev.filter((r) => r.rid !== rid));
        setDirty(true);
      },
    }),
    [bulan],
  );
  // Rows outside a newly chosen month turn red.
  useEffect(() => {
    expenseGridRef.current?.api?.refreshCells({ force: true });
  }, [bulan]);

  // --- invoice grid -------------------------------------------------------
  const invoiceContext = useMemo<ForecastInvoiceContext>(
    () => ({
      selectedIds,
      onToggle: (id, checked) => {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (checked) next.add(id);
          else next.delete(id);
          return next;
        });
        setDirty(true);
      },
    }),
    [selectedIds],
  );
  useEffect(() => {
    invoiceGridRef.current?.api?.refreshCells({ columns: ['tick'], force: true });
  }, [selectedIds]);

  const setAllTicked = (checked: boolean) => {
    setSelectedIds(checked ? new Set(unpaid.map((i) => i.id)) : new Set());
    setDirty(true);
  };

  // --- export -------------------------------------------------------------
  const reportData = useMemo<ForecastReportData>(
    () => ({
      nama: nama.trim() || 'Tanpa nama',
      bulan,
      expenses: expenses
        .filter((e) => e.item.trim() && e.jumlah && e.jumlah > 0)
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal)),
      invoices: unpaid.filter((i) => selectedIds.has(i.id)),
      summary,
    }),
    [nama, bulan, expenses, unpaid, selectedIds, summary],
  );

  const doExport = async (filename: string) => {
    if (exportKind === 'xlsx') await exportForecastToExcel(reportData, filename);
    else await exportToPDF(reportRef.current, filename);
  };

  const sheetOptions = sheets.map((s) => ({ value: s.id, label: `${s.nama} (${bulanLabel(s.bulan)})` }));
  const gridHeight = 360;

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Forecast Kas</h1>
          <p className="text-slate-500 mt-1">
            Lembar perkiraan pengeluaran dan pemasukan satu bulan. Hanya perkiraan: tidak mengubah invoice atau transaksi.
          </p>
        </div>

        {/* Sheet picker */}
        <Card className="border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-3 md:items-end">
              <div className="flex-1 max-w-xl">
                <Label>Sheet tersimpan</Label>
                <Select
                  options={sheetOptions}
                  value={sheetId ?? ''}
                  onChange={(v: string) => v && v !== sheetId && requestAction({ kind: 'open', id: v })}
                  placeholder={sheets.length ? 'Pilih sheet…' : 'Belum ada sheet tersimpan'}
                  clearable={false}
                  className="mt-1"
                />
              </div>
              <Button type="button" variant="outline" className="h-10" onClick={() => requestAction({ kind: 'new' })}>
                <Plus className="w-4 h-4 mr-2" />
                Sheet Baru
              </Button>
              {sheetId && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 text-red-600 hover:text-red-700"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sheet header */}
        <Card className="border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_11rem_7rem_14rem_auto] gap-3 items-end">
              <div>
                <Label htmlFor="forecast-nama">Nama sheet</Label>
                <Input
                  id="forecast-nama"
                  className="mt-1"
                  value={nama}
                  maxLength={255}
                  onChange={(e) => {
                    setNama(e.target.value);
                    markDirty();
                  }}
                />
              </div>
              <div>
                <Label>Bulan</Label>
                <Select
                  options={monthOptions}
                  value={month}
                  onChange={(v: string) => v && changeBulan(`${year}-${v}`)}
                  clearable={false}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Tahun</Label>
                <Select
                  options={yearOptions}
                  value={year}
                  onChange={(v: string) => v && changeBulan(`${v}-${month}`)}
                  clearable={false}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="forecast-saldo">Saldo</Label>
                <CurrencyInput
                  id="forecast-saldo"
                  className="mt-1"
                  value={saldo}
                  onChange={(v) => {
                    setSaldo(v === '' ? 0 : v);
                    markDirty();
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  className="bg-blue-900 hover:bg-blue-800 h-10"
                  disabled={saveMutation.isPending}
                  onClick={handleSave}
                >
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Simpan
                </Button>
                <Button type="button" variant="outline" className="h-10 px-3" title="Export Excel" aria-label="Export Excel" onClick={() => setExportKind('xlsx')}>
                  <Download className="w-4 h-4" />
                </Button>
                <Button type="button" variant="outline" className="h-10 px-3" title="Export PDF" aria-label="Export PDF" onClick={() => setExportKind('pdf')}>
                  <FileText className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {dirty && <p className="text-xs text-amber-600 mt-2">Ada perubahan yang belum disimpan.</p>}
          </CardContent>
        </Card>

        {/* Two tables side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Pengeluaran</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Klik dua kali untuk mengisi. Tanggal harus di {bulanLabel(bulan)}.
                  </p>
                </div>
                <Button type="button" size="sm" className="bg-blue-900 hover:bg-blue-800" onClick={addRow}>
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah Baris
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="ag-grid-wrapper" style={{ height: gridHeight, width: '100%' }}>
                <AgGridReact<ForecastExpenseRow>
                  theme={appTheme}
                  ref={expenseGridRef}
                  rowData={expenses}
                  columnDefs={forecastExpenseColumnDefs}
                  defaultColDef={defaultColDef}
                  context={expenseContext}
                  getRowId={(p) => p.data.rid}
                  onCellValueChanged={onExpenseChanged}
                  singleClickEdit
                  stopEditingWhenCellsLoseFocus
                  suppressCellFocus
                  overlayNoRowsTemplate="<span>Belum ada pengeluaran. Klik Tambah Baris.</span>"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Tagihan</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Centang tagihan belum dibayar yang diperkirakan cair di {bulanLabel(bulan)}. Baris abu-abu: sudah
                    dibayar bulan ini, hanya info.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => setAllTicked(true)} disabled={!unpaid.length}>
                    Pilih semua
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setAllTicked(false)} disabled={!selectedIds.size}>
                    Hapus pilihan
                  </Button>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-600 mt-2 w-fit cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-blue-900"
                  checked={showPaid}
                  onChange={(e) => setShowPaid(e.target.checked)}
                />
                Tampilkan yang sudah dibayar (abu-abu) — {paid.length} tagihan
              </label>
            </CardHeader>
            <CardContent className="p-0">
              <div className="ag-grid-wrapper" style={{ height: gridHeight, width: '100%' }}>
                <AgGridReact<Invoice>
                  theme={appTheme}
                  ref={invoiceGridRef}
                  rowData={invoiceRows}
                  columnDefs={forecastInvoiceColumnDefs}
                  defaultColDef={forecastInvoiceDefaultColDef}
                  context={invoiceContext}
                  getRowId={(p) => p.data.id}
                  rowClassRules={{ 'bg-slate-100 text-slate-400 italic': (p) => p.data?.status !== 'Submit' }}
                  loading={loadingUnpaid}
                  suppressCellFocus
                  tooltipShowDelay={200}
                  tooltipHideDelay={2000}
                  overlayNoRowsTemplate="<span>Tidak ada tagihan belum dibayar.</span>"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Ringkasan</h2>
          </CardHeader>
          <CardContent className="pt-4">
            <dl className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <dt className="text-slate-500">Saldo</dt>
                <dd className="font-semibold">{formatRupiah(summary.saldo)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Total Pengeluaran</dt>
                <dd className="font-semibold">{formatRupiah(summary.totalPengeluaran)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Total Pemasukan ({summary.invoiceCount} tagihan)</dt>
                <dd className="font-semibold">{formatRupiah(summary.totalPemasukan)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Selisih (+/−)</dt>
                <dd className={`font-semibold ${summary.selisih >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  {summary.selisih > 0 ? '+' : ''}
                  {formatRupiah(summary.selisih)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Saldo Akhir Perkiraan</dt>
                <dd className={`font-semibold ${summary.saldoAkhir >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  {formatRupiah(summary.saldoAkhir)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Print layout for the PDF export, kept off-screen. */}
      <div aria-hidden="true" style={{ position: 'fixed', left: -10000, top: 0 }}>
        <ForecastReportView ref={reportRef} data={reportData} />
      </div>

      <ExportFilenameDialog
        isOpen={exportKind !== null}
        onClose={() => setExportKind(null)}
        defaultFilename={`Forecast-${(nama.trim() || 'Sheet').replace(/[\\/:*?"<>|]/g, '-')}`}
        extension={exportKind === 'pdf' ? 'pdf' : 'xlsx'}
        onExport={doExport}
      />

      <ConfirmDialog
        open={pending !== null}
        title="Perubahan belum disimpan"
        message="Perubahan pada sheet ini akan hilang jika Anda pindah. Lanjutkan?"
        confirmText="Pindah"
        onCancel={() => setPending(null)}
        onConfirm={() => pending && void runAction(pending)}
      />
      <ConfirmDialog
        open={confirmDelete}
        title="Hapus sheet"
        message={`Sheet "${nama}" akan dihapus permanen. Invoice tidak terpengaruh.`}
        confirmText="Hapus"
        loading={deleteMutation.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => sheetId && deleteMutation.mutate(sheetId)}
      />
    </div>
  );
};

export default Forecast;
