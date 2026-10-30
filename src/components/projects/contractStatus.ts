import type { ContractStatus } from '@/types';

export const contractStatusLabels: Record<ContractStatus, string> = {
  not_started: 'Belum mulai',
  ongoing: 'Berjalan',
  expired: 'Habis Kontrak',
};

export const contractStatusClasses: Record<ContractStatus, string> = {
  not_started: 'bg-slate-100 text-slate-600 border-slate-200',
  ongoing: 'bg-green-100 text-green-800 border-green-200',
  expired: 'bg-red-100 text-red-800 border-red-200',
};
