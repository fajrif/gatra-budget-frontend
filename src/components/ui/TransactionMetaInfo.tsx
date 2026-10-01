import React from 'react';
import { Label } from '@/components/ui/label';
import { getPeriodeLabel } from '@/utils/helpers/TransactionHelper';

/**
 * Legacy, currently unrendered component. The backend has no sales-transaction
 * endpoints, so these shapes are declared locally instead of in `src/types`.
 */
interface BookReference {
  code: string;
  name: string;
}

export interface TransactionMeta {
  periode?: number | string | null;
  year?: number | string | null;
  merk_buku?: BookReference | null;
  jenis_buku?: BookReference | null;
}

interface TransactionMetaInfoProps {
  transaction?: TransactionMeta | null;
}

const TransactionMetaInfo = ({ transaction }: TransactionMetaInfoProps) => {
  if (!transaction) return null;

  return (
    <div className="grid grid-cols-4 gap-3 bg-purple-50 border border-purple-100 rounded-lg p-3">
      <div className="space-y-1">
        <Label className="text-slate-500 text-xs">Periode</Label>
        <p className="text-sm font-medium text-slate-700">
          {transaction.periode && transaction.year
            ? getPeriodeLabel(transaction.periode, transaction.year)
            : '-'}
        </p>
      </div>
      <div className="space-y-1">
        <Label className="text-slate-500 text-xs">Tahun</Label>
        <p className="text-sm font-medium text-slate-700">{transaction.year || '-'}</p>
      </div>
      <div className="space-y-1">
        <Label className="text-slate-500 text-xs">Merk Buku</Label>
        <p className="text-sm font-medium text-slate-700">
          {transaction.merk_buku ? `[${transaction.merk_buku.code}] ${transaction.merk_buku.name}` : '-'}
        </p>
      </div>
      <div className="space-y-1">
        <Label className="text-slate-500 text-xs">Jenis Buku</Label>
        <p className="text-sm font-medium text-slate-700">
          {transaction.jenis_buku
            ? `[${transaction.jenis_buku.code}] ${transaction.jenis_buku.name}`
            : '-'}
        </p>
      </div>
    </div>
  );
};

export default TransactionMetaInfo;