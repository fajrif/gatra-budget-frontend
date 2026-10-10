import React, { useState, useRef, useEffect, type MouseEvent as ReactMouseEvent } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  /** Options rendered in the dropdown. */
  options?: SelectOption[];
  /** Currently selected value. */
  value?: string;
  /** Receives the selected option value, or `''` when cleared. */
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Renders the trigger in an error state. */
  error?: boolean;
  /** Enable search (default: true). */
  searchable?: boolean;
  /** Show clear button (default: true). */
  clearable?: boolean;
  /** Message when no options (default: "No options available"). */
  emptyMessage?: string;
  /** Extra attributes spread onto the wrapper element. */
  [key: string]: unknown;
}

/**
 * Select Component - A searchable select component that works with react-hook-form
 */
const Select = ({
  options = [],
  value,
  onChange,
  placeholder = 'Pilih...',
  disabled = false,
  className = '',
  error = false,
  searchable = true,
  clearable = true,
  emptyMessage = 'Tidak ada opsi tersedia',
  ...props
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get selected option label
  const selectedOption = options.find((opt) => opt.value === value);
  const selectedLabel = selectedOption?.label || '';

  // Filter options based on search term
  const filteredOptions =
    searchable && searchTerm
      ? options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()))
      : options;

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [isOpen, searchable]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (isOpen) {
        setSearchTerm('');
      }
    }
  };

  const handleSelect = (option: SelectOption) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: ReactMouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div ref={selectRef} className={cn('relative w-full', className)} {...props}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors',
          error && 'border-red-500 focus:ring-red-500',
        )}
      >
        <span className={cn('truncate', !selectedLabel && 'text-muted-foreground')}>
          {selectedLabel || placeholder}
        </span>

        <div className="flex items-center gap-1">
          {clearable && selectedLabel && !disabled && (
            <X
              className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity"
              onClick={handleClear}
            />
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 opacity-50 transition-transform',
              isOpen && 'transform rotate-180',
            )}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
          {/* Search Input */}
          {searchable && (
            <div className="flex items-center border-b px-3 py-2 bg-background/50">
              <Search className="h-4 w-4 opacity-50 mr-2 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Cari..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <X
                  className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer transition-opacity ml-2 flex-shrink-0"
                  onClick={() => setSearchTerm('')}
                />
              )}
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    'relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm outline-none',
                    'hover:bg-accent hover:text-accent-foreground',
                    'transition-colors',
                    option.value === value && 'bg-accent/50 font-medium',
                  )}
                >
                  {option.label}
                  {option.value === value && <span className="ml-auto text-xs opacity-50">✓</span>}
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {searchTerm ? 'Hasil tidak ditemukan.' : emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

Select.displayName = 'Select';

export default Select;