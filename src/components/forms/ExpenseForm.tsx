import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useShallow } from 'zustand/shallow';
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
  const lastUsedExpenseCategory = useSpace(
    useShallow((state) => state.lastUsedExpenseCategory),
  );
  const [activeSheet, configTimeWindow, sheets] = useSpace(
    useShallow((state) => [
      state.space?.config?.activeSheet || 'all',
      state.space?.config?.timeWindow,
      state.space?.sheets,
    ]),
  );

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
    // Get the current sheet's timeWindow, or fall back to config timeWindow
    const activeSheetObj = activeSheet !== 'all' && sheets
      ? sheets.find((s) => s.id === activeSheet)
      : null;
    const defaultCadence = activeSheetObj?.timeWindow ?? configTimeWindow ?? {
      type: 'month',
      interval: 1,
    };

    const defaultExpense: Expense = {
      id: generateId('budget'),
      label: '',
      description: '',
      amount: 0,
      category: lastUsedExpenseCategory || 'Housing',
      subCategory: '',
      cadence: defaultCadence,
      notes: '',
      // Pre-select active sheet if creating new item and not on 'all' view
      sheets: !expenseItemId && activeSheet !== 'all' ? [activeSheet] : undefined,
    };

    const existingExpense = expensesMap[expenseItemId || ''] ?? {};
    const expense: Expense = {
      ...defaultExpense,
      ...existingExpense,
      amount: existingExpense.originalAmount || 0,
    };
    setFormData(expense);

    if (expense?.subCategory) {
      setShowSubcategory(true);
    }
  }, [expenseItemId, expensesMap, activeSheet, configTimeWindow, sheets, lastUsedExpenseCategory]);

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
    (formData?.cadence && !formData?.cadence?.interval) || // Only validate cadence if it exists
    !formData?.sheets ||
    formData?.sheets.length === 0;

  return (
    <BudgetItemForm
      type='expense'
      label={formData?.label}
      description={formData?.description}
      amount={formData?.amount}
      cadence={formData?.cadence}
      end={formData?.end}
      notes={formData?.notes}
      sheets={formData?.sheets}
      onFieldChange={(field, val) =>
        handleFieldChange(field as keyof Expense, val)
      }
      saveButtonDisabled={isSaveDisabled}
      onSave={handleSave}
      nameInputPlaceholder='e.g. Rent, Groceries, etc.'
    >
      {/* Category */}
      <div>
        <label className='font-medium text-sm sm:text-base'>Category</label>
        <Combobox
          value={formData?.category ?? ''}
          options={categoryOptions}
          onChange={(val) => {
            handleFieldChange('category', val);
          }}
          allowAdd={true}
          placeholder='Select or add category...'
          accentColor='red'
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
