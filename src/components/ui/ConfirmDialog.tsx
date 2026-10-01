import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: string;
  loading?: boolean;
  children?: ReactNode;
}

const ConfirmDialog = ({
  open,
  onConfirm,
  onCancel,
  title = 'Konfirmasi',
  message,
  confirmText = 'Ya',
  cancelText = 'Batal',
  variant = 'danger',
  loading = false,
  children,
}: ConfirmDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {message && <DialogDescription>{message}</DialogDescription>}
        </DialogHeader>
        {children && <div className="py-2">{children}</div>}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={variant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}
          >
            {loading ? 'Memproses...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;