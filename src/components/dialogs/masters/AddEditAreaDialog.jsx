import React, { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { areasAPI, citiesAPI } from '@/api/endpoints';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Select from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { areaSchema } from '@/utils/validations/Area';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2 } from 'lucide-react';

const AddEditAreaDialog = ({ isOpen, onClose, editingItem, onFinish }) => {
  const { toast } = useToast();

  const { data: citiesData } = useQuery({
    queryKey: ['cities-all'],
    queryFn: () => citiesAPI.getAll({ all: true }),
    select: (res) => res.data?.cities ?? [],
  });

  const { register, control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(areaSchema),
    defaultValues: editingItem ? { name: editingItem.name, city_id: editingItem.city_id } : { name: '', city_id: '' },
  });

  useEffect(() => {
    if (editingItem) {
      reset({ name: editingItem.name, city_id: editingItem.city_id });
    } else {
      reset({ name: '', city_id: '' });
    }
  }, [editingItem, reset]);

  const saveMutation = useMutation({
    mutationFn: (data) =>
      editingItem ? areasAPI.update(editingItem.id, data) : areasAPI.create(data),
    onSuccess: () => {
      toast({ title: 'Success', description: `Area ${editingItem ? 'updated' : 'created'} successfully.`, variant: 'success' });
      onFinish(true);
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.response?.data?.error || 'Failed to save area.', variant: 'destructive' });
    },
  });

  const cityOptions = (citiesData || []).map((c) => ({ value: c.id, label: c.name }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Edit Area' : 'Add Area'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
          <div>
            <Label>Area Name</Label>
            <Input {...register('name')} placeholder="Menteng" className="mt-1" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label>City</Label>
            <Controller
              name="city_id"
              control={control}
              render={({ field }) => (
                <Select
                  options={cityOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select city..."
                  className="mt-1"
                />
              )}
            />
            {errors.city_id && <p className="text-red-500 text-xs mt-1">{errors.city_id.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saveMutation.isPending} className="bg-green-600 hover:bg-green-700">
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

export default AddEditAreaDialog;
