import React, { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { provincesAPI, countriesAPI } from '@/api/endpoints';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Select from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { provinceSchema } from '@/utils/validations/Province';
import { useToast } from '@/components/ui/use-toast';

const AddEditProvinceDialog = ({ isOpen, onClose, editingItem, onFinish }) => {
  const { toast } = useToast();

  const { data: countriesData } = useQuery({
    queryKey: ['countries-all'],
    queryFn: () => countriesAPI.getAll({ all: true }),
    select: (res) => res.data?.countries ?? [],
  });

  const { register, control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(provinceSchema),
    defaultValues: editingItem ? { name: editingItem.name, country_id: editingItem.country_id } : { name: '', country_id: '' },
  });

  useEffect(() => {
    if (editingItem) {
      reset({ name: editingItem.name, country_id: editingItem.country_id });
    } else {
      reset({ name: '', country_id: '' });
    }
  }, [editingItem, reset]);

  const saveMutation = useMutation({
    mutationFn: (data) =>
      editingItem ? provincesAPI.update(editingItem.id, data) : provincesAPI.create(data),
    onSuccess: () => {
      toast({ title: 'Success', description: `Province ${editingItem ? 'updated' : 'created'} successfully.`, variant: 'success' });
      onFinish(true);
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.response?.data?.error || 'Failed to save province.', variant: 'destructive' });
    },
  });

  const countryOptions = (countriesData || []).map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Edit Province' : 'Add Province'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
          <div>
            <Label>Province Name</Label>
            <Input {...register('name')} placeholder="DKI Jakarta" className="mt-1" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label>Country</Label>
            <Controller
              name="country_id"
              control={control}
              render={({ field }) => (
                <Select
                  options={countryOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select country..."
                  className="mt-1"
                />
              )}
            />
            {errors.country_id && <p className="text-red-500 text-xs mt-1">{errors.country_id.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saveMutation.isPending} className="bg-blue-900 hover:bg-blue-800">
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditProvinceDialog;
