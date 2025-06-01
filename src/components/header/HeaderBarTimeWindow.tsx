import { useShallow } from 'zustand/shallow';
import {
  DEFAULT_TIME_WINDOW,
  type BudgetItemCadence,
  type BudgetItemCadenceType,
} from '../../lib';
import { useSpace } from '../../store';
import { CalendarClockIcon } from 'lucide-react';

export default function HeaderBarWindowSelector() {
  const timeWindow = useSpace(
    useShallow((state) => state?.space?.config?.timeWindow),
  );
  const { updateConfig } = useSpace();

  const handleChange = (field: keyof BudgetItemCadence, value: unknown) => {
    updateConfig({
      timeWindow: {
        ...timeWindow,
        [field]: value,
      },
    });
  };

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <CalendarClockIcon className='size-6 stroke-1 text-gray-500' />
      <input
        type='number'
        min={1}
        className='w-16 rounded border border-gray-300 px-2 py-1 focus:border-emerald-500 focus:outline-none dark:border-gray-700'
        aria-description='Enter the time window interval'
        value={timeWindow?.interval ?? DEFAULT_TIME_WINDOW.interval}
        onChange={(e) => handleChange('interval', Number(e.target.value))}
      />
      <select
        className='rounded border border-gray-300 px-2 py-1 focus:border-emerald-500 focus:outline-none dark:border-gray-700'
        value={timeWindow?.type ?? DEFAULT_TIME_WINDOW.type}
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
