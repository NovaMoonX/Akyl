import { useEffect, useMemo, useState } from 'react';
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
  const [, setShowSubcategory] = useState(false);
  const expenseItemId = searchParams.get(URL_PARAM_ID);
  const { expensesMap, expenseCategories } = useBudget(); // expenseSubCategoriesMap
  const { addExpense, updateExpense } = useSpace();

  // Category options: only add custom category if not already present
  const categoryOptions = useMemo(() => {
    return expenseCategories.map((cat) => ({ value: cat, label: cat }));
  }, [expenseCategories]);

  // FUTURE: add feature for expense subcategories
  // Subcategory options: only add custom subcategory if not already present
  // const subCategoryOptions = useMemo(() => {
  //   const category = formData?.category ?? '';
  //   const subCategories = expenseSubCategoriesMap[category] ?? [];
  //   return subCategories.map((sub) => ({ value: sub, label: sub }));
  // }, [formData, expenseSubCategoriesMap]);

  useEffect(() => {
    const defaultExpense: Expense = {
      id: generateId('budget'),
      label: '',
      description: '',
      amount: 0,
      category: 'Housing',
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

    if (expense?.subCategory) {
      setShowSubcategory(true);
    }
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
    !formData?.category ||
    !formData?.cadence?.interval;

  return (
    <BudgetItemForm
      type='expense'
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
      nameInputPlaceholder='e.g. Rent, Groceries, etc.'
    >
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

        {/* {!showSubcategory && (
          <div className='flex justify-end'>
            <button
              type='button'
              className='mt-1 ml-auto text-sm underline opacity-70 hover:opacity-85'
              onClick={() => setShowSubcategory(true)}
            >
              Add subcategory
            </button>
          </div>
        )} */}
      </div>

      {/* {showSubcategory && (
        <div>
          <label className='font-medium'>Subcategory</label>
          <Combobox
            value={formData?.subCategory ?? ''}
            options={subCategoryOptions}
            onChange={(val) => handleFieldChange('subCategory', val)}
            allowAdd={true}
            placeholder='Select or add subcategory...'
          />
        </div>
      )} */}
    </BudgetItemForm>
  );
}
