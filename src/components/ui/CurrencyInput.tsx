import type { InputHTMLAttributes } from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { Input } from '@/components/ui/input';

export interface CurrencyInputProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'name'> {
  /** Provide both `control` and `name` to run in React Hook Form mode. */
  control?: Control<TFieldValues>;
  name?: FieldPath<TFieldValues>;
  /** Standalone mode value. */
  value?: number | string;
  /** Standalone mode change handler; receives a number or `''` when cleared. */
  onChange?: (value: number | '') => void;
}

const CurrencyInput = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  value: propValue,
  onChange: propOnChange,
  ...props
}: CurrencyInputProps<TFieldValues>) => {
  const formatCurrency = (value: number | string | undefined) => {
    if (!value && value !== 0) return '';
    // Hapus karakter non-digit sebelum format ulang
    const raw = String(value).replace(/[^\d]/g, '');
    if (raw === '') return '';
    const numericValue = parseInt(raw, 10);
    // Format sebagai IDR tanpa desimal
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericValue);
  };

  const parseCurrency = (value: string) => {
    // Hapus simbol mata uang, titik ribuan, dan koma desimal untuk mendapatkan angka murni
    return value.replace(/[Rp.]/g, '').replace(/,/g, '');
  };

  // If control and name are provided, use react-hook-form Controller
  if (control && name) {
    return (
      <div className="space-y-2">
        <Controller
          name={name}
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              id={name}
              type="text"
              className="text-left"
              {...props}
              // Tampilkan nilai yang sudah diformat
              value={formatCurrency(value as number | string | undefined)}
              onChange={(e) => {
                // Saat input berubah, simpan nilai MURNI (tanpa format Rp.) di state RHF
                const rawValue = parseCurrency(e.target.value);
                onChange(rawValue === '' ? '' : parseFloat(rawValue));
              }}
            />
          )}
        />
      </div>
    );
  }

  // Standalone mode - use value and onChange props directly
  return (
    <Input
      type="text"
      {...props}
      value={formatCurrency(propValue)}
      onChange={(e) => {
        const rawValue = parseCurrency(e.target.value);
        propOnChange?.(rawValue === '' ? '' : parseFloat(rawValue));
      }}
    />
  );
};

export { CurrencyInput };