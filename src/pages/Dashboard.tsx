import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AboutCard from '@/components/ui/AboutCard';
import { Button } from '@/components/ui/button';
import { Briefcase, CreditCard, FileText, type LucideIcon } from 'lucide-react';

interface QuickLink {
  to: string;
  icon: LucideIcon;
  label: string;
  color: string;
}

const quickLinks: QuickLink[] = [
  { to: '/projects', icon: Briefcase, label: 'Proyek', color: 'text-blue-900' },
  { to: '/transactions', icon: CreditCard, label: 'Transaksi', color: 'text-emerald-600' },
  { to: '/invoices', icon: FileText, label: 'Invoice', color: 'text-amber-600' },
];

const Dashboard = () => (
  <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Gatra Budget — sistem manajemen anggaran proyek</p>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-base">Navigasi Cepat</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {quickLinks.map(({ to, icon: LinkIcon, label, color }) => (
            <Link key={to} to={to}>
              <Button variant="outline" className={`gap-2 ${color}`}>
                <LinkIcon className="w-4 h-4" />
                {label}
              </Button>
            </Link>
          ))}
        </CardContent>
      </Card>

      <AboutCard title="Tentang Gatra Budget">
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            Gatra Budget adalah aplikasi manajemen anggaran proyek dengan tiga resource inti:
            proyek yang dikerjakan, pengeluaran, dan tagihan.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-500">
            <li><strong className="font-semibold">Proyek:</strong> kelola proyek, nilai pekerjaan, dan periode kontrak (Belum mulai, Berjalan, Habis Kontrak)</li>
            <li><strong className="font-semibold">Transaksi:</strong> catat seluruh pengeluaran proyek</li>
            <li><strong className="font-semibold">Invoice:</strong> catat seluruh tagihan dan penerimaan pembayarannya</li>
            <li><strong className="font-semibold">Laporan Bulanan:</strong> pengeluaran dan penerimaan per bulan, serta sisa anggaran dan margin per proyek (admin)</li>
          </ul>
        </div>
      </AboutCard>
    </div>
  </div>
);

export default Dashboard;
