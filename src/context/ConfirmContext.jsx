import { createContext, useState, useCallback, useRef } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

// eslint-disable-next-line react-refresh/only-export-components
export const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState({ open: false, title: '', message: '', variant: 'danger', confirmText: 'Ya', cancelText: 'Batal' });
  const resolveRef = useRef(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
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