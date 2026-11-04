import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Save } from 'lucide-react';

export interface ColumnOption {
  key: string;
  label: string;
}

export interface ColumnSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Columns the user may toggle, in display order. */
  columns: ColumnOption[];
  /** Keys currently shown. */
  selected: string[];
  onSave: (keys: string[]) => void;
}

const ColumnSettingsDialog = ({ isOpen, onClose, columns, selected, onSave }: ColumnSettingsDialogProps) => {
  const [draft, setDraft] = useState<string[]>(selected);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDraft(selected);
      setError(null);
    }
  }, [isOpen, selected]);

  const toggle = (key: string) => {
    setError(null);
    setDraft((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const allKeys = columns.map((c) => c.key);

  const save = () => {
    if (draft.length === 0) {
      setError('Pilih minimal satu kolom.');
      return;
    }
    // Keep the table's own column order regardless of click order.
    onSave(allKeys.filter((k) => draft.includes(k)));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Atur Kolom</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500">
          Pilih kolom yang ditampilkan. Kolom Bulan selalu tampil. Hasil export mengikuti pilihan ini.
        </p>
        <div className="space-y-2">
          {columns.map((c) => (
            <label key={c.key} className="flex items-center gap-3 text-sm text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 accent-blue-900"
                checked={draft.includes(c.key)}
                onChange={() => toggle(c.key)}
              />
              {c.label}
            </label>
          ))}
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setError(null);
              setDraft(allKeys);
            }}
          >
            Pilih semua
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="button" onClick={save} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnSettingsDialog;
