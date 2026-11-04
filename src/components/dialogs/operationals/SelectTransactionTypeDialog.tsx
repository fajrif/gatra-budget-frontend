import { FolderKanban, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export type TransactionKind = 'project' | 'operational';

export interface SelectTransactionTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (kind: TransactionKind) => void;
}

const options: {
  kind: TransactionKind;
  title: string;
  description: string;
  icon: typeof FolderKanban;
}[] = [
  {
    kind: 'project',
    title: 'Transaksi Proyek',
    description: 'Pengeluaran yang dibebankan ke sebuah proyek.',
    icon: FolderKanban,
  },
  {
    kind: 'operational',
    title: 'Beban Operasional',
    description: 'Pengeluaran di luar proyek, mis. biaya kantor dan konsumsi.',
    icon: Building2,
  },
];

const SelectTransactionTypeDialog = ({
  isOpen,
  onClose,
  onSelect,
}: SelectTransactionTypeDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Pilih Jenis Transaksi</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map(({ kind, title, description, icon: Icon }) => (
          <button
            key={kind}
            type="button"
            onClick={() => onSelect(kind)}
            className="text-left rounded-lg border border-slate-200 p-4 hover:border-blue-900 hover:bg-blue-50 transition-colors"
          >
            <Icon className="w-6 h-6 text-blue-900 mb-2" />
            <p className="font-semibold text-slate-900">{title}</p>
            <p className="text-sm text-slate-500 mt-1">{description}</p>
          </button>
        ))}
      </div>
    </DialogContent>
  </Dialog>
);

export default SelectTransactionTypeDialog;
