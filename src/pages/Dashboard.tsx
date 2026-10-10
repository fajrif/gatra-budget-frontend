import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, MapPin, Map, Building, Users, type LucideIcon } from 'lucide-react';

interface QuickLink {
  to: string;
  icon: LucideIcon;
  label: string;
  color: string;
}

const quickLinks: QuickLink[] = [
  { to: '/countries', icon: Globe, label: 'Negara', color: 'text-blue-600' },
  { to: '/provinces', icon: Map, label: 'Provinsi', color: 'text-indigo-600' },
  { to: '/cities', icon: Building, label: 'Kota', color: 'text-violet-600' },
  { to: '/areas', icon: MapPin, label: 'Kecamatan', color: 'text-purple-600' },
  { to: '/my-addresses', icon: MapPin, label: 'Alamat Saya', color: 'text-emerald-600' },
  { to: '/users', icon: Users, label: 'Pengguna', color: 'text-rose-600' },
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

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-base">Tentang Gatra Budget</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>
            Gatra Budget adalah aplikasi manajemen anggaran proyek. Aplikasi ini membantu Anda
            mencatat proyek beserta nilai kontraknya, menyusun anggaran per jenis biaya, memantau
            realisasi pengeluaran, serta menghitung biaya manajemen dan margin laba secara otomatis.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-500">
            <li><strong className="font-semibold">Proyek:</strong> kelola proyek, nilai pekerjaan, periode, dan status kontrak</li>
            <li><strong className="font-semibold">Anggaran:</strong> susun alokasi biaya per proyek dengan skema lumpsum atau bulanan</li>
            <li><strong className="font-semibold">Transaksi:</strong> catat realisasi pengeluaran dan pantau status SLA pembayaran</li>
            <li><strong className="font-semibold">Laporan:</strong> biaya manajemen bulanan serta ringkasan sisa anggaran dan margin laba</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default Dashboard;
