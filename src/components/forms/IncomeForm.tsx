import { useCallback } from 'react';
import type { Income, IncomeCategory } from '../../lib/budget.types';

const INCOME_CATEGORIES: { value: IncomeCategory; label: string }[] = [
  { value: 'Salary', label: 'Salary' },
  { value: 'Bonus', label: 'Bonus' },
  { value: 'Freelance', label: 'Freelance' },
  { value: 'Investment', label: 'Investment' },
  { value: 'Gift', label: 'Gift' },
  { value: 'Other', label: 'Other' },
];

export interface IncomeFormProps {
  value: Income;
  onChange: (val: Income) => void;
}

export default function IncomeForm({ value, onChange }: IncomeFormProps) {
  const handleFieldChange = useCallback(
    (field: keyof Income, val: unknown) => {
      onChange({ ...value, [field]: val });
    },
    [value, onChange],
  );

  return (
    <div className='flex flex-col gap-4'>
      <h2 className='text-center text-xl font-semibold'>Income</h2>
      {/* Label */}
      <div>
        <label className='font-medium'>Label</label>
        <input
          type='text'
          className='w-full rounded border border-gray-300 px-2 py-1 focus:border-emerald-500 focus:outline-none dark:border-gray-700'
          value={value.label}
          onChange={(e) => handleFieldChange('label', e.target.value)}
        />
      </div>

      {/* Description */}
      <div>
        <label className='font-medium'>Description</label>
        <input
          type='text'
          className='w-full rounded border border-gray-300 px-2 py-1 focus:border-emerald-500 focus:outline-none dark:border-gray-700'
          value={value.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
        />
      </div>

      {/* Amount */}
      <div>
        <label className='font-medium'>Amount</label>
        <input
          type='number'
          min={0}
          step='0.01'
          className='w-32 rounded border border-gray-300 px-2 py-1 focus:border-emerald-500 focus:outline-none dark:border-gray-700'
          value={value.amount}
          onChange={(e) => handleFieldChange('amount', Number(e.target.value))}
        />
      </div>

      {/* Source */}
      <div>
        <label className='font-medium'>Source</label>
        <input
          type='text'
          className='w-full rounded border border-gray-300 px-2 py-1 focus:border-emerald-500 focus:outline-none dark:border-gray-700'
          value={value.source}
          onChange={(e) => handleFieldChange('source', e.target.value)}
        />
      </div>

      {/* Category */}
      <div>
        <label className='font-medium'>Category</label>
        <div className='mt-1 flex flex-wrap gap-2'>
          {INCOME_CATEGORIES.map((opt) => (
            <button
              key={opt.value}
              type='button'
              className={`btn btn-sm ${value.category === opt.value ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleFieldChange('category', opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {value.category === 'Other' && (
          <input
            type='text'
            className='mt-2 w-full rounded border border-gray-300 px-2 py-1 focus:border-emerald-500 focus:outline-none dark:border-gray-700'
            placeholder='Other category'
            value={value.otherCategory}
            onChange={(e) => handleFieldChange('otherCategory', e.target.value)}
          />
        )}
      </div>

      {/* Notes */}
      <div>
        <label className='font-medium'>Notes</label>
        <textarea
          className='w-full rounded border border-gray-300 px-2 py-1 focus:border-emerald-500 focus:outline-none dark:border-gray-700'
          value={value.notes}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );
}
