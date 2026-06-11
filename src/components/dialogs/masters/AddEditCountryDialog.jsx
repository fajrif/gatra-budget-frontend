import React, { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { countriesAPI } from '@/api/endpoints';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { countrySchema } from '@/utils/validations/Country';
import { useToast } from '@/components/ui/use-toast';

const AddEditCountryDialog = ({ isOpen, onClose, editingItem, onFinish }) => {
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(countrySchema),
    defaultValues: editingItem || { name: '', code: '' },
  });

  useEffect(() => {
    reset(editingItem || { name: '', code: '' });
  }, [editingItem, reset]);

  const saveMutation = useMutation({
    mutationFn: (data) =>
      editingItem ? countriesAPI.update(editingItem.id, data) : countriesAPI.create(data),
    onSuccess: () => {
      toast({ title: 'Success', description: `Country ${editingItem ? 'updated' : 'created'} successfully.`, variant: 'success' });
      onFinish(true);
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.response?.data?.error || 'Failed to save country.', variant: 'destructive' });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Edit Country' : 'Add Country'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
          <div>
            <Label>Country Name</Label>
            <Input {...register('name')} placeholder="Indonesia" className="mt-1" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label>Code (ISO 3166-1 alpha-2)</Label>
            <Input {...register('code')} placeholder="ID" maxLength={2} className="mt-1 uppercase" />
            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
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

export default AddEditCountryDialog;
