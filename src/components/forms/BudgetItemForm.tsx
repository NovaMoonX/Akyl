import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useShallow } from 'zustand/shallow';
import {
  CashFlowVerbiagePairs,
  getCurrencySymbol,
  URL_PARAM_ID,
  type BudgetType,
} from '../../lib';
import type { BudgetItemCadence } from '../../lib/budget.types';
import { useSpace } from '../../store';
import ConfirmationModal from '../modals/ConfirmationModal';

export interface BudgetItemFormProps {
  type: BudgetType;
  label?: string;
  description?: string;
  amount?: number;
  cadence?: BudgetItemCadence;
  notes?: string;
  onFieldChange: (
    field: 'label' | 'description' | 'amount' | 'cadence' | 'notes',
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
  const { removeExpense, removeIncome } = useSpace();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showDescription, setShowDescription] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const itemId = searchParams.get(URL_PARAM_ID);

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
    if (onSave) {
      onSave();
      handleClose();
    }
  };

  return (
    <>
      <div className='flex flex-col gap-4'>
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
                value={cadence?.interval}
                onChange={(e) =>
                  onFieldChange('cadence', {
                    ...cadence,
                    interval: Number(e.target.value),
                  })
                }
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

        {/* Children for custom fields */}
        {children}

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
            type='button'
            className='btn btn-primary'
            onClick={handleSave}
            disabled={saveButtonDisabled}
          >
            Save
          </button>
        </div>
      </div>

      <ConfirmationModal
        title='Delete Budget Item'
        message={`Are you sure you want to delete this ${type}? This action cannot be undone.`}
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onCancel={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
