'use client';

import * as React from 'react';
import { Clock } from 'lucide-react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value?: string;
  onChange: (time: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TimePicker({
  value = '08:00',
  onChange,
  onBlur,
  placeholder = 'Select time',
  disabled = false,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [hours, minutes] = (value || '08:00').split(':').map(Number);
  
  const hourScrollRef = React.useRef<HTMLDivElement>(null);
  
  const hoursList = Array.from({ length: 24 }, (_, i) => i);
  const minutesList = [0, 30]; // Only 00 and 30

  React.useEffect(() => {
    if (isOpen && hourScrollRef.current) {
      setTimeout(() => {
        const selectedHourBtn = hourScrollRef.current?.querySelector(
          `[data-value="${hours}"]`
        );
        selectedHourBtn?.scrollIntoView({
          block: 'center',
          behavior: 'smooth',
        });
      }, 100);
    }
  }, [isOpen, hours]);

  // Handle wheel event explicitly
  const handleWheel = React.useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const container = e.currentTarget;
    container.scrollTop += e.deltaY;
  }, []);

  const handleTimeChange = (type: 'hour' | 'minute', val: number) => {
    let newH = hours;
    let newM = minutes;
    if (type === 'hour') newH = val;
    if (type === 'minute') {
      newM = val;
      setIsOpen(false);
      onBlur?.();
    }
    const formatted = `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
    onChange(formatted);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal h-9',
            !value && 'text-muted-foreground'
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 bg-popover" 
        align="start"
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="flex divide-x">
          {/* Hours Column */}
          <div className="flex flex-col w-16">
            <div className="flex-none py-2 text-center border-b bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground">Hr</span>
            </div>
            <div
              ref={hourScrollRef}
              onWheel={handleWheel}
              className="h-[240px] overflow-y-scroll p-1.5 space-y-0.5 overscroll-contain"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'hsl(var(--border)) transparent',
              }}
            >
              <div className="h-[90px] w-full shrink-0" />
              {hoursList.map((h) => (
                <Button
                  key={h}
                  data-value={h}
                  size="sm"
                  variant={hours === h ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-center rounded-full font-normal h-8 shrink-0',
                    hours !== h && 'text-muted-foreground opacity-60 hover:opacity-100'
                  )}
                  onClick={() => handleTimeChange('hour', h)}
                >
                  {h.toString().padStart(2, '0')}
                </Button>
              ))}
              <div className="h-[90px] w-full shrink-0" />
            </div>
          </div>
          
          {/* Minutes Column - Only 00 and 30 */}
          <div className="flex flex-col w-16">
            <div className="flex-none py-2 text-center border-b bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground">Min</span>
            </div>
            <div className="h-[240px] flex flex-col items-center justify-center p-1.5 gap-3">
              {minutesList.map((m) => (
                <Button
                  key={m}
                  data-value={m}
                  size="sm"
                  variant={minutes === m ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-center rounded-full font-normal h-12 text-base',
                    minutes !== m && 'text-muted-foreground opacity-60 hover:opacity-100'
                  )}
                  onClick={() => handleTimeChange('minute', m)}
                >
                  {m.toString().padStart(2, '0')}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

