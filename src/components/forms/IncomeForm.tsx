import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useShallow } from 'zustand/shallow';
import { useBudget } from '../../hooks';
import { formulaIdsToLabels, formulaLabelsToIds, URL_PARAM_ID } from '../../lib';
import type { Income } from '../../lib/budget.types';
import { useSpace } from '../../store';
import { generateId } from '../../utils';
import { Combobox } from '../ui/Combobox';
import BudgetItemForm from './BudgetItemForm';

export default function IncomeForm() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<Income>();
  const incomeItemId = searchParams.get(URL_PARAM_ID);
  const { incomesMap, incomeSources, incomesInSpace, expensesInSpace } = useBudget();
  const { addIncome, updateIncome } = useSpace();
  const activeSheet = useSpace(
    useShallow((state) => state.space?.config?.activeSheet || 'all'),
  );

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
      formula: '',
      // Pre-select active sheet if creating new item and not on 'all' view
      sheets: !incomeItemId && activeSheet !== 'all' ? [activeSheet] : undefined,
    };

    const existingIncome = incomesMap[incomeItemId || ''] ?? {};
    
    // Convert formula IDs to labels for display
    let displayFormula = existingIncome.formula || '';
    if (displayFormula && incomesInSpace && expensesInSpace) {
      displayFormula = formulaIdsToLabels(displayFormula, incomesInSpace, expensesInSpace);
    }
    
    const income: Income = {
      ...defaultIncome,
      ...existingIncome,
      amount: existingIncome.originalAmount || existingIncome.amount || 0,
      formula: displayFormula,
    };
    setFormData(income);
  }, [incomeItemId, incomesMap, activeSheet, incomesInSpace, expensesInSpace]);

  const handleFieldChange = (field: keyof Income, val: unknown) => {
    setFormData((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: val } as Income;
    });
  };

  const handleSave = () => {
    if (!formData || !incomesInSpace || !expensesInSpace) return;
    
    // Convert formula labels to IDs before saving
    // Include the current item in the list so self-references work
    const incomesWithCurrent = incomeItemId 
      ? incomesInSpace.map(inc => inc.id === incomeItemId ? formData : inc)
      : [...incomesInSpace, formData];
    
    let storageFormula = formData.formula || '';
    if (storageFormula) {
      storageFormula = formulaLabelsToIds(storageFormula, incomesWithCurrent, expensesInSpace);
    }
    
    const dataToSave = {
      ...formData,
      formula: storageFormula,
    };
    
    if (incomeItemId) {
      updateIncome(incomeItemId, dataToSave);
    } else {
      addIncome(dataToSave);
    }
  };

  const isSaveDisabled =
    !formData?.label ||
    (!(formData?.formula && formData.formula.trim() !== '') && (!formData?.amount || formData?.amount <= 0)) ||
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
      formula={formData?.formula}
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
