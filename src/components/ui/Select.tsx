'use client';

import { forwardRef, useState, useRef, useEffect } from 'react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  error?: string;
  className?: string;
  id?: string;
}

const Select = forwardRef<HTMLButtonElement, SelectProps>(
  ({ 
    options, 
    value, 
    defaultValue, 
    onValueChange, 
    placeholder = 'Selecione uma opção',
    disabled = false,
    label,
    error,
    className = '',
    id,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');
    const selectRef = useRef<HTMLDivElement>(null);
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const selectedOption = options.find(option => option.value === selectedValue);

    useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
      setSelectedValue(optionValue);
      setIsOpen(false);
      onValueChange?.(optionValue);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;

      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          setIsOpen(!isOpen);
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            // Focus next option logic could be added here
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            // Focus previous option logic could be added here
          }
          break;
        case 'Escape':
          setIsOpen(false);
          break;
      }
    };

    return (
      <div className="space-y-1">
        {label && (
          <label 
            htmlFor={selectId}
            className="text-sm font-medium text-foreground block"
          >
            {label}
          </label>
        )}
        <div className="relative" ref={selectRef}>
          <button
            ref={ref}
            id={selectId}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            disabled={disabled}
            className={`
              input cursor-pointer justify-between
              ${disabled ? 'cursor-not-allowed opacity-50' : ''}
              ${error ? 'border-destructive focus:border-destructive focus:ring-destructive/10' : ''}
              ${className}
            `}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            {...props}
          >
            <span className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <svg 
              className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute z-50 w-full mt-1 select-content">
              <div className="py-1">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`
                      select-item w-full text-left
                      ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      ${selectedValue === option.value ? 'bg-accent text-accent-foreground' : ''}
                    `}
                    disabled={option.disabled}
                    onClick={() => !option.disabled && handleSelect(option.value)}
                  >
                    {option.label}
                    {selectedValue === option.value && (
                      <svg 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4"
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
                {options.length === 0 && (
                  <div className="select-item text-muted-foreground cursor-default">
                    Nenhuma opção disponível
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
export type { SelectProps, SelectOption };