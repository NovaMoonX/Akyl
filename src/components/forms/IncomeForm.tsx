import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useBudget } from '../../hooks';
import { URL_PARAM_ID } from '../../lib';
import type { Income, IncomeCategory } from '../../lib/budget.types';
import { generateId } from '../../utils';
import BudgetItemForm from './BudgetItemForm';

const INCOME_CATEGORIES: { value: IncomeCategory; label: string }[] = [
  { value: 'Salary', label: 'Salary' },
  { value: 'Bonus', label: 'Bonus' },
  { value: 'Freelance', label: 'Freelance' },
  { value: 'Investment', label: 'Investment' },
  { value: 'Gift', label: 'Gift' },
  { value: 'Other', label: 'Other' },
];

export default function IncomeForm() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<Income>();
  const incomeItemId = searchParams.get(URL_PARAM_ID);
  const { incomesMap } = useBudget();

  useEffect(() => {
    const defaultIncome: Income = {
      id: generateId('budget'),
      label: '',
      description: '',
      amount: 0,
      source: '',
      category: 'Salary',
      otherCategory: '',
      cadence: {
        type: 'month',
        interval: 1,
      },
      notes: '',
    };

    const existingIncome = incomesMap[incomeItemId || ''] ?? {};
    const income: Income = { ...defaultIncome, ...existingIncome };
    setFormData(income);
  }, [incomeItemId, incomesMap]);

  const handleFieldChange = (field: keyof Income, val: unknown) => {
    setFormData((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: val } as Income;
    });
  };

  return (
    <BudgetItemForm
      label={formData?.label}
      description={formData?.description}
      amount={formData?.amount}
      cadence={formData?.cadence}
      notes={formData?.notes}
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
          placeholder='e.g. Company Name'
          value={formData?.source ?? ''}
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
              className={`btn btn-sm ${formData?.category === opt.value ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleFieldChange('category', opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {formData?.category === 'Other' && (
          <input
            type='text'
            className='mt-2 w-full rounded border border-gray-300 px-2 py-1 focus:border-emerald-500 focus:outline-none dark:border-gray-700'
            placeholder='Other category'
            value={formData?.otherCategory ?? ''}
            onChange={(e) => handleFieldChange('otherCategory', e.target.value)}
          />
        )}
      </div>
    </BudgetItemForm>
  );
}
