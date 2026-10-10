import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  addressesAPI,
  countriesAPI,
  provincesAPI,
  citiesAPI,
  areasAPI,
} from '@/api/endpoints';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Select from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { addressSchema } from '@/utils/validations/Address';
import { useToast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { Save, Loader2 } from 'lucide-react';
import type { z } from 'zod';

export type AddressFormValues = z.infer<typeof addressSchema>;

/**
 * The grid row shape handed to the dialog. `area_id` is nullable on the Go
 * model (`*uuid.UUID` with `omitempty`), so widen it here — the dialog
 * normalises `null` to `''` before submitting.
 */
export type AddressEditingItem = Omit<AddressFormValues, 'area_id' | 'zipcode'> & {
  id?: string;
  area_id?: string | null;
  zipcode?: string | null;
};

export interface AddEditAddressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Address to edit; undefined when creating. */
  editingItem?: AddressEditingItem;
  /** Called with `shouldRefresh` after successful save. */
  onFinish: (shouldRefresh: boolean) => void;
}

const AddEditAddressDialog = ({
  isOpen,
  onClose,
  editingItem,
  onFinish,
}: AddEditAddressDialogProps) => {
  const { toast } = useToast();
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');

  const { data: countriesData } = useQuery({
    queryKey: ['countries-all'],
    queryFn: () => countriesAPI.getAll({ all: true }),
    select: (res) => res.data?.countries ?? [],
  });

  const { data: provincesData } = useQuery({
    queryKey: ['provinces-by-country', selectedCountryId],
    queryFn: () =>
      provincesAPI.getAll({ country_id: selectedCountryId, all: true }),
    select: (res) => res.data?.provinces ?? [],
    enabled: !!selectedCountryId,
  });

  const { data: citiesData } = useQuery({
    queryKey: ['cities-by-province', selectedProvinceId],
    queryFn: () =>
      citiesAPI.getAll({ province_id: selectedProvinceId, all: true }),
    select: (res) => res.data?.cities ?? [],
    enabled: !!selectedProvinceId,
  });

  const { data: areasData } = useQuery({
    queryKey: ['areas-by-city', selectedCityId],
    queryFn: () => areasAPI.getAll({ city_id: selectedCityId, all: true }),
    select: (res) => res.data?.areas ?? [],
    enabled: !!selectedCityId,
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: '',
      address: '',
      country_id: '',
      province_id: '',
      city_id: '',
      area_id: '',
      zipcode: '',
    },
  });

  useEffect(() => {
    if (editingItem) {
      const vals: AddressFormValues = {
        name: editingItem.name,
        address: editingItem.address,
        country_id: editingItem.country_id,
        province_id: editingItem.province_id,
        city_id: editingItem.city_id,
        area_id: editingItem.area_id || '',
        zipcode: editingItem.zipcode || '',
      };
      reset(vals);
      setSelectedCountryId(editingItem.country_id);
      setSelectedProvinceId(editingItem.province_id);
      setSelectedCityId(editingItem.city_id);
    } else {
      reset({
        name: '',
        address: '',
        country_id: '',
        province_id: '',
        city_id: '',
        area_id: '',
        zipcode: '',
      });
      setSelectedCountryId('');
      setSelectedProvinceId('');
      setSelectedCityId('');
    }
  }, [editingItem, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: AddressFormValues) =>
      editingItem?.id ? addressesAPI.update(editingItem.id, data) : addressesAPI.create(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Alamat ${editingItem ? 'berhasil diperbarui' : 'berhasil ditambahkan'}.`,
        variant: 'success',
      });
      onFinish(true);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: getErrorMessage(err, 'Gagal menyimpan alamat.'),
        variant: 'destructive',
      });
    },
  });

  const mapOptions = (items: { id: string; name: string }[] = []) =>
    items.map((c) => ({ value: c.id, label: c.name }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Ubah Alamat' : 'Tambah Alamat'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
          <div>
            <Label>Label</Label>
            <Input {...register('name')} placeholder="mis. Rumah, Kantor" className="mt-1" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label>Alamat Lengkap</Label>
            <Textarea
              {...register('address')}
              placeholder="Jl. Sudirman No. 1"
              className="mt-1"
              rows={2}
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Negara</Label>
              <Controller
                name="country_id"
                control={control}
                render={({ field }) => (
                  <Select
                    options={mapOptions(countriesData)}
                    value={field.value}
                    onChange={(val: string) => {
                      field.onChange(val);
                      setSelectedCountryId(val);
                      setValue('province_id', '');
                      setValue('city_id', '');
                      setValue('area_id', '');
                      setSelectedProvinceId('');
                      setSelectedCityId('');
                    }}
                    placeholder="Pilih..."
                    className="mt-1"
                  />
                )}
              />
              {errors.country_id && (
                <p className="text-red-500 text-xs mt-1">{errors.country_id.message}</p>
              )}
            </div>
            <div>
              <Label>Provinsi</Label>
              <Controller
                name="province_id"
                control={control}
                render={({ field }) => (
                  <Select
                    options={mapOptions(provincesData)}
                    value={field.value}
                    onChange={(val: string) => {
                      field.onChange(val);
                      setSelectedProvinceId(val);
                      setValue('city_id', '');
                      setValue('area_id', '');
                      setSelectedCityId('');
                    }}
                    placeholder="Pilih..."
                    className="mt-1"
                    disabled={!selectedCountryId}
                  />
                )}
              />
              {errors.province_id && (
                <p className="text-red-500 text-xs mt-1">{errors.province_id.message}</p>
              )}
            </div>
            <div>
              <Label>Kota</Label>
              <Controller
                name="city_id"
                control={control}
                render={({ field }) => (
                  <Select
                    options={mapOptions(citiesData)}
                    value={field.value}
                    onChange={(val: string) => {
                      field.onChange(val);
                      setSelectedCityId(val);
                      setValue('area_id', '');
                    }}
                    placeholder="Pilih..."
                    className="mt-1"
                    disabled={!selectedProvinceId}
                  />
                )}
              />
              {errors.city_id && (
                <p className="text-red-500 text-xs mt-1">{errors.city_id.message}</p>
              )}
            </div>
            <div>
              <Label>
                Area <span className="text-slate-400 text-xs">(opsional)</span>
              </Label>
              <Controller
                name="area_id"
                control={control}
                render={({ field }) => (
                  <Select
                    options={mapOptions(areasData)}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pilih..."
                    className="mt-1"
                    disabled={!selectedCityId}
                    clearable
                  />
                )}
              />
            </div>
          </div>
          <div>
            <Label>
              Kode Pos <span className="text-slate-400 text-xs">(opsional)</span>
            </Label>
            <Input {...register('zipcode')} placeholder="12345" className="mt-1 w-32" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
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

export default AddEditAddressDialog;