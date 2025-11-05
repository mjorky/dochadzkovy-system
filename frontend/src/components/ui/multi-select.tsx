'use client';

import * as React from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (selectedValues: string[]) => void;
  placeholder?: string;
  label?: string;
}

export function MultiSelect({
  options,
  selectedValues,
  onChange,
  placeholder = 'Select...',
  label,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (value: string) => {
    const newSelected = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(newSelected);
  };

  const handleSelectAll = () => {
    onChange(options.map((opt) => opt.value));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const selectedCount = selectedValues.length;
  const displayText =
    selectedCount === 0
      ? placeholder
      : selectedCount === 1
      ? options.find((opt) => opt.value === selectedValues[0])?.label
      : `${selectedCount} selected`;

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer flex items-center justify-between"
      >
        <span className={selectedCount === 0 ? 'text-muted-foreground' : ''}>
          {displayText}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="flex items-center justify-between p-2 border-b border-border">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-primary hover:underline"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-primary hover:underline"
            >
              Clear All
            </button>
          </div>
          <div className="p-1">
            {options.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <div
                  key={option.value}
                  onClick={() => handleToggle(option.value)}
                  className="flex items-center px-2 py-2 cursor-pointer hover:bg-accent rounded-sm"
                >
                  <div
                    className={`w-4 h-4 mr-2 border rounded flex items-center justify-center ${
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'border-input'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <span className="text-sm">{option.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
