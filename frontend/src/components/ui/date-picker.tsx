'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  date: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  captionLayout?: "dropdown" | "dropdown-buttons" | "buttons";
  fromYear?: number;
  toYear?: number;
}

export function DatePicker({
  date,
  onChange,
  placeholder = 'Pick a date',
  captionLayout = "dropdown-buttons",
  fromYear,
  toYear,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    // Ensure that if only month/year is selected, it defaults to the first day
    // The Calendar component from react-day-picker already handles this when using dropdowns
    // If selectedDate is undefined, it means the user cleared the selection
    onChange(selectedDate || null);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={handleSelect}
          defaultMonth={date || undefined}
          initialFocus
          captionLayout={captionLayout}
          fromYear={fromYear}
          toYear={toYear}
        />
      </PopoverContent>
    </Popover>
  );
}
