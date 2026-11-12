import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { Download, Loader2 } from 'lucide-react';

const schema = z.object({
  filename: z
    .string()
    .trim()
    .min(1, 'Nama file wajib diisi')
    .regex(/^[^\\/:*?"<>|]+$/, 'Nama file tidak boleh mengandung \\ / : * ? " < > |'),
});

type FormValues = z.infer<typeof schema>;

export interface ExportFilenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Suggested name, without extension. */
  defaultFilename: string;
  extension?: string;
  /** Performs the export with the final file name (extension included). */
  onExport: (filename: string) => Promise<void>;
}

const ExportFilenameDialog = ({
  isOpen,
  onClose,
  defaultFilename,
  extension = 'xlsx',
  onExport,
}: ExportFilenameDialogProps) => {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { filename: defaultFilename },
  });

  useEffect(() => {
    if (isOpen) reset({ filename: defaultFilename });
  }, [isOpen, defaultFilename, reset]);

  const submit = async ({ filename }: FormValues) => {
    setBusy(true);
    try {
      const suffix = `.${extension}`;
      const name = filename.toLowerCase().endsWith(suffix) ? filename : filename + suffix;
      await onExport(name);
      toast({ title: 'Success', description: 'File berhasil diunduh.', variant: 'success' });
      onClose();
    } catch (err) {
      toast({
        title: 'Error',
        description: getErrorMessage(err, 'Gagal mengekspor data.'),
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export ke {extension === 'pdf' ? 'PDF' : 'Excel'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <Label>Filename</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input {...register('filename')} autoFocus />
              <span className="text-sm text-slate-500">.{extension}</span>
            </div>
            {errors.filename && <p className="text-red-500 text-xs mt-1">{errors.filename.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={busy} className="bg-green-600 hover:bg-green-700">
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExportFilenameDialog;
