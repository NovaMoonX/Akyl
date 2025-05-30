import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useBudget } from '../../hooks';
import { URL_PARAM_ID } from '../../lib';
import type { Expense } from '../../lib/budget.types';
import { useSpace } from '../../store';
import { generateId } from '../../utils';
import { Combobox } from '../ui/Combobox';
import BudgetItemForm from './BudgetItemForm';

export default function ExpenseForm() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<Expense>();
  const expenseItemId = searchParams.get(URL_PARAM_ID);
  const { expensesMap, expenseSubCategoriesMap, expenseCategories } =
    useBudget();
  const { addExpense, updateExpense } = useSpace();

  useEffect(() => {
    const defaultExpense: Expense = {
      id: generateId('budget'),
      label: '',
      description: '',
      amount: 0,
      category: 'Housing',
      otherCategory: '',
      subCategory: '',
      cadence: {
        type: 'month',
        interval: 1,
      },
      notes: '',
    };

    const existingExpense = expensesMap[expenseItemId || ''] ?? {};
    const expense: Expense = { ...defaultExpense, ...existingExpense };
    setFormData(expense);
  }, [expenseItemId, expensesMap]);

  const handleFieldChange = (field: keyof Expense, val: unknown) => {
    setFormData((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: val } as Expense;
    });
  };

  const handleSave = () => {
    if (!formData) return;
    if (expenseItemId) {
      updateExpense(expenseItemId, formData);
    } else {
      addExpense(formData);
    }
  };

  const isSaveDisabled =
    !formData?.label ||
    !formData?.amount ||
    formData?.amount <= 0 ||
    !formData?.category;

  return (
    <BudgetItemForm
      title={expenseItemId ? 'Edit Expense' : 'Add Expense'}
      label={formData?.label}
      description={formData?.description}
      amount={formData?.amount}
      cadence={formData?.cadence}
      notes={formData?.notes}
      onFieldChange={(field, val) =>
        handleFieldChange(field as keyof Expense, val)
      }
      saveButtonDisabled={isSaveDisabled}
      onSave={handleSave}
    >
      {/* Category */}
      <div>
        <label className='font-medium'>Category</label>
        <Combobox
          value={
            formData?.category === 'Other'
              ? (formData?.otherCategory ?? '')
              : (formData?.category ?? '')
          }
          options={[
            ...(formData?.otherCategory
              ? [
                  {
                    value: formData.otherCategory,
                    label: formData.otherCategory,
                  },
                ]
              : []),
            ...expenseCategories.map((cat) => ({
              value: cat,
              label: cat,
            })),
          ]}
          onChange={(val) => {
            handleFieldChange('category', val);
            handleFieldChange('otherCategory', '');
          }}
          allowAdd={true}
          onAddOption={(val) => {
            handleFieldChange('otherCategory', val);
            handleFieldChange('category', 'Other');
          }}
          placeholder='Select or add category...'
        />
      </div>

      {/* Subcategory */}
      <div>
        <label className='font-medium'>Subcategory</label>
        <Combobox
          value={formData?.subCategory ?? ''}
          options={
            expenseSubCategoriesMap[formData?.category ?? '']?.map((sub) => ({
              value: sub,
              label: sub,
            })) ?? []
          }
          onChange={(val) => handleFieldChange('subCategory', val)}
          allowAdd={true}
          onAddOption={(val) => handleFieldChange('subCategory', val)}
          placeholder='Select or add subcategory...'
        />
      </div>
    </BudgetItemForm>
  );
}
