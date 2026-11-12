import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AgGridReact } from 'ag-grid-react';
import { Plus } from 'lucide-react';
import { forecastSheetsAPI } from '@/api/endpoints';
import { appTheme } from '@/lib/agGridTheme';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import CreateForecastSheetDialog from '@/components/dialogs/operationals/CreateForecastSheetDialog';
import { createForecastSheetsColumnDefs, defaultColDef } from '@/config/forecastSheetsGridColumns';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { ForecastSheetListItem } from '@/types';

const detailPath = (id: string) => `/reports/forecast/${id}`;

/** First page: create a new (empty) sheet and pick one of the saved sheets. */
const ForecastList = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);

  const { data: sheets = [], isLoading } = useQuery({
    queryKey: ['forecast-sheets'],
    queryFn: () => forecastSheetsAPI.getAll({ all: true }),
    select: (res) => res.data?.forecast_sheets ?? [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => forecastSheetsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-sheets'] });
      toast({ title: 'Success', description: 'Sheet berhasil dihapus.', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Error', description: getErrorMessage(err, 'Gagal menghapus sheet.'), variant: 'destructive' });
    },
  });

  const columnDefs = useMemo(
    () =>
      createForecastSheetsColumnDefs({
        onView: (row: ForecastSheetListItem) => navigate(detailPath(row.id)),
        onEdit: (row: ForecastSheetListItem) => navigate(detailPath(row.id)),
        onDelete: (row: ForecastSheetListItem) => deleteMutation.mutate(row.id),
      }),
    // deleteMutation.mutate is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate],
  );

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Perkiraan Kas</h1>
          <p className="text-slate-500 mt-1">
            Lembar perkiraan pengeluaran dan pemasukan dalam satu bulan.
          </p>
        </div>

        {/* Saved sheets */}
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-slate-900">Sheet Tersimpan</h2>
              <Button type="button" className="bg-blue-900 hover:bg-blue-800" onClick={() => setCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Buat Sheet
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : sheets.length === 0 ? (
              <div className="text-center py-8 text-slate-500">Belum ada sheet. Klik Buat Sheet untuk membuat yang pertama.</div>
            ) : (
              <div style={{ height: 460, width: '100%' }}>
                <AgGridReact<ForecastSheetListItem>
                  theme={appTheme}
                  rowData={sheets}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  getRowId={(p) => p.data.id}
                  pagination
                  paginationPageSize={20}
                  suppressCellFocus
                  onCellClicked={(e) => {
                    if (e.colDef.field === 'nama' && e.data) navigate(detailPath(e.data.id));
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateForecastSheetDialog
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(id) => navigate(detailPath(id))}
      />
    </div>
  );
};

export default ForecastList;
