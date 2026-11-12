import { forwardRef } from 'react';
import { formatDate, formatRupiah } from '@/utils/formatters';
import { bulanLabel } from '@/utils/forecast';
import type { ForecastReportData } from '@/utils/forecastExport';

const th = 'border border-slate-300 bg-slate-100 px-2 py-1 text-left font-semibold';
const td = 'border border-slate-300 px-2 py-1';
const num = 'text-right whitespace-nowrap';

/**
 * Print layout of a Forecast Kas sheet. Rendered off-screen and handed to
 * html2pdf, so it uses fixed width and plain styling (no grid, no scroll).
 */
const ForecastReportView = forwardRef<HTMLDivElement, { data: ForecastReportData }>(({ data }, ref) => {
  const { summary } = data;
  const tone = (n: number) => (n >= 0 ? 'text-green-700' : 'text-red-600');
  return (
    <div ref={ref} className="bg-white text-slate-900 text-[11px] leading-snug p-4" style={{ width: 1000 }}>
      <h1 className="text-lg font-bold">Perkiraan Kas: {data.nama}</h1>
      <p className="text-slate-600 mb-3">
        Periode {bulanLabel(data.bulan)} · Saldo {formatRupiah(summary.saldo)}
      </p>

      <h2 className="font-semibold mb-1">Pengeluaran</h2>
      <table className="w-full border-collapse mb-3">
        <thead>
          <tr>
            <th className={th}>Item</th>
            <th className={th} style={{ width: 110 }}>Tgl</th>
            <th className={`${th} ${num}`} style={{ width: 160 }}>Nilai</th>
          </tr>
        </thead>
        <tbody>
          {data.expenses.length === 0 && (
            <tr><td className={td} colSpan={3}>Tidak ada pengeluaran.</td></tr>
          )}
          {data.expenses.map((e) => (
            <tr key={e.rid}>
              <td className={td}>{e.item}</td>
              <td className={td}>{formatDate(e.tanggal)}</td>
              <td className={`${td} ${num}`}>{formatRupiah(e.jumlah)}</td>
            </tr>
          ))}
          <tr className="font-bold">
            <td className={td} colSpan={2}>Total Pengeluaran</td>
            <td className={`${td} ${num}`}>{formatRupiah(summary.totalPengeluaran)}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="font-semibold mb-1">Pemasukan (tagihan belum dibayar yang dicentang)</h2>
      <table className="w-full border-collapse mb-3">
        <thead>
          <tr>
            <th className={th}>No. Invoice</th>
            <th className={th}>Nama Invoice</th>
            <th className={th} style={{ width: 110 }}>Tgl Submit</th>
            <th className={th} style={{ width: 70 }}>Status</th>
            <th className={`${th} ${num}`} style={{ width: 160 }}>Nilai Tagihan</th>
          </tr>
        </thead>
        <tbody>
          {data.invoices.length === 0 && (
            <tr><td className={td} colSpan={5}>Tidak ada tagihan yang dicentang.</td></tr>
          )}
          {data.invoices.map((i) => (
            <tr key={i.no_invoice}>
              <td className={td}>{i.no_invoice}</td>
              <td className={td}>{i.nama_invoice}</td>
              <td className={td}>{formatDate(i.tgl_tagihan)}</td>
              <td className={td}>{i.status}</td>
              <td className={`${td} ${num}`}>{formatRupiah(i.nilai)}</td>
            </tr>
          ))}
          <tr className="font-bold">
            <td className={td} colSpan={4}>Total Pemasukan</td>
            <td className={`${td} ${num}`}>{formatRupiah(summary.totalPemasukan)}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="font-semibold mb-1">Ringkasan</h2>
      <table className="border-collapse" style={{ width: 420 }}>
        <tbody>
          <tr><td className={td}>Saldo</td><td className={`${td} ${num}`}>{formatRupiah(summary.saldo)}</td></tr>
          <tr><td className={td}>Total Pengeluaran</td><td className={`${td} ${num}`}>{formatRupiah(summary.totalPengeluaran)}</td></tr>
          <tr><td className={td}>Total Pemasukan</td><td className={`${td} ${num}`}>{formatRupiah(summary.totalPemasukan)}</td></tr>
          <tr className="font-bold">
            <td className={td}>Selisih (+/-)</td>
            <td className={`${td} ${num} ${tone(summary.selisih)}`}>{formatRupiah(summary.selisih)}</td>
          </tr>
          <tr className="font-bold">
            <td className={td}>Saldo Akhir Perkiraan</td>
            <td className={`${td} ${num} ${tone(summary.saldoAkhir)}`}>{formatRupiah(summary.saldoAkhir)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});
ForecastReportView.displayName = 'ForecastReportView';

export default ForecastReportView;
