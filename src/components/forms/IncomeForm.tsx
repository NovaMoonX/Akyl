import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useBudget } from '../../hooks';
import { URL_PARAM_ID } from '../../lib';
import type { Income, IncomeCategory } from '../../lib/budget.types';
import { generateId } from '../../utils';
import { Combobox } from '../ui/Combobox';
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
  const { incomesMap, incomeSources } = useBudget();

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
        <Combobox
          value={formData?.source ?? ''}
          options={incomeSources.map((src) => ({
            value: src,
            label: src,
          }))}
          onChange={(val) => handleFieldChange('source', val)}
          allowAdd={true}
          onAddOption={(val) => handleFieldChange('source', val)}
          placeholder='Select or add source...'
        />
      </div>

      {/* Category */}
      <div>
        <label className='font-medium'>Category</label>
        <Combobox
          value={formData?.category ?? ''}
          options={[
            ...INCOME_CATEGORIES,
            { value: 'Value', label: 'Value' },
            { value: 'Custom', label: 'Custom' },
          ]}
          onChange={(val) => handleFieldChange('category', val)}
          allowAdd={true}
          onAddOption={(val) => handleFieldChange('category', val)}
          placeholder='Select or add category...'
        />
      </div>
    </BudgetItemForm>
  );
}
