import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { invoicesAPI, projectsAPI, transactionsAPI } from '@/api/endpoints';
import { downloadImportTemplate, parseImportFile } from '@/utils/excelImport';
import { useToast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { Download, Loader2, Upload } from 'lucide-react';
import type { ImportErrorBody, ImportKind, ImportResult, ImportRow, ImportRowError } from '@/types';

export interface ImportExcelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  kind: ImportKind;
  /** Called after a successful import so the page can refresh its list. */
  onImported: () => void;
}

const LABELS: Record<ImportKind, { title: string; item: string }> = {
  projects: { title: 'Import Proyek dari Excel', item: 'proyek' },
  transactions: { title: 'Import Transaksi dari Excel', item: 'transaksi' },
  invoices: { title: 'Import Invoice dari Excel', item: 'invoice' },
};

const importers: Record<ImportKind, (rows: ImportRow[]) => Promise<{ data: ImportResult }>> = {
  projects: projectsAPI.import,
  transactions: transactionsAPI.import,
  invoices: invoicesAPI.import,
};

const ImportExcelDialog = ({ isOpen, onClose, kind, onImported }: ImportExcelDialogProps) => {
  const { toast } = useToast();
  const label = LABELS[kind];
  const [file, setFile] = useState<File | null>(null);
  const [rowErrors, setRowErrors] = useState<ImportRowError[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const reset = () => {
    setFile(null);
    setRowErrors([]);
    setFileError(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const importMutation = useMutation({
    mutationFn: async (selected: File) => {
      const rows = await parseImportFile(selected, kind);
      return (await importers[kind](rows)).data;
    },
    onSuccess: (result) => {
      toast({
        title: 'Import berhasil',
        description: `${result.created} ${label.item} dibuat, ${result.updated} diperbarui.`,
        variant: 'success',
      });
      onImported();
      close();
    },
    onError: (err) => {
      if (isAxiosError<ImportErrorBody>(err) && err.response?.status === 422) {
        setFileError(null);
        setRowErrors(err.response.data.errors ?? []);
        return;
      }
      setRowErrors([]);
      setFileError(getErrorMessage(err, 'Import gagal.'));
    },
  });

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadImportTemplate(kind);
    } catch (err) {
      toast({
        title: 'Error',
        description: getErrorMessage(err, 'Gagal mengunduh template.'),
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleImport = () => {
    if (!file) return;
    setRowErrors([]);
    setFileError(null);
    importMutation.mutate(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{label.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1 text-sm">
          <div className="rounded-lg bg-slate-50 p-4 space-y-3">
            <p className="font-medium text-slate-900">1. Unduh template</p>
            <p className="text-slate-500">
              Isi data mulai baris 2 pada sheet Data. Sheet Petunjuk menjelaskan tiap kolom dan
              aturannya.
            </p>
            <Button type="button" variant="outline" onClick={handleDownload} disabled={downloading}>
              {downloading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Unduh Template
            </Button>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 space-y-3">
            <p className="font-medium text-slate-900">2. Pilih file yang sudah diisi</p>
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setRowErrors([]);
                setFileError(null);
              }}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-900 file:px-3 file:py-2 file:text-sm file:text-white hover:file:bg-blue-800"
            />
            <p className="text-xs text-slate-500">
              Semua baris diperiksa lebih dulu. Jika ada yang salah, tidak ada data yang disimpan —
              perbaiki file lalu import lagi.
            </p>
          </div>

          {fileError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{fileError}</div>
          )}

          {rowErrors.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-2">
              <p className="font-medium text-red-800">
                {rowErrors.length} kesalahan ditemukan. Tidak ada data yang disimpan; perbaiki file
                lalu import lagi.
              </p>
              <div className="max-h-64 overflow-y-auto rounded bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-100 text-slate-600">
                    <tr>
                      <th className="px-3 py-2 w-16">Baris</th>
                      <th className="px-3 py-2 w-44">Kolom</th>
                      <th className="px-3 py-2">Kesalahan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rowErrors.map((e, i) => (
                      <tr key={`${e.row}-${e.field}-${i}`} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-medium">{e.row}</td>
                        <td className="px-3 py-2 font-mono">{e.field || '-'}</td>
                        <td className="px-3 py-2 text-red-700">{e.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={close}>
            Tutup
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={!file || importMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {importMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportExcelDialog;
