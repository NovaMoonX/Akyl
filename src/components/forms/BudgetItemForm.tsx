import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useShallow } from 'zustand/shallow';
import {
  CashFlowVerbiagePairs,
  getCurrencySymbol,
  URL_PARAM_ID,
  type BudgetType,
} from '../../lib';
import type { BudgetItemCadence } from '../../lib/budget.types';
import { findReferencingItems, validateFormula } from '../../lib/formula.actions';
import { useSpace } from '../../store';
import ConfirmationModal from '../modals/ConfirmationModal';
import FormulaHelper from '../ui/FormulaHelper';

export interface BudgetItemFormProps {
  type: BudgetType;
  label?: string;
  description?: string;
  amount?: number;
  cadence?: BudgetItemCadence;
  notes?: string;
  sheets?: string[];
  formula?: string;
  onFieldChange: (
    field: 'label' | 'description' | 'amount' | 'cadence' | 'notes' | 'sheets' | 'formula',
    value: unknown,
  ) => void;
  children?: React.ReactNode;
  saveButtonDisabled?: boolean;
  onSave?: () => void;
  nameInputPlaceholder?: string;
}

export default function BudgetItemForm({
  type,
  label = '',
  description = '',
  amount = 0,
  cadence = { type: 'month', interval: 1 },
  notes = '',
  sheets = [],
  formula = '',
  onFieldChange,
  children,
  saveButtonDisabled = false,
  onSave,
  nameInputPlaceholder,
}: BudgetItemFormProps) {
  const currency = useSpace(
    useShallow((state) => state.space?.config?.currency || 'USD'),
  );
  const cashFlowVerbiage = useSpace(
    useShallow((state) => state?.space.config?.cashFlowVerbiage),
  );
  const availableSheets = useSpace(
    useShallow((state) => state?.space?.sheets || []),
  );
  const [incomes, expenses] = useSpace(
    useShallow((state) => [state.space?.incomes || [], state.space?.expenses || []]),
  );
  const { removeExpense, removeIncome } = useSpace();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showDescription, setShowDescription] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showFormula, setShowFormula] = useState(false);
  const [showFormulaHelper, setShowFormulaHelper] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteWarningMessage, setDeleteWarningMessage] = useState<string>('');
  const [formulaValidation, setFormulaValidation] = useState<{
    isValid: boolean;
    error?: string;
  }>({ isValid: true });
  const formulaInputRef = useRef<HTMLInputElement>(null);
  const itemId = searchParams.get(URL_PARAM_ID);

  useEffect(() => {
    if (description.length > 0) {
      setShowDescription(true);
    }
    if (notes.length > 0) {
      setShowNotes(true);
    }
    if (formula && formula.length > 0) {
      setShowFormula(true);
    }
  }, [description, notes, formula]);

  // Validate formula when it changes
  useEffect(() => {
    if (!formula || formula.trim() === '') {
      setFormulaValidation({ isValid: true });
      return;
    }

    const result = validateFormula(formula);
    setFormulaValidation({
      isValid: result.isValid,
      error: result.error?.message,
    });
  }, [formula]);

  const handleDeleteClick = () => {
    if (!itemId) return;

    // Check if this item is referenced in any formulas
    const referencingItems = findReferencingItems(
      type,
      itemId,
      incomes,
      expenses,
    );

    const totalReferences = referencingItems.incomes.length + referencingItems.expenses.length;

    if (totalReferences > 0) {
      const itemNames = [
        ...referencingItems.incomes.map((i) => i.label),
        ...referencingItems.expenses.map((e) => e.label),
      ].join(', ');
      
      setDeleteWarningMessage(
        `This item is referenced in ${totalReferences} formula(s): ${itemNames}. Deleting it may cause errors in those calculations.`,
      );
    } else {
      setDeleteWarningMessage('');
    }

    setShowDeleteConfirmation(true);
  };

  const handleDelete = () => {
    if (!itemId) return;

    if (type === 'expense') {
      removeExpense(itemId);
    } else if (type === 'income') {
      removeIncome(itemId);
    }
    handleClose();
  };

  const handleClose = () => {
    setSearchParams({});
  };

  const handleSave = () => {
    if (onSave && !saveButtonDisabled) {
      onSave();
      handleClose();
    }
  };

  const handleFormulaInsert = (text: string) => {
    const input = formulaInputRef.current;
    if (!input) return;

    const start = input.selectionStart ?? formula.length;
    const end = input.selectionEnd ?? formula.length;
    const newFormula = formula.substring(0, start) + text + formula.substring(end);
    
    onFieldChange('formula', newFormula);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      input.focus();
      const newPos = start + text.length;
      input.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // use form to save on enter key

  return (
    <>
      <form
        className='flex flex-col gap-4'
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <h2 className='text-xl font-bold capitalize'>
          {itemId ? 'edit' : 'add'}{' '}
          {type === 'income'
            ? CashFlowVerbiagePairs[cashFlowVerbiage].in
            : CashFlowVerbiagePairs[cashFlowVerbiage].out}{' '}
        </h2>
        <div>
          <label className='font-medium'>Name</label>
          <input
            type='text'
            className='w-full rounded border border-gray-300 px-2 py-1 focus:border-emerald-500 focus:outline-none dark:border-gray-700'
            value={label}
            onChange={(e) => onFieldChange('label', e.target.value)}
            placeholder={nameInputPlaceholder}
            autoFocus={true}
          />

          {!showDescription && (
            <div className='flex justify-end'>
              <button
                type='button'
                className='mt-1 ml-auto text-sm underline opacity-70 hover:opacity-85'
                onClick={() => setShowDescription(true)}
              >
                Add description
              </button>
            </div>
          )}
        </div>

        {showDescription && (
          <div>
            <label className='font-medium'>Description</label>
            <input
              type='text'
              className='w-full rounded border border-gray-300 px-2 py-1 focus:border-emerald-500 focus:outline-none dark:border-gray-700'
              value={description}
              onChange={(e) => onFieldChange('description', e.target.value)}
            />
          </div>
        )}

        <div>
          <label className='font-medium'>Amount</label>
          <div className='mt-1 flex flex-wrap items-center gap-2'>
            <input
              type='number'
              min={0}
              step='0.01'
              className='w-28 rounded border border-gray-300 px-2 py-1 focus:border-emerald-500 focus:outline-none dark:border-gray-700'
              value={amount === 0 ? '' : amount}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  onFieldChange('amount', 0);
                } else {
                  onFieldChange('amount', Number(val));
                }
              }}
              placeholder='0.00'
            />
            <span className='text-gray-700 dark:text-gray-200'>
              {getCurrencySymbol(currency)}
            </span>
            <span className='mx-1 text-gray-500'>every</span>

            <div className='relative'>
              <label className='absolute top-0 -translate-y-full pb-0.5 font-medium'>
                Frequency
              </label>
              <input
                type='number'
                min={1}
                className='w-16 rounded border border-gray-300 px-2 py-1 focus:border-emerald-500 focus:outline-none dark:border-gray-700'
                aria-description='Enter the frequency interval for this budget item'
                value={cadence?.interval === 0 ? '' : cadence?.interval}
                placeholder='1'
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    onFieldChange('cadence', { ...cadence, interval: 0 });
                  } else {
                    onFieldChange('cadence', {
                      ...cadence,
                      interval: Math.max(1, Number(e.target.value)),
                    });
                  }
                }}
              />
            </div>
            <select
              className='rounded border border-gray-300 px-2 py-1 focus:border-emerald-500 focus:outline-none dark:border-gray-700'
              value={cadence?.type}
              onChange={(e) =>
                onFieldChange('cadence', { ...cadence, type: e.target.value })
              }
              aria-description='Select the frequency of this budget item'
            >
              <option value='day'>day(s)</option>
              <option value='week'>week(s)</option>
              <option value='month'>month(s)</option>
              <option value='year'>year(s)</option>
            </select>
          </div>
        </div>

        {/* Formula Field */}
        {!showFormula && (
          <div className='flex justify-end'>
            <button
              type='button'
              className='text-sm underline opacity-70 hover:opacity-85'
              onClick={() => setShowFormula(true)}
            >
              Use calculated amount
            </button>
          </div>
        )}

        {showFormula && (
          <div>
            <label className='font-medium'>Formula</label>
            <div className='text-xs text-gray-600 dark:text-gray-400 mb-1'>
              Use @source:Name, @category:Name, or @item:id for references. Example: @source:Work * 0.1
            </div>
            <input
              ref={formulaInputRef}
              type='text'
              className={`w-full rounded border px-2 py-1 focus:border-emerald-500 focus:outline-none ${
                formulaValidation.isValid
                  ? 'border-gray-300 dark:border-gray-700'
                  : 'border-red-500'
              }`}
              value={formula}
              onChange={(e) => onFieldChange('formula', e.target.value)}
              placeholder='e.g., 1000 + 500 or @source:Work * 0.5'
            />
            {!formulaValidation.isValid && formulaValidation.error && (
              <div className='mt-1 text-xs text-red-600 dark:text-red-400'>
                {formulaValidation.error}
              </div>
            )}
            <div className='flex justify-between mt-1'>
              <button
                type='button'
                className='text-xs underline opacity-70 hover:opacity-85'
                onClick={() => setShowFormulaHelper(!showFormulaHelper)}
              >
                {showFormulaHelper ? 'Hide' : 'Show'} formula helper
              </button>
              {formula && formula.trim() !== '' && (
                <button
                  type='button'
                  className='text-xs underline opacity-70 hover:opacity-85'
                  onClick={() => {
                    onFieldChange('formula', '');
                    setShowFormula(false);
                    setShowFormulaHelper(false);
                  }}
                >
                  Remove formula
                </button>
              )}
            </div>
            {showFormulaHelper && (
              <div className='mt-2'>
                <FormulaHelper
                  currentItemId={itemId || undefined}
                  onInsert={handleFormulaInsert}
                />
              </div>
            )}
          </div>
        )}

        {/* Children for custom fields */}
        {children}

        {/* Sheets */}
        {availableSheets.length > 0 && (
          <div>
            <label className='font-medium'>Sheets</label>
            <div className='flex flex-wrap gap-2 mt-2'>
              {availableSheets.map((sheet) => {
                const isSelected = sheets?.includes(sheet.id) ?? false;
                return (
                  <button
                    key={sheet.id}
                    type='button'
                    className={`px-3 py-1 rounded border text-sm transition-colors ${
                      isSelected
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-emerald-500'
                    }`}
                    onClick={() => {
                      const newSheets = isSelected
                        ? (sheets || []).filter((id) => id !== sheet.id)
                        : [...(sheets || []), sheet.id];
                      onFieldChange('sheets', newSheets);
                    }}
                  >
                    {sheet.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!showNotes && (
          <div className='mb-4 flex justify-end'>
            <button
              type='button'
              className='mt-1 ml-auto text-sm underline opacity-70 hover:opacity-85'
              onClick={() => setShowNotes(true)}
            >
              Add notes
            </button>
          </div>
        )}
        {showNotes && (
          <div>
            <label className='font-medium'>Notes</label>
            <textarea
              className='min-h-20 w-full rounded border border-gray-300 px-2 py-1 focus:border-emerald-500 focus:outline-none dark:border-gray-700'
              value={notes}
              onChange={(e) => onFieldChange('notes', e.target.value)}
              rows={2}
            />
          </div>
        )}

        <div className='flex justify-end gap-2'>
          {itemId && (
            <button
              type='button'
              className='btn btn-danger mr-auto'
              onClick={handleDeleteClick}
            >
              Delete
            </button>
          )}
          <button
            type='button'
            className='btn btn-secondary'
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type='submit'
            className='btn btn-primary'
            onClick={handleSave}
            disabled={saveButtonDisabled}
          >
            Save
          </button>
        </div>
      </form>

      <ConfirmationModal
        title='Delete Budget Item'
        message={
          deleteWarningMessage
            ? `${deleteWarningMessage}\n\nAre you sure you want to delete this ${type}? This action cannot be undone.`
            : `Are you sure you want to delete this ${type}? This action cannot be undone.`
        }
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onCancel={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
