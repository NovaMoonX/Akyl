import { useCallback } from 'react';
import type { Income, IncomeCategory } from '../../lib/budget.types';
import BudgetItemForm from './BudgetItemForm';

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
    <BudgetItemForm
      label={value.label}
      description={value.description}
      amount={value.amount}
      cadence={value.cadence}
      notes={value.notes}
      onFieldChange={(field, val) =>
        handleFieldChange(field as keyof Income, val)
      }
    >
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
    </BudgetItemForm>
  );
}
