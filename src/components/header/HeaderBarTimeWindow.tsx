import { useState } from 'react';
import { useShallow } from 'zustand/shallow';
import {
  DEFAULT_TIME_WINDOW,
  type BudgetItemCadence,
  type BudgetItemCadenceType,
} from '../../lib';
import { useSpace } from '../../store';
import { CalendarClockIcon } from 'lucide-react';

export default function HeaderBarWindowSelector() {
  const [timeWindow, activeSheet, sheets] = useSpace(
    useShallow((state) => [
      state?.space?.config?.timeWindow,
      state?.space?.config?.activeSheet || 'all',
      state?.space?.sheets,
    ]),
  );
  const { updateConfig, updateSheet } = useSpace();

  // Get current sheet's time window or fall back to global
  const activeSheetObj =
    activeSheet !== 'all' && sheets
      ? sheets.find((s) => s.id === activeSheet)
      : null;

  const currentTimeWindow = activeSheetObj?.timeWindow ?? timeWindow;

  // Local state for input value to allow clearing
  const [inputValue, setInputValue] = useState<string>(
    String(currentTimeWindow?.interval ?? DEFAULT_TIME_WINDOW.interval),
  );

  const handleChange = (field: keyof BudgetItemCadence, value: unknown) => {
    const newTimeWindow = {
      ...currentTimeWindow,
      [field]: value,
    };

    if (activeSheet === 'all') {
      updateConfig({ timeWindow: newTimeWindow });
    } else {
      updateSheet(activeSheet, { timeWindow: newTimeWindow });
    }
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Only update if value is a valid positive number
    const numValue = Number(value);
    if (value !== '' && !isNaN(numValue) && numValue > 0) {
      handleChange('interval', numValue);
    }
  };

  const handleIntervalBlur = () => {
    // Reset input value and ensure valid interval on blur
    const numValue = Number(inputValue);
    if (inputValue === '' || isNaN(numValue) || numValue <= 0) {
      // Reset to current or default value if invalid
      const resetValue =
        currentTimeWindow?.interval ?? DEFAULT_TIME_WINDOW.interval;
      handleChange('interval', resetValue);
      setInputValue(String(resetValue));
    }
  };

  return (
    <div className='flex items-center gap-2 text-sm sm:text-base'>
      <CalendarClockIcon className='size-6 stroke-1 text-gray-500' />
      <input
        type='number'
        min={0}
        step={0.5}
        className='w-14 rounded border border-gray-300 px-2 py-1 focus:border-emerald-500 focus:outline-none dark:border-gray-700'
        aria-description='Enter the time window interval'
        value={
          inputValue ??
          currentTimeWindow?.interval ??
          DEFAULT_TIME_WINDOW.interval
        }
        onChange={handleIntervalChange}
        onBlur={handleIntervalBlur}
      />
      <select
        className='rounded border border-gray-300 px-2 py-1 focus:border-emerald-500 focus:outline-none dark:border-gray-700'
        value={currentTimeWindow?.type ?? DEFAULT_TIME_WINDOW.type}
        onChange={(e) =>
          handleChange('type', e.target.value as BudgetItemCadenceType)
        }
        aria-description='Select the time window unit'
      >
        <option value='day'>day(s)</option>
        <option value='week'>week(s)</option>
        <option value='month'>month(s)</option>
        <option value='year'>year(s)</option>
      </select>
    </div>
  );
}
