import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useBudget } from '../../hooks';
import { URL_PARAM_ID } from '../../lib';
import type { Income } from '../../lib/budget.types';
import { useSpace } from '../../store';
import { generateId } from '../../utils';
import { Combobox } from '../ui/Combobox';
import BudgetItemForm from './BudgetItemForm';

export default function IncomeForm() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<Income>();
  const incomeItemId = searchParams.get(URL_PARAM_ID);
  const { incomesMap, incomeSources, incomeCategories } = useBudget();
  const { addIncome, updateIncome } = useSpace();

  const sourceOptions = useMemo(() => {
    return incomeSources.map((src) => ({
      value: src,
      label: src,
    }));
  }, [incomeSources]);

  const categoryOptions = useMemo(() => {
    return incomeCategories.map((cat) => ({
      value: cat,
      label: cat,
    }));
  }, [incomeCategories]);

  useEffect(() => {
    const defaultIncome: Income = {
      id: generateId('budget'),
      label: '',
      description: '',
      amount: 0,
      source: '',
      category: 'Salary',
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

  const handleSave = () => {
    if (!formData) return;
    // Save logic here, e.g., update the budget store or make an API call
    if (incomeItemId) {
      updateIncome(incomeItemId, formData);
    } else {
      addIncome(formData);
    }
  };

  const isSaveDisabled =
    !formData?.label ||
    !formData?.amount ||
    formData?.amount <= 0 ||
    !formData?.source ||
    !formData?.category;

  return (
    <BudgetItemForm
      title={incomeItemId ? 'Edit Income' : 'Add Income'}
      label={formData?.label}
      description={formData?.description}
      amount={formData?.amount}
      cadence={formData?.cadence}
      notes={formData?.notes}
      onFieldChange={(field, val) =>
        handleFieldChange(field as keyof Income, val)
      }
      saveButtonDisabled={isSaveDisabled}
      onSave={handleSave}
      nameInputPlaceholder='e.g. Paycheck, Bonus, etc.'
    >
      {/* Source */}
      <div>
        <label className='font-medium'>Source</label>
        <Combobox
          value={formData?.source ?? ''}
          options={sourceOptions}
          onChange={(val) => handleFieldChange('source', val)}
          allowAdd={true}
          placeholder='Select or add source...'
        />
      </div>

      {/* Category */}
      <div>
        <label className='font-medium'>Category</label>
        <Combobox
          value={formData?.category ?? ''}
          options={categoryOptions}
          onChange={(val) => {
            handleFieldChange('category', val);
          }}
          allowAdd={true}
          placeholder='Select or add category...'
        />
      </div>
    </BudgetItemForm>
  );
}
