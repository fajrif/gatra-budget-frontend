import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AgGridReact } from 'ag-grid-react';
import type { CellValueChangedEvent } from 'ag-grid-community';
import { ArrowLeft, Check, Download, FileText, GripVertical, Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { forecastSheetsAPI, invoicesAPI } from '@/api/endpoints';
import { appTheme } from '@/lib/agGridTheme';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ActionMenu from '@/components/ui/ActionMenu';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
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

type SummaryPosition = 'top' | 'bottom';
const SUMMARY_POSITION_KEY = 'forecast-summary-position';

const readSummaryPosition = (): SummaryPosition => {
  try {
    return localStorage.getItem(SUMMARY_POSITION_KEY) === 'top' ? 'top' : 'bottom';
  } catch {
    return 'bottom';
  }
};

/** Dashed target shown while Ringkasan is being dragged. */
const SummaryDropZone = ({
  over,
  onOver,
  onLeave,
  onDrop,
}: {
  over: boolean;
  onOver: () => void;
  onLeave: () => void;
  onDrop: () => void;
}) => (
  <div
    onDragOver={(e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      onOver();
    }}
    onDragLeave={onLeave}
    onDrop={(e) => {
      e.preventDefault();
      onDrop();
    }}
    className={`rounded-lg border-2 border-dashed px-4 py-6 text-center text-sm transition-colors ${
      over ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-300 text-slate-400'
    }`}
  >
    Drop Ringkasan di sini
  </div>
);

const newRid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Math.random());

/** Today when it falls in the sheet's month, otherwise the 1st of that month. */
const defaultExpenseDate = (bulan: string): string => {
  const today = new Date().toISOString().slice(0, 10);
  return isDateInMonth(today, bulan) ? today : monthBounds(bulan).min;
};

type ExportKind = 'xlsx' | 'pdf' | null;

const toRows = (sheet: ForecastSheet): ForecastExpenseRow[] =>
  sheet.expenses.map((e) => ({ rid: e.id, item: e.item, tanggal: e.tanggal.slice(0, 10), jumlah: e.jumlah }));

/** Page of one sheet: loads it by id, then hands it to the editor. */
const ForecastDetail = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // The editor copies the sheet into local state once, so never refetch behind its back;
  // gcTime 0 makes every visit start from what is stored.
  const { data: sheet, isLoading, isError } = useQuery({
    queryKey: ['forecast-sheet', id],
    queryFn: () => forecastSheetsAPI.getById(id),
    select: (res) => res.data.forecast_sheet,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
    retry: false,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }
  if (isError || !sheet) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-600">Sheet tidak ditemukan.</p>
        <Button type="button" variant="outline" onClick={() => navigate('/reports/forecast')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke daftar
        </Button>
      </div>
    );
  }
  return <ForecastEditor key={sheet.id} sheet={sheet} />;
};

const ForecastEditor = ({ sheet }: { sheet: ForecastSheet }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const expenseGridRef = useRef<AgGridReact<ForecastExpenseRow> | null>(null);
  const invoiceGridRef = useRef<AgGridReact<Invoice> | null>(null);
  const reportRef = useRef<HTMLDivElement | null>(null);

  // The sheet being edited. Nothing reaches the server until Simpan.
  const sheetId = sheet.id;
  const [nama, setNama] = useState(sheet.nama);
  // The month never changes after creation: expense dates are validated against it.
  const bulan = sheet.bulan;
  const [saldo, setSaldo] = useState(sheet.saldo);
  const [expenses, setExpenses] = useState<ForecastExpenseRow[]>(() => toRows(sheet));
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(() => new Set(sheet.invoice_ids));
  const [showPaid, setShowPaid] = useState(true);

  // Ringkasan can be dragged above or below the two tables; the choice is remembered in this browser.
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const [summaryPos, setSummaryPos] = useState<SummaryPosition>(readSummaryPosition);
  const [draggingSummary, setDraggingSummary] = useState(false);
  const [dropOver, setDropOver] = useState<SummaryPosition | null>(null);
  const moveSummary = (pos: SummaryPosition) => {
    setSummaryPos(pos);
    try {
      localStorage.setItem(SUMMARY_POSITION_KEY, pos);
    } catch {
      /* private mode: the position just is not remembered */
    }
  };
  const endSummaryDrag = () => {
    setDraggingSummary(false);
    setDropOver(null);
  };
  const [dirty, setDirty] = useState(false);

  // In-place rename. It is saved on its own, against the last saved copy, so unsaved edits stay a draft.
  const savedRef = useRef<ForecastSheet>(sheet);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [exportKind, setExportKind] = useState<ExportKind>(null);

  const [year, month] = bulan.split('-');
  const monthName = MONITORING_MONTH_NAMES[Number(month) - 1] ?? month;

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

  // Unpaid and paid (grey) invoices are merged first, then sorted by billing date, oldest on top.
  const invoiceRows = useMemo(
    () =>
      [...(showPaid ? [...unpaid, ...paid] : unpaid)].sort(
        (a, b) => a.tgl_tagihan.localeCompare(b.tgl_tagihan) || a.no_invoice.localeCompare(b.no_invoice),
      ),
    [unpaid, paid, showPaid],
  );

  const summary = useMemo(
    () => computeForecastSummary(saldo, expenses, unpaid, selectedIds),
    [saldo, expenses, unpaid, selectedIds],
  );

  const markDirty = useCallback(() => setDirty(true), []);

  // Leaving with unsaved changes asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const goBack = () => {
    if (dirty) setConfirmLeave(true);
    else navigate('/reports/forecast');
  };

  const renameMutation = useMutation({
    mutationFn: (newName: string) => {
      const saved = savedRef.current;
      return forecastSheetsAPI.update(sheetId, {
        nama: newName,
        bulan: saved.bulan,
        saldo: saved.saldo,
        expenses: saved.expenses.map((e) => ({ item: e.item, tanggal: e.tanggal.slice(0, 10), jumlah: e.jumlah })),
        invoice_ids: saved.invoice_ids,
      });
    },
    onSuccess: (res) => {
      savedRef.current = res.data.forecast_sheet;
      setNama(res.data.forecast_sheet.nama);
      setEditingName(false);
      queryClient.invalidateQueries({ queryKey: ['forecast-sheets'] });
      toast({ title: 'Success', description: 'Nama sheet diubah.', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Error', description: getErrorMessage(err, 'Gagal mengubah nama sheet.'), variant: 'destructive' });
    },
  });

  const startRename = () => {
    setNameDraft(nama);
    setEditingName(true);
  };
  const commitRename = () => {
    const next = nameDraft.trim();
    if (!next) {
      toast({ title: 'Error', description: 'Nama sheet wajib diisi.', variant: 'destructive' });
      return;
    }
    if (next === nama) setEditingName(false);
    else renameMutation.mutate(next);
  };

  const deleteMutation = useMutation({
    mutationFn: () => forecastSheetsAPI.delete(sheetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-sheets'] });
      toast({ title: 'Success', description: 'Sheet berhasil dihapus.', variant: 'success' });
      navigate('/reports/forecast');
    },
    onError: (err) => {
      setConfirmDelete(false);
      toast({ title: 'Error', description: getErrorMessage(err, 'Gagal menghapus sheet.'), variant: 'destructive' });
    },
  });

  const saveMutation = useMutation({
    mutationFn: (payload: ForecastSheetPayload) => forecastSheetsAPI.update(sheetId, payload),
    onSuccess: (res) => {
      const saved = res.data.forecast_sheet;
      setNama(saved.nama);
      savedRef.current = saved;
      setSaldo(saved.saldo);
      setExpenses(toRows(saved));
      setSelectedIds(new Set(saved.invoice_ids));
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: ['forecast-sheets'] });
      toast({ title: 'Success', description: 'Sheet berhasil disimpan.', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Error', description: getErrorMessage(err, 'Gagal menyimpan sheet.'), variant: 'destructive' });
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

  const gridHeight = 360;

  // --- summary (draggable between the top and the bottom of the page) ---------
  const dropZone = (pos: SummaryPosition) =>
    draggingSummary ? (
      <SummaryDropZone
        over={dropOver === pos}
        onOver={() => setDropOver(pos)}
        onLeave={() => setDropOver((cur) => (cur === pos ? null : cur))}
        onDrop={() => {
          moveSummary(pos);
          endSummaryDrag();
        }}
      />
    ) : null;

  const summaryCard = (
    <div ref={summaryRef}>
      <Card className="border-none shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              draggable
              title="Drag untuk memindah Ringkasan ke atas atau bawah (atau tekan panah atas/bawah)"
              aria-label="Pindahkan Ringkasan: drag & drop, atau tekan panah atas/bawah"
              className="p-1 -ml-1 rounded cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', 'forecast-summary');
                if (summaryRef.current) e.dataTransfer.setDragImage(summaryRef.current, 24, 24);
                // Show the drop targets after the browser has taken the drag image.
                setTimeout(() => setDraggingSummary(true), 0);
              }}
              onDragEnd={endSummaryDrag}
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  moveSummary('top');
                } else if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  moveSummary('bottom');
                }
              }}
            >
              <GripVertical className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-semibold text-slate-900">Ringkasan</h2>
          </div>
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
  );

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Daftar Perkiraan Kas (Forecast)
            </button>
            <h1 className="text-xl font-semibold text-slate-900">{nama.trim() || 'Perkiraan Kas'}</h1>
            <p className="text-slate-500 mt-1">
              Perkiraan {bulanLabel(bulan)}. Sheet ini tidak mengubah data invoice atau transaksi.
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            className="shrink-0 bg-red-600 hover:bg-red-700 text-white"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Hapus Sheet
          </Button>
        </div>

        {/* Sheet header */}
        <Card className="border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_8rem_5rem_14rem_auto] gap-3 items-end">
              <div>
                <span className="text-sm font-medium text-slate-500">Nama sheet</span>
                {editingName ? (
                  <div className="flex items-center gap-1 mt-1">
                    <Input
                      aria-label="Nama sheet"
                      value={nameDraft}
                      maxLength={255}
                      autoFocus
                      onChange={(e) => setNameDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename();
                        if (e.key === 'Escape') setEditingName(false);
                      }}
                    />
                    <Button
                      type="button"
                      className="h-10 px-3 bg-green-600 hover:bg-green-700"
                      title="Simpan nama"
                      aria-label="Simpan nama"
                      disabled={renameMutation.isPending}
                      onClick={commitRename}
                    >
                      {renameMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 px-3"
                      title="Batal"
                      aria-label="Batal"
                      disabled={renameMutation.isPending}
                      onClick={() => setEditingName(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1 h-10">
                    <span className="font-semibold text-slate-900 truncate" title={nama}>
                      {nama}
                    </span>
                    <button
                      type="button"
                      onClick={startRename}
                      title="Ubah nama sheet"
                      aria-label="Ubah nama sheet"
                      className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <span className="text-sm font-medium text-slate-500">Bulan</span>
                <div className="mt-1 h-10 flex items-center font-semibold text-slate-900">{monthName}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-500">Tahun</span>
                <div className="mt-1 h-10 flex items-center font-semibold text-slate-900">{year}</div>
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
                <ActionMenu
                  label="Report"
                  icon={<FileText className="w-4 h-4" />}
                  items={[
                    { label: 'Export Excel', icon: <Download className="w-4 h-4" />, onClick: () => setExportKind('xlsx') },
                    { label: 'Export PDF', icon: <FileText className="w-4 h-4" />, onClick: () => setExportKind('pdf') },
                  ]}
                />
              </div>
            </div>
            {dirty && <p className="text-xs text-amber-600 mt-2">Ada perubahan yang belum disimpan.</p>}
          </CardContent>
        </Card>

        {summaryPos === 'top' ? summaryCard : dropZone('top')}

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
                <Button type="button" size="xs" className="bg-blue-900 hover:bg-blue-800" onClick={addRow}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
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

        {summaryPos === 'bottom' ? summaryCard : dropZone('bottom')}
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
        open={confirmLeave}
        title="Perubahan belum disimpan"
        message="Perubahan pada sheet ini akan hilang jika Anda kembali ke daftar. Lanjutkan?"
        confirmText="Kembali"
        onCancel={() => setConfirmLeave(false)}
        onConfirm={() => navigate('/reports/forecast')}
      />
      <ConfirmDialog
        open={confirmDelete}
        title="Hapus sheet"
        message={`Sheet "${nama}" akan dihapus permanen beserta pengeluaran dan centang tagihannya. Invoice tidak terpengaruh.`}
        confirmText="Hapus"
        loading={deleteMutation.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
};

export default ForecastDetail;
