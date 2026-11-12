import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save } from 'lucide-react';
import { forecastSheetsAPI } from '@/api/endpoints';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Select from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { defaultSheetName } from '@/utils/forecast';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { MONITORING_MONTH_NAMES } from '@/utils/invoiceMonitoring';

const now = new Date();
const currentBulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

const monthOptions = MONITORING_MONTH_NAMES.map((label, i) => ({
  value: String(i + 1).padStart(2, '0'),
  label,
}));
const yearOptions = Array.from({ length: 7 }, (_, i) => {
  const y = now.getFullYear() - 3 + i;
  return { value: String(y), label: String(y) };
});

export interface CreateForecastSheetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the new sheet's id once it is saved. */
  onCreated: (id: string) => void;
}

/** Creates an empty Forecast Kas sheet; the opening balance is filled in on the sheet's own page. */
const CreateForecastSheetDialog = ({ isOpen, onClose, onCreated }: CreateForecastSheetDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [nama, setNama] = useState(defaultSheetName(currentBulan));
  const [bulan, setBulan] = useState(currentBulan);
  const [year, month] = bulan.split('-');

  useEffect(() => {
    if (isOpen) {
      setNama(defaultSheetName(currentBulan));
      setBulan(currentBulan);
    }
  }, [isOpen]);

  // The suggested name follows the month until the user types their own.
  const changeBulan = (next: string) => {
    if (nama === defaultSheetName(bulan)) setNama(defaultSheetName(next));
    setBulan(next);
  };

  const createMutation = useMutation({
    mutationFn: () => forecastSheetsAPI.create({ nama: nama.trim(), bulan, saldo: 0, expenses: [], invoice_ids: [] }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['forecast-sheets'] });
      toast({ title: 'Success', description: 'Sheet dibuat.', variant: 'success' });
      onClose();
      onCreated(res.data.forecast_sheet.id);
    },
    onError: (err) => {
      toast({ title: 'Error', description: getErrorMessage(err, 'Gagal membuat sheet.'), variant: 'destructive' });
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      toast({ title: 'Error', description: 'Nama sheet wajib diisi.', variant: 'destructive' });
      return;
    }
    createMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Buat Sheet Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="forecast-nama">Nama sheet</Label>
            <Input
              id="forecast-nama"
              className="mt-1"
              value={nama}
              maxLength={255}
              autoFocus
              onChange={(e) => setNama(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Bulan</Label>
              <Select
                options={monthOptions}
                value={month}
                onChange={(v: string) => v && changeBulan(`${year}-${v}`)}
                clearable={false}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Tahun</Label>
              <Select
                options={yearOptions}
                value={year}
                onChange={(v: string) => v && changeBulan(`${v}-${month}`)}
                clearable={false}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={createMutation.isPending} className="bg-green-600 hover:bg-green-700">
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateForecastSheetDialog;
