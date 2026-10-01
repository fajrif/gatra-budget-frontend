import React, { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { citiesAPI, provincesAPI } from '@/api/endpoints';
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
import { citySchema } from '@/utils/validations/City';
import { useToast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { Save, Loader2 } from 'lucide-react';
import type { z } from 'zod';

export type CityFormValues = z.infer<typeof citySchema>;

export interface AddEditCityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** City to edit; undefined when creating. */
  editingItem?: CityFormValues & { id?: string };
  /** Called with `shouldRefresh` after successful save. */
  onFinish: (shouldRefresh: boolean) => void;
}

const AddEditCityDialog = ({ isOpen, onClose, editingItem, onFinish }: AddEditCityDialogProps) => {
  const { toast } = useToast();

  const { data: provincesData } = useQuery({
    queryKey: ['provinces-all'],
    queryFn: () => provincesAPI.getAll({ all: true }),
    select: (res) => res.data?.provinces ?? [],
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CityFormValues>({
    resolver: zodResolver(citySchema),
    defaultValues: editingItem
      ? { name: editingItem.name, province_id: editingItem.province_id }
      : { name: '', province_id: '' },
  });

  useEffect(() => {
    if (editingItem) {
      reset({ name: editingItem.name, province_id: editingItem.province_id });
    } else {
      reset({ name: '', province_id: '' });
    }
  }, [editingItem, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: CityFormValues) =>
      editingItem?.id ? citiesAPI.update(editingItem.id, data) : citiesAPI.create(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `City ${editingItem ? 'updated' : 'created'} successfully.`,
        variant: 'success',
      });
      onFinish(true);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: getErrorMessage(err, 'Failed to save city.'),
        variant: 'destructive',
      });
    },
  });

  const provinceOptions = (provincesData || []).map((p) => ({ value: p.id, label: p.name }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Edit City' : 'Add City'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
          <div>
            <Label>City Name</Label>
            <Input {...register('name')} placeholder="Kota Bandung" className="mt-1" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label>Province</Label>
            <Controller
              name="province_id"
              control={control}
              render={({ field }) => (
                <Select
                  options={provinceOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select province..."
                  className="mt-1"
                />
              )}
            />
            {errors.province_id && (
              <p className="text-red-500 text-xs mt-1">{errors.province_id.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditCityDialog;