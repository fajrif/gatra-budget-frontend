import { useQuery } from '@tanstack/react-query';
import { reportsAPI } from '@/api/endpoints';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ShieldAlert, Wallet } from 'lucide-react';
import { formatRupiah } from '@/utils/formatters';

/**
 * Admin-only. The route is gated by ProtectedRoute adminOnly and the endpoints
 * return 403 to anyone else. This page renders the server's figures as-is and
 * does not recompute the fee or remaining budget client-side.
 */
const ManagementFee = () => {
  const { data: summaries, isLoading: summaryLoading } = useQuery({
    queryKey: ['reports', 'projects-summary'],
    queryFn: () => reportsAPI.getProjectsSummary({ all: true }),
    select: (res) => res.data?.projects_summary ?? [],
  });

  const { data: fee, isLoading: feeLoading } = useQuery({
    queryKey: ['reports', 'management-fee'],
    queryFn: () => reportsAPI.getManagementFee(),
    select: (res) => ({ rows: res.data?.rows ?? [], totals: res.data?.totals }),
  });

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Management Fee</h1>
          <p className="text-slate-500 mt-1">Sisa anggaran dan margin laba per proyek</p>
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
                  Angka-angka ini hanya terlihat oleh administrator. Sisa anggaran adalah nilai
                  kontrak dikurangi realisasi pengeluaran. Margin laba adalah tarif biaya manajemen
                  proyek yang diterapkan pada realisasi pengeluaran. Server menghitung keduanya.
                </p>
              </div>
            </div>
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
                      <TableHead className="text-right">Nilai Pekerjaan</TableHead>
                      <TableHead className="text-right">Realisasi</TableHead>
                      <TableHead className="text-right">Sisa Anggaran</TableHead>
                      <TableHead className="text-right">Absorpsi</TableHead>
                      <TableHead className="text-right">Tarif Fee</TableHead>
                      <TableHead className="text-right">Margin Laba</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summaries?.map((s) => (
                      <TableRow key={s.project_id}>
                        <TableCell>{s.no_sp2k}</TableCell>
                        <TableCell className="font-medium">{s.judul_pekerjaan}</TableCell>
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
                        <TableCell className="text-right">
                          {s.tarif_management_fee_persen != null ? `${s.tarif_management_fee_persen}%` : '-'}
                        </TableCell>
                        <TableCell className="text-right">{formatRupiah(s.profit_margin)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-900">Management Fee per Bulan</h2>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {feeLoading ? (
              <div className="text-center py-8">Memuat...</div>
            ) : (fee?.rows.length ?? 0) === 0 ? (
              <div className="text-center py-8 text-slate-500">Belum ada transaksi realisasi.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bulan</TableHead>
                      <TableHead>No. SP2K</TableHead>
                      <TableHead>Proyek</TableHead>
                      <TableHead className="text-right">Realisasi</TableHead>
                      <TableHead className="text-right">Tarif Fee</TableHead>
                      <TableHead className="text-right">Management Fee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fee?.rows.map((row) => (
                      <TableRow key={`${row.project_id}-${row.bulan_realisasi}`}>
                        <TableCell>{row.bulan_realisasi}</TableCell>
                        <TableCell>{row.no_sp2k}</TableCell>
                        <TableCell className="font-medium">{row.judul_pekerjaan}</TableCell>
                        <TableCell className="text-right">{formatRupiah(row.total_realisasi)}</TableCell>
                        <TableCell className="text-right">
                          {row.tarif_management_fee_persen != null ? `${row.tarif_management_fee_persen}%` : '-'}
                        </TableCell>
                        <TableCell className="text-right">{formatRupiah(row.management_fee)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  {fee?.totals && (
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={3} className="font-semibold">
                          Total
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatRupiah(fee.totals.total_realisasi)}
                        </TableCell>
                        <TableCell />
                        <TableCell className="text-right font-semibold">
                          {formatRupiah(fee.totals.management_fee)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  )}
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagementFee;
