import React, { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { provincesAPI, countriesAPI } from '@/api/endpoints';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Select from '@/components/ui/select';
import { provinceSchema } from '@/utils/validations/Province';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2 } from 'lucide-react';
import type { z } from 'zod';

export type ProvinceFormValues = z.infer<typeof provinceSchema>;

export interface AddEditProvinceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Province to edit; undefined when creating. */
  editingItem?: ProvinceFormValues & { id?: string };
  /** Called with `shouldRefresh` after successful save. */
  onFinish: (shouldRefresh: boolean) => void;
}

const AddEditProvinceDialog = ({
  isOpen,
  onClose,
  editingItem,
  onFinish,
}: AddEditProvinceDialogProps) => {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    watch,
  } = useForm<ProvinceFormValues>({
    resolver: zodResolver(provinceSchema),
    defaultValues: editingItem || { name: '', country_id: '' },
  });

  const selectedCountryId = watch('country_id');

  // Fetch countries for dropdown
  const { data: countriesData } = useQuery({
    queryKey: ['countries', 'all'],
    queryFn: () => countriesAPI.getAll({ all: true }),
    select: (res) => res.data?.countries || [],
    enabled: isOpen,
  });

  const countryOptions =
    countriesData?.map((c: any) => ({
      value: c.id,
      label: c.name,
    })) || [];

  useEffect(() => {
    reset(editingItem || { name: '', country_id: '' });
  }, [editingItem, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: ProvinceFormValues) =>
      editingItem?.id ? provincesAPI.update(editingItem.id, data) : provincesAPI.create(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Province ${editingItem ? 'updated' : 'created'} successfully.`,
        variant: 'success',
      });
      onFinish(true);
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to save province.',
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Edit Province' : 'Add Province'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
          <div>
            <Label>Province Name</Label>
            <Input {...register('name')} placeholder="Jawa Barat" className="mt-1" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label>Country</Label>
            <Select
              options={countryOptions}
              value={selectedCountryId}
              onChange={(value) => setValue('country_id', value)}
              placeholder="Select country..."
              className="mt-1"
            />
            {errors.country_id && (
              <p className="text-red-500 text-xs mt-1">{errors.country_id.message}</p>
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

export default AddEditProvinceDialog;