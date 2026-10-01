import { createContext, useState, useCallback, useRef, type ReactNode } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export type ConfirmVariant = 'danger' | 'default';

export interface ConfirmOptions {
  title?: string;
  message?: string;
  variant?: ConfirmVariant;
  confirmText?: string;
  cancelText?: string;
}

export type ConfirmFn = (options?: ConfirmOptions) => Promise<boolean>;

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  variant: ConfirmVariant;
  confirmText: string;
  cancelText: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ConfirmContext = createContext<ConfirmFn | null>(null);

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ConfirmState>({
    open: false,
    title: '',
    message: '',
    variant: 'danger',
    confirmText: 'Ya',
    cancelText: 'Batal',
  });
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((options = {}) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setState({
        open: true,
        title: options.title || 'Konfirmasi',
        message: options.message || '',
        variant: options.variant || 'danger',
        confirmText: options.confirmText || 'Ya',
        cancelText: options.cancelText || 'Batal',
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
    resolveRef.current?.(true);
  }, []);

  const handleCancel = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
    resolveRef.current?.(false);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={state.open}
        title={state.title}
        message={state.message}
        variant={state.variant}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
};