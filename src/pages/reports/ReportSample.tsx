import { useState, useRef, type ChangeEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { countriesAPI } from '@/api/endpoints';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileDown, Search } from 'lucide-react';

const ReportSample = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);
  const [appliedSearch, setAppliedSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['report-sample', appliedSearch],
    queryFn: () => countriesAPI.getAll({ all: true, search: appliedSearch }),
    select: (res) => res.data?.countries ?? [],
    enabled: hasGenerated,
  });

  const handleGenerate = () => {
    setAppliedSearch(searchTerm);
    setHasGenerated(true);
  };

  const handleFilterChange = (val: string) => {
    setSearchTerm(val);
    setHasGenerated(false);
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf()
        .set({
          margin: 10,
          filename: `Report-Sample.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(reportRef.current)
        .save();
    } catch (err) {
      console.error('Export PDF error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const rows = data ?? [];

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Report Sample</h1>
          <p className="text-slate-500 mt-1">
            Example report page with filter, table, and PDF export
          </p>
        </div>

        {/* Filter Card */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 space-y-1.5">
              <Label>Search by Name</Label>
              <Input
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleFilterChange(e.target.value)
                }
                placeholder="e.g. Indonesia"
              />
            </div>
            <Button onClick={handleGenerate} className="bg-blue-900 hover:bg-blue-800 gap-2">
              <Search className="w-4 h-4" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        {/* Report Zone */}
        {hasGenerated && (
          <Card className="border-none shadow-lg">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-base">Results</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={isExporting || rows.length === 0}
                className="gap-2"
              >
                <FileDown className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-slate-500 animate-pulse">Loading...</div>
              ) : rows.length === 0 ? (
                <div className="py-8 text-center text-slate-400">No data found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <div
                    ref={reportRef}
                    className="bg-white p-6"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  >
                    <div className="mb-6 text-center">
                      <h2 className="text-base font-bold uppercase">COUNTRY REFERENCE REPORT</h2>
                      {appliedSearch && (
                        <p className="text-sm text-gray-500">Filter: "{appliedSearch}"</p>
                      )}
                    </div>
                    <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th
                            style={{
                              backgroundColor: '#f1f5f9',
                              paddingBottom: '10px',
                              border: '1px solid #e2e8f0',
                              padding: '8px 12px',
                              textAlign: 'left',
                            }}
                          >
                            #
                          </th>
                          <th
                            style={{
                              backgroundColor: '#f1f5f9',
                              paddingBottom: '10px',
                              border: '1px solid #e2e8f0',
                              padding: '8px 12px',
                              textAlign: 'left',
                            }}
                          >
                            Code
                          </th>
                          <th
                            style={{
                              backgroundColor: '#f1f5f9',
                              paddingBottom: '10px',
                              border: '1px solid #e2e8f0',
                              padding: '8px 12px',
                              textAlign: 'left',
                            }}
                          >
                            Country Name
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, idx) => (
                          <tr
                            key={row.id}
                            style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}
                          >
                            <td style={{ border: '1px solid #e2e8f0', padding: '8px 12px' }}>
                              {idx + 1}
                            </td>
                            <td
                              style={{
                                border: '1px solid #e2e8f0',
                                padding: '8px 12px',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                              }}
                            >
                              {row.code}
                            </td>
                            <td style={{ border: '1px solid #e2e8f0', padding: '8px 12px' }}>
                              {row.name}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-xs text-gray-400 mt-4">Total: {rows.length} records</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReportSample;