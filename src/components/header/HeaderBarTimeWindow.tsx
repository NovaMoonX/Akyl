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
      state?.space?.config?.activeSheet,
      state?.space?.sheets,
    ]),
  );
  const { updateConfig, updateSheet } = useSpace();

  // Get current sheet's time window or fall back to global
  const activeSheetObj = activeSheet && activeSheet !== 'all' && sheets
    ? sheets.find((s) => s.id === activeSheet)
    : null;

  const currentTimeWindow = activeSheetObj?.timeWindow ?? timeWindow;

  const handleChange = (field: keyof BudgetItemCadence, value: unknown) => {
    const newTimeWindow = {
      ...currentTimeWindow,
      [field]: value,
    };
    
    if (!activeSheet || activeSheet === 'all') {
      updateConfig({ timeWindow: newTimeWindow });
    } else {
      updateSheet(activeSheet, { timeWindow: newTimeWindow });
    }
  };

  return (
    <div className='flex items-center gap-2'>
      <CalendarClockIcon className='size-6 stroke-1 text-gray-500' />
      <input
        type='number'
        min={1}
        className='w-12 rounded border border-gray-300 px-2 py-1 focus:border-emerald-500 focus:outline-none dark:border-gray-700'
        aria-description='Enter the time window interval'
        value={currentTimeWindow?.interval ?? DEFAULT_TIME_WINDOW.interval}
        onChange={(e) => handleChange('interval', Number(e.target.value))}
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
