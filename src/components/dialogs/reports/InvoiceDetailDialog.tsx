import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { invoiceStatusBadgeClasses, paymentMethodBadgeClasses } from '@/config/invoicesGridColumns';
import { formatDate, formatRupiah } from '@/utils/formatters';
import { formatPeriods } from '@/utils/billingPeriods';
import type { Invoice } from '@/types';

export interface InvoiceDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  /** Name of the project's group, when it has one. */
  groupName?: string | null;
}

const Badge = ({ label, classes }: { label: string; classes?: { bg: string; text: string; border: string } }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${classes?.bg ?? ''} ${classes?.text ?? ''} ${classes?.border ?? ''}`}
  >
    {label}
  </span>
);

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="grid grid-cols-[10rem_1fr] gap-3 py-2 border-b border-slate-100 last:border-0">
    <dt className="text-sm text-slate-500">{label}</dt>
    <dd className="text-sm text-slate-900 break-words">{children}</dd>
  </div>
);

/** Read-only detail of one invoice, opened from the Monitoring Invoice table. */
const InvoiceDetailDialog = ({ isOpen, onClose, invoice, groupName }: InvoiceDetailDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>Detail Invoice {invoice?.no_invoice}</DialogTitle>
      </DialogHeader>
      {invoice && (
        <dl>
          <Row label="No. Invoice">{invoice.no_invoice}</Row>
          <Row label="Nama Invoice">{invoice.nama_invoice}</Row>
          <Row label="Proyek">{invoice.project?.judul_pekerjaan ?? '-'}</Row>
          <Row label="Group Proyek">{groupName || '-'}</Row>
          <Row label="Metode Pembayaran">
            <Badge label={invoice.metode_pembayaran} classes={paymentMethodBadgeClasses[invoice.metode_pembayaran]} />
          </Row>
          <Row label="Periode Tagihan">{formatPeriods(invoice.periode_tagihan)}</Row>
          <Row label="Tgl Tagihan">{formatDate(invoice.tgl_tagihan)}</Row>
          <Row label="Tgl Bayar">{invoice.tgl_bayar ? formatDate(invoice.tgl_bayar) : '-'}</Row>
          <Row label="Nilai Tagihan">{formatRupiah(invoice.nilai)}</Row>
          <Row label="Status Tagihan">
            <Badge label={invoice.status} classes={invoiceStatusBadgeClasses[invoice.status]} />
          </Row>
          <Row label="Deskripsi">{invoice.description || '-'}</Row>
        </dl>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Tutup
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default InvoiceDetailDialog;
