'use client';

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  onDateRangeChange?: (startDate: Date, endDate: Date) => void;
  className?: string;
}

export const DateRangePicker = React.forwardRef<
  HTMLDivElement,
  DateRangePickerProps
>(({ onDateRangeChange, className }, ref) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 7);

  const last30Days = new Date(today);
  last30Days.setDate(last30Days.getDate() - 30);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState<string>(
    last7Days.toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    today.toISOString().split('T')[0]
  );
  const [activePreset, setActivePreset] = useState<string>('7days');

  const handlePreset = (preset: string) => {
    setActivePreset(preset);
    let newStart = today;
    let newEnd = today;

    switch (preset) {
      case 'today':
        newStart = today;
        break;
      case 'yesterday':
        newStart = yesterday;
        newEnd = yesterday;
        break;
      case '7days':
        newStart = last7Days;
        break;
      case '30days':
        newStart = last30Days;
        break;
      case 'month':
        newStart = monthStart;
        break;
    }

    setStartDate(newStart.toISOString().split('T')[0]);
    setEndDate(newEnd.toISOString().split('T')[0]);

    if (onDateRangeChange) {
      onDateRangeChange(newStart, newEnd);
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setStartDate(newStart);
    setActivePreset('');
    if (onDateRangeChange) {
      onDateRangeChange(new Date(newStart), new Date(endDate));
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value;
    setEndDate(newEnd);
    setActivePreset('');
    if (onDateRangeChange) {
      onDateRangeChange(new Date(startDate), new Date(newEnd));
    }
  };

  return (
    <div ref={ref} className={cn('space-y-3', className)}>
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={activePreset === 'today' ? 'default' : 'outline'}
          onClick={() => handlePreset('today')}
          className="text-xs"
        >
          Bugün
        </Button>
        <Button
          size="sm"
          variant={activePreset === 'yesterday' ? 'default' : 'outline'}
          onClick={() => handlePreset('yesterday')}
          className="text-xs"
        >
          Dünən
        </Button>
        <Button
          size="sm"
          variant={activePreset === '7days' ? 'default' : 'outline'}
          onClick={() => handlePreset('7days')}
          className="text-xs"
        >
          Son 7 gün
        </Button>
        <Button
          size="sm"
          variant={activePreset === '30days' ? 'default' : 'outline'}
          onClick={() => handlePreset('30days')}
          className="text-xs"
        >
          Son 30 gün
        </Button>
        <Button
          size="sm"
          variant={activePreset === 'month' ? 'default' : 'outline'}
          onClick={() => handlePreset('month')}
          className="text-xs"
        >
          Bu ay
        </Button>
      </div>

      {/* Date Inputs */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-gray-600 dark:text-gray-400" />
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
          />
        </div>
        <span className="text-gray-400 dark:text-gray-500">—</span>
        <input
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
        />
      </div>
    </div>
  );
});

DateRangePicker.displayName = 'DateRangePicker';
