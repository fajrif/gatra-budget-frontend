import React, { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { projectGroupsAPI } from '@/api/endpoints';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { projectGroupSchema } from '@/utils/validations/ProjectGroup';
import { useToast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { Save, Loader2 } from 'lucide-react';
import type { z } from 'zod';
import type { ProjectGroup } from '@/types';

export type ProjectGroupFormValues = z.infer<typeof projectGroupSchema>;

export interface AddEditProjectGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Group to edit; undefined when creating. */
  editingItem?: ProjectGroup;
  /** Called with `shouldRefresh` after successful save. */
  onFinish: (shouldRefresh: boolean) => void;
}

/** Go's `omitempty` nullable strings arrive as `null`; the form wants ''. */
const toFormValues = (group?: ProjectGroup): ProjectGroupFormValues => ({
  nama: group?.nama ?? '',
  deskripsi: group?.deskripsi ?? '',
});

const AddEditProjectGroupDialog = ({ isOpen, onClose, editingItem, onFinish }: AddEditProjectGroupDialogProps) => {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectGroupFormValues>({
    resolver: zodResolver(projectGroupSchema),
    defaultValues: toFormValues(editingItem),
  });

  useEffect(() => {
    reset(toFormValues(editingItem));
  }, [editingItem, isOpen, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: ProjectGroupFormValues) =>
      editingItem?.id ? projectGroupsAPI.update(editingItem.id, data) : projectGroupsAPI.create(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Group proyek ${editingItem ? 'berhasil diperbarui' : 'berhasil ditambahkan'}.`,
        variant: 'success',
      });
      onFinish(true);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description:
          isAxiosError(err) && err.response?.status === 409
            ? 'Nama group proyek sudah dipakai.'
            : getErrorMessage(err, 'Gagal menyimpan group proyek.'),
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Ubah Group Proyek' : 'Tambah Group Proyek'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
          <div>
            <Label>Nama Group</Label>
            <Input {...register('nama')} placeholder="Pengadaan TAD Sumbar" className="mt-1" />
            {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama.message}</p>}
          </div>
          <div>
            <Label>
              Deskripsi <span className="text-slate-400 text-xs">(opsional)</span>
            </Label>
            <Input {...register('deskripsi')} className="mt-1" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={saveMutation.isPending} className="bg-green-600 hover:bg-green-700">
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditProjectGroupDialog;
