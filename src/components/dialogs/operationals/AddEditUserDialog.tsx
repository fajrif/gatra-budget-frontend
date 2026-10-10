import React, { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { usersAPI } from '@/api/endpoints';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Select from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { userSchemaForEdit, userSchemaWithPasswordConfirmation } from '@/utils/validations/User';
import { useToast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { USER_ROLES } from '@/utils/constants';
import { Save, Loader2 } from 'lucide-react';
import type { z } from 'zod';
import type { User, UserRequest } from '@/types';

export type UserFormCreate = z.infer<typeof userSchemaWithPasswordConfirmation>;
export type UserFormEdit = z.infer<typeof userSchemaForEdit>;

export type AddEditUserFormValues = UserFormCreate | UserFormEdit;

/**
 * Strips the form-only keys (`password_confirmation`) and collapses the zod
 * schema's nullable `role` to `undefined` so the payload matches
 * `models.UserRequest`, where every field is a plain `string` with `omitempty`.
 */
const toUserRequest = (data: AddEditUserFormValues): UserRequest => {
  const { password_confirmation: _confirmation, role, ...rest } = data;
  return {
    ...rest,
    ...(role ? { role } : {}),
  };
};

export interface AddEditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** User to edit; undefined when creating. */
  editingUser?: User | null;
  /** Called after successful save (and close/reset flow). */
  onFinish: () => void;
}

const AddEditUserDialog = ({ isOpen, onClose, editingUser, onFinish }: AddEditUserDialogProps) => {
  const { toast } = useToast();

  const initialData: Partial<AddEditUserFormValues> = {
    email: '',
    full_name: '',
    role: undefined,
  };

  // --- React Hook Form Setup ---
  const schema = editingUser ? userSchemaForEdit : userSchemaWithPasswordConfirmation;
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: editingUser
      ? (editingUser as unknown as z.infer<typeof schema>)
      : (initialData as unknown as z.infer<typeof schema>),
  });

  useEffect(() => {
    if (editingUser) {
      reset(editingUser as AddEditUserFormValues);
    }
  }, [editingUser, reset]);

  const createMutation = useMutation({
    mutationFn: async (data: UserFormCreate) => {
      const response = await usersAPI.create(toUserRequest(data));
      return response.data;
    },
    onSuccess: async () => {
      toast({
        title: 'Success',
        description: 'User berhasil ditambahkan.',
        variant: 'success',
      });
      onFinishing();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Gagal menambahkan user.'),
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UserFormEdit }) => {
      const response = await usersAPI.update(id, toUserRequest(data));
      return response.data;
    },
    onSuccess: async () => {
      toast({
        title: 'Success',
        description: 'User berhasil diperbarui.',
        variant: 'success',
      });
      onFinishing();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Gagal memperbarui user.'),
        variant: 'destructive',
      });
    },
  });

  const onFinishing = () => {
    reset(initialData as unknown as AddEditUserFormValues);
    onFinish();
  };

  const onClosing = () => {
    reset(initialData as unknown as AddEditUserFormValues);
    onClose();
  };

  const onHandleSubmit = async (data: AddEditUserFormValues) => {
    if (editingUser) {
      const payload = { ...data } as UserFormEdit;
      if (!payload.password) {
        delete payload.password;
        delete payload.password_confirmation;
      }
      updateMutation.mutate({ id: editingUser.id, data: payload });
    } else {
      createMutation.mutate(data as UserFormCreate);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClosing}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingUser ? 'Ubah User' : 'Tambah User Baru'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onHandleSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                placeholder="Contoh: user@gatrahitawasana.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap *</Label>
              <Input
                id="full_name"
                placeholder="Contoh: Budi Santoso"
                {...register('full_name')}
              />
              {errors.full_name && (
                <p className="text-red-500 text-sm">{errors.full_name.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
              <Input
                id="password_confirmation"
                type="password"
                placeholder="Masukkan konfirmasi password"
                {...register('password_confirmation')}
              />
              {errors.password_confirmation && (
                <p className="text-red-500 text-sm">
                  {errors.password_confirmation.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Controller
                name="role"
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Select
                    options={USER_ROLES.map((role) => ({
                      value: role,
                      label: role,
                    }))}
                    value={value as string}
                    onChange={onChange}
                    placeholder="Pilih role"
                    error={!!error}
                    searchable={false}
                    clearable={false}
                  />
                )}
              />
              {errors.role && (
                <p className="text-red-500 text-sm">{errors.role.message as string}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClosing}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {createMutation.isPending || updateMutation.isPending ? (
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

export default AddEditUserDialog;