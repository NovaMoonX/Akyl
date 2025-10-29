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
  const { incomesMap, incomeSources } = useBudget(); // incomeTypes
  const { addIncome, updateIncome } = useSpace();

  const sourceOptions = useMemo(() => {
    return incomeSources.map((src) => ({
      value: src,
      label: src,
    }));
  }, [incomeSources]);

  // FUTURE: add feature for income types
  // const typeOptions = useMemo(() => {
  //   return incomeTypes.map((cat) => ({
  //     value: cat,
  //     label: cat,
  //   }));
  // }, [incomeTypes]);

  useEffect(() => {
    const defaultIncome: Income = {
      id: generateId('budget'),
      label: '',
      description: '',
      amount: 0,
      source: '',
      type: 'Salary',
      cadence: {
        type: 'month',
        interval: 1,
      },
      notes: '',
    };

    const existingIncome = incomesMap[incomeItemId || ''] ?? {};
    const income: Income = {
      ...defaultIncome,
      ...existingIncome,
      amount: existingIncome.originalAmount || 0,
    };
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
    !formData?.type ||
    !formData?.cadence?.interval;

  return (
    <BudgetItemForm
      type='income'
      label={formData?.label}
      description={formData?.description}
      amount={formData?.amount}
      cadence={formData?.cadence}
      notes={formData?.notes}
      sheets={formData?.sheets}
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

      {/* Type */}
      {/* <div>
        <label className='font-medium'>Type</label>
        <Combobox
          value={formData?.type ?? ''}
          options={typeOptions}
          onChange={(val) => {
            handleFieldChange('type', val);
          }}
          allowAdd={true}
          placeholder='Select or add type...'
        />
      </div> */}
    </BudgetItemForm>
  );
}
