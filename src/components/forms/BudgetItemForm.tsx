import { CalculatorIcon, PlusIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useShallow } from 'zustand/shallow';
import {
  CashFlowVerbiagePairs,
  getCurrencySymbol,
  URL_PARAM_ID,
  type BudgetType,
} from '../../lib';
import type { BudgetItemCadence, SubItem } from '../../lib/budget.types';
import { useSpace } from '../../store';
import { generateId } from '../../utils';
import ConfirmationModal from '../modals/ConfirmationModal';
import CalculatorModal from '../modals/CalculatorModal';

export interface BudgetItemFormProps {
  type: BudgetType;
  label?: string;
  description?: string;
  amount?: number;
  cadence?: BudgetItemCadence;
  notes?: string;
  sheets?: string[];
  subItems?: SubItem[];
  onFieldChange: (
    field: 'label' | 'description' | 'amount' | 'cadence' | 'notes' | 'sheets' | 'subItems',
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
  subItems = [],
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
  const { removeExpense, removeIncome } = useSpace();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showDescription, setShowDescription] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const itemId = searchParams.get(URL_PARAM_ID);
  
  const hasSubItems = subItems && subItems.length > 0;
  const calculatedTotal = hasSubItems 
    ? subItems.reduce((sum, item) => sum + (item.value || 0), 0) 
    : amount;

  useEffect(() => {
    if (description.length > 0) {
      setShowDescription(true);
    }
    if (notes.length > 0) {
      setShowNotes(true);
    }
  }, [description, notes]);

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
  
  const handleAddSubItem = () => {
    const newSubItem: SubItem = {
      id: generateId('subitem'),
      title: '',
      value: 0,
    };
    const updatedSubItems = [...(subItems || []), newSubItem];
    onFieldChange('subItems', updatedSubItems);
    // Update amount to reflect the new total
    const newTotal = updatedSubItems.reduce((sum, item) => sum + (item.value || 0), 0);
    onFieldChange('amount', newTotal);
  };
  
  const handleRemoveSubItem = (id: string) => {
    const updatedSubItems = (subItems || []).filter(item => item.id !== id);
    onFieldChange('subItems', updatedSubItems);
    // Update amount to reflect the new total
    const newTotal = updatedSubItems.reduce((sum, item) => sum + (item.value || 0), 0);
    onFieldChange('amount', newTotal);
  };
  
  const handleUpdateSubItem = (id: string, field: 'title' | 'value', value: string | number) => {
    const updatedSubItems = (subItems || []).map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onFieldChange('subItems', updatedSubItems);
    // Update amount to reflect the new total when value changes
    if (field === 'value') {
      const newTotal = updatedSubItems.reduce((sum, item) => sum + (item.value || 0), 0);
      onFieldChange('amount', newTotal);
    }
  };
  
  const handleClearSubItems = () => {
    onFieldChange('subItems', []);
    onFieldChange('amount', 0);
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

        {/* Amount mode selector */}
        <div>
          <div className='flex gap-4'>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='radio'
                name='amountMode'
                value='direct'
                checked={!hasSubItems}
                onChange={() => {
                  if (hasSubItems) {
                    handleClearSubItems();
                  }
                }}
                className='cursor-pointer'
              />
              <span className='text-sm'>Direct</span>
            </label>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='radio'
                name='amountMode'
                value='itemize'
                checked={hasSubItems}
                onChange={() => {
                  if (!hasSubItems) {
                    handleAddSubItem();
                  }
                }}
                className='cursor-pointer'
              />
              <span className='text-sm'>Itemize</span>
            </label>
          </div>
        </div>

        <div>
          <label className='font-medium'>Amount</label>
          
          {/* Sub-items list */}
          {hasSubItems && (
            <div className='mt-2 space-y-2'>
              {subItems.map((subItem) => (
                <div key={subItem.id} className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                  <input
                    type='text'
                    className='flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none dark:border-gray-700'
                    value={subItem.title}
                    onChange={(e) => handleUpdateSubItem(subItem.id, 'title', e.target.value)}
                    placeholder='Sub-item name'
                  />
                  <div className='flex items-center gap-1'>
                    <input
                      type='number'
                      min={0}
                      step='0.01'
                      className='w-24 rounded border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none dark:border-gray-700'
                      value={subItem.value === 0 ? '' : subItem.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleUpdateSubItem(subItem.id, 'value', val === '' ? 0 : Number(val));
                      }}
                      placeholder='0.00'
                    />
                    <span className='text-sm text-gray-700 dark:text-gray-200'>
                      {getCurrencySymbol(currency)}
                    </span>
                    <button
                      type='button'
                      onClick={() => handleRemoveSubItem(subItem.id)}
                      className='rounded p-1 text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20'
                      aria-label='Remove sub-item'
                    >
                      <XIcon className='size-4' />
                    </button>
                  </div>
                </div>
              ))}
              <div className='flex items-center justify-end gap-2 border-t border-gray-200 pt-2 dark:border-gray-600'>
                <span className='text-sm font-medium'>Total:</span>
                <span className='text-lg font-semibold'>
                  {calculatedTotal.toFixed(2)} {getCurrencySymbol(currency)}
                </span>
              </div>
            </div>
          )}
          
          {/* Regular amount input - only shown when no sub-items */}
          {!hasSubItems && (
            <div className='mt-1 flex items-center gap-2'>
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
              <button
                type='button'
                onClick={() => setShowCalculator(true)}
                className='rounded p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
                aria-label='Open calculator'
                title='Open calculator'
              >
                <CalculatorIcon className='size-4' />
              </button>
              <span className='text-gray-700 dark:text-gray-200'>
                {getCurrencySymbol(currency)}
              </span>
            </div>
          )}
          
          {/* Frequency fields - always shown on their own row */}
          <div className='mt-2 flex items-center gap-2'>
            <span className='text-gray-500'>every</span>
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
          
          {/* Add another sub-item button - only shown when in itemize mode */}
          {hasSubItems && (
            <div className='mt-2 flex justify-end'>
              <button
                type='button'
                onClick={handleAddSubItem}
                className='flex items-center gap-1 text-sm underline opacity-70 hover:opacity-85'
              >
                <PlusIcon className='size-4' />
                Add another sub-item
              </button>
            </div>
          )}
        </div>

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
              onClick={() => setShowDeleteConfirmation(true)}
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
        message={`Are you sure you want to delete this ${type}? This action cannot be undone.`}
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onCancel={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDelete}
      />

      <CalculatorModal
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
        initialValue={amount}
        onUseResult={(result) => {
          onFieldChange('amount', result);
        }}
      />
    </>
  );
}
