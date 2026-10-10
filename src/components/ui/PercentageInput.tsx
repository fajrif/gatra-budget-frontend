import type { InputHTMLAttributes } from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { Input } from '@/components/ui/input';

export interface PercentageInputProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'name'> {
  /** Provide both `control` and `name` to run in React Hook Form mode. */
  control?: Control<TFieldValues>;
  name?: FieldPath<TFieldValues>;
  /** Standalone mode value. */
  value?: number | string;
  /** Standalone mode change handler; always receives a number between 0 and 100. */
  onChange?: (value: number) => void;
}

const PercentageInput = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  value: propValue,
  onChange: propOnChange,
  ...props
}: PercentageInputProps<TFieldValues>) => {
  const formatPercentage = (value: number | string | undefined) => {
    if (!value && value !== 0) return '';
    return `${value}%`;
  };

  const parsePercentage = (value: string) => {
    return value.replace(/%/g, '');
  };

  // React Hook Form mode
  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <Input
            type="text"
            value={formatPercentage(value as number | string | undefined)}
            onChange={(e) => {
              const rawValue = parsePercentage(e.target.value);
              const numValue =
                rawValue === '' ? 0 : Math.min(100, Math.max(0, parseFloat(rawValue) || 0));
              onChange(numValue);
            }}
            {...props}
          />
        )}
      />
    );
  }

  // Standalone mode
  return (
    <Input
      type="text"
      value={formatPercentage(propValue)}
      onChange={(e) => {
        const rawValue = parsePercentage(e.target.value);
        const numValue = rawValue === '' ? 0 : Math.min(100, Math.max(0, parseFloat(rawValue) || 0));
        propOnChange?.(numValue);
      }}
      {...props}
    />
  );
};

export { PercentageInput };