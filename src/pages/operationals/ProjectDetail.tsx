import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectsAPI } from '@/api/endpoints';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Building2, FileText } from 'lucide-react';
import { formatRupiah, formatDate } from '@/utils/formatters';
import { useAuth } from '@/hooks/useAuth';
import BudgetItemsPanel from '@/components/projects/BudgetItemsPanel';
import TransactionsPanel from '@/components/projects/TransactionsPanel';
import ProjectDashboardCharts from '@/components/projects/ProjectDashboardCharts';
import ProjectFinancialSummary from '@/components/projects/ProjectFinancialSummary';

const statusBadgeClasses: Record<string, string> = {
  Active: 'bg-green-100 text-green-800 border-green-200',
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  'Non Aktif': 'bg-slate-100 text-slate-600 border-slate-200',
};

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const { data: project, isLoading } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => projectsAPI.getById(projectId as string),
    select: (res) => res.data?.project,
    enabled: !!projectId,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Memuat...</div>;
  }

  if (!project) {
    return <div className="p-8 text-center text-slate-500">Proyek tidak ditemukan.</div>;
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')} className="mb-2 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali ke Proyek
          </Button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-slate-900">{project.judul_pekerjaan}</h1>
                <Badge variant="outline" className={statusBadgeClasses[project.status_kontrak] ?? ''}>
                  {project.status_kontrak}
                </Badge>
              </div>
              <p className="text-slate-500 mt-1">No. SP2K: {project.no_sp2k}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none shadow-md">
            <CardContent className="pt-6 flex items-start gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-blue-700" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Klien</p>
                <p className="text-sm font-medium text-slate-900">{project.client?.name ?? '-'}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="pt-6 flex items-start gap-3">
              <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-indigo-700" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Periode</p>
                <p className="text-sm font-medium text-slate-900">
                  {formatDate(project.tanggal_mulai)}
                  {project.tanggal_selesai ? ` – ${formatDate(project.tanggal_selesai)}` : ''}
                </p>
                {project.jangka_waktu != null && (
                  <p className="text-xs text-slate-500">{project.jangka_waktu} bulan</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="pt-6 flex items-start gap-3">
              <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Nilai Pekerjaan</p>
                <p className="text-sm font-medium text-slate-900">{formatRupiah(project.nilai_pekerjaan)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {user?.role === 'admin' && <ProjectFinancialSummary projectId={project.id} />}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="anggaran">Anggaran</TabsTrigger>
            <TabsTrigger value="transaksi">Transaksi</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <ProjectDashboardCharts projectId={project.id} />
          </TabsContent>

          <TabsContent value="anggaran">
            <Card className="border-none shadow-lg">
              <CardContent className="pt-6">
                <BudgetItemsPanel projectId={project.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transaksi">
            <Card className="border-none shadow-lg">
              <CardContent className="pt-6">
                <TransactionsPanel projectId={project.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetail;
