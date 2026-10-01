import { useContext } from 'react';
import { ConfirmContext, type ConfirmFn, type ConfirmOptions, type ConfirmVariant } from '@/context/ConfirmContext';

export const useConfirm = (): ConfirmFn => {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return confirm;
};

export type { ConfirmFn, ConfirmOptions, ConfirmVariant };