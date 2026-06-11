import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, MapPin, Map, Building, Users } from 'lucide-react';

const quickLinks = [
  { to: '/countries', icon: Globe, label: 'Countries', color: 'text-blue-600', bg: 'bg-blue-500' },
  { to: '/provinces', icon: Map, label: 'Provinces', color: 'text-indigo-600', bg: 'bg-indigo-500' },
  { to: '/cities', icon: Building, label: 'Cities', color: 'text-violet-600', bg: 'bg-violet-500' },
  { to: '/areas', icon: MapPin, label: 'Areas', color: 'text-purple-600', bg: 'bg-purple-500' },
  { to: '/my-addresses', icon: MapPin, label: 'My Addresses', color: 'text-emerald-600', bg: 'bg-emerald-500' },
  { to: '/users', icon: Users, label: 'Users', color: 'text-rose-600', bg: 'bg-rose-500' },
];

const Dashboard = () => (
  <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome to Boilerplates — your Go + React starter kit</p>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-base">Quick Navigation</CardTitle>
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
          <CardTitle className="text-base">About This Boilerplate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>
            This project is a clean starter template for Go REST API + React SPA projects.
            It includes a full auth system (JWT, roles), an address hierarchy as a working
            CRUD reference, and AG Grid + ConfirmDialog + PDF export patterns.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-500">
            <li>Backend: Go + Fiber + GORM + PostgreSQL</li>
            <li>Frontend: React 19 + Vite + TailwindCSS + React Query</li>
            <li>Auth: JWT with role-based access (admin / user / operator)</li>
            <li>Reference CRUD: Countries → Provinces → Cities → Areas → Addresses</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default Dashboard;
