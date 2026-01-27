import { CalculatorIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useShallow } from 'zustand/shallow';
import {
  CashFlowVerbiagePairs,
  getCurrencySymbol,
  URL_PARAM_ID,
  type BudgetType,
} from '../../lib';
import type { BudgetItemCadence, BudgetItemCadenceType, BudgetItemEnd } from '../../lib/budget.types';
import { useSpace } from '../../store';
import { join } from '../../utils';
import ConfirmationModal from '../modals/ConfirmationModal';
import CalculatorModal from '../modals/CalculatorModal';

export interface BudgetItemFormProps {
  type: BudgetType;
  label?: string;
  description?: string;
  amount?: number;
  cadence?: BudgetItemCadence;
  end?: BudgetItemEnd;
  notes?: string;
  sheets?: string[];
  onFieldChange: (
    field: 'label' | 'description' | 'amount' | 'cadence' | 'end' | 'notes' | 'sheets',
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
  cadence,
  end,
  notes = '',
  sheets = [],
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
  const configTimeWindow = useSpace(
    useShallow((state) => state?.space?.config?.timeWindow),
  );
  const activeSheet = useSpace(
    useShallow((state) => state?.space?.config?.activeSheet || 'all'),
  );
  const { removeExpense, removeIncome } = useSpace();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showDescription, setShowDescription] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showEndCondition, setShowEndCondition] = useState(!!end);
  const [previousCadence, setPreviousCadence] = useState<BudgetItemCadence | undefined>(cadence);
  const itemId = searchParams.get(URL_PARAM_ID);

  // Determine if this is a "once" item (no cadence)
  const isOnce = !cadence;

  // Update previousCadence when cadence prop changes and is defined
  useEffect(() => {
    if (cadence) {
      setPreviousCadence(cadence);
    }
  }, [cadence]);

  useEffect(() => {
    if (description.length > 0) {
      setShowDescription(true);
    }
    if (notes.length > 0) {
      setShowNotes(true);
    }
  }, [description, notes]);

  useEffect(() => {
    setShowEndCondition(!!end);
  }, [end]);

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

  const handleToggleOnce = () => {
    if (isOnce) {
      // Switch to recurring - restore previous cadence or use default
      const activeSheetObj = activeSheet !== 'all' && availableSheets
        ? availableSheets.find((s) => s.id === activeSheet)
        : null;
      const defaultCadence = activeSheetObj?.timeWindow ?? configTimeWindow ?? {
        type: 'month' as BudgetItemCadenceType,
        interval: 1,
      };
      
      // Use previous cadence if available, otherwise use default
      const cadenceToUse = previousCadence || defaultCadence;
      onFieldChange('cadence', cadenceToUse);
    } else {
      // Switch to once - remove cadence and end
      // The current cadence is already preserved in previousCadence state via useEffect
      onFieldChange('cadence', undefined);
      onFieldChange('end', undefined);
      setShowEndCondition(false);
    }
  };

  const handleToggleEndCondition = () => {
    if (showEndCondition) {
      onFieldChange('end', undefined);
      setShowEndCondition(false);
    } else {
      setShowEndCondition(true);
      // Set default end condition (period type)
      onFieldChange('end', {
        type: 'occurrences',
        occurrences: 12,
      });
    }
  };

  // use form to save on enter key

  return (
    <>
      <form
        className='max-h-svh'
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <div className='flex flex-col gap-4 overflow-y-auto'>
          <h2 className='text-lg font-bold capitalize sm:text-xl'>
            {itemId ? 'edit' : 'add'}{' '}
            {type === 'income'
              ? CashFlowVerbiagePairs[cashFlowVerbiage].in
              : CashFlowVerbiagePairs[cashFlowVerbiage].out}{' '}
          </h2>
          <div>
            <label className='text-sm font-medium sm:text-base'>
              Name
              <span className={type === 'expense' ? 'text-red-500' : 'text-emerald-500'}> *</span>
            </label>
            <input
              type='text'
              className={join(
                'w-full rounded border border-gray-300 px-2 py-1 focus:outline-none dark:border-gray-700',
                type === 'expense' ? 'focus:border-red-500' : 'focus:border-emerald-500'
              )}
              value={label}
              onChange={(e) => onFieldChange('label', e.target.value)}
              placeholder={nameInputPlaceholder}
              autoFocus={true}
            />

            {!showDescription && (
              <div className='flex justify-end'>
                <button
                  type='button'
                  className='mt-1 ml-auto text-xs underline opacity-70 hover:opacity-85 sm:text-sm'
                  onClick={() => setShowDescription(true)}
                >
                  Add description
                </button>
              </div>
            )}
          </div>

          {showDescription && (
            <div>
              <label className='text-sm font-medium sm:text-base'>
                Description
              </label>
              <input
                type='text'
                className={join(
                  'w-full rounded border border-gray-300 px-2 py-1 focus:outline-none dark:border-gray-700',
                  type === 'expense' ? 'focus:border-red-500' : 'focus:border-emerald-500'
                )}
                value={description}
                onChange={(e) => onFieldChange('description', e.target.value)}
              />
            </div>
          )}

          <div>
            <div className='flex items-start justify-between gap-4'>
              <div className='flex-1'>
                <label className='text-sm font-medium sm:text-base'>
                  Amount
                  <span className={type === 'expense' ? 'text-red-500' : 'text-emerald-500'}> *</span>
                </label>
                <div className='mt-1 flex items-center gap-1'>
                  <span className='text-gray-700 dark:text-gray-200'>
                    {getCurrencySymbol(currency)}
                  </span>
                  <input
                    type='number'
                    min={0}
                    step='0.01'
                    className={join(
                      'w-28 rounded border border-gray-300 px-2 py-1 focus:outline-none dark:border-gray-700',
                      type === 'expense' ? 'focus:border-red-500' : 'focus:border-emerald-500'
                    )}
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
                </div>
              </div>

              {/* Frequency toggle: Once vs Recurring */}
              <div className='flex-1'>
                <label className='text-sm font-medium sm:text-base'>Frequency</label>
                <div className='mt-1 flex gap-2'>
                  <button
                    type='button'
                    className={join(
                      'rounded border px-4 py-2 text-sm transition-colors',
                      isOnce
                        ? type === 'expense'
                          ? 'border-red-600 bg-red-500 text-white'
                          : 'border-emerald-600 bg-emerald-500 text-white'
                        : 'border-gray-300 bg-white hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800'
                    )}
                    onClick={handleToggleOnce}
                  >
                    Once
                  </button>
                  <button
                    type='button'
                    className={join(
                      'rounded border px-4 py-2 text-sm transition-colors',
                      !isOnce
                        ? type === 'expense'
                          ? 'border-red-600 bg-red-500 text-white'
                          : 'border-emerald-600 bg-emerald-500 text-white'
                        : 'border-gray-300 bg-white hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800'
                    )}
                    onClick={handleToggleOnce}
                  >
                    Recurring
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cadence inputs - only show if recurring */}
          {!isOnce && (
            <div>
              <label className='text-sm font-medium sm:text-base'>Repeats</label>
              <div className='mt-2 flex flex-wrap items-center gap-2'>
                <span className='text-gray-500'>every</span>
                <input
                  type='number'
                  min={1}
                  className={join(
                    'w-16 rounded border border-gray-300 px-2 py-1 focus:outline-none dark:border-gray-700',
                    type === 'expense' ? 'focus:border-red-500' : 'focus:border-emerald-500'
                  )}
                  aria-description='Enter the frequency interval for this budget item'
                  value={cadence?.interval === 0 ? '' : cadence?.interval}
                  placeholder='1'
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      onFieldChange('cadence', { ...(cadence || { type: 'month' }), interval: 0 });
                    } else {
                      onFieldChange('cadence', {
                        ...(cadence || { type: 'month' }),
                        interval: Math.max(1, Number(e.target.value)),
                      });
                    }
                  }}
                />
                <select
                  className={join(
                    'rounded border border-gray-300 px-2 py-1 focus:outline-none dark:border-gray-700',
                    type === 'expense' ? 'focus:border-red-500' : 'focus:border-emerald-500'
                  )}
                  value={cadence?.type || 'month'}
                  onChange={(e) =>
                    onFieldChange('cadence', { ...(cadence || { interval: 1 }), type: e.target.value as BudgetItemCadenceType })
                  }
                  aria-description='Select the frequency of this budget item'
                >
                  <option value='day'>day(s)</option>
                  <option value='week'>week(s)</option>
                  <option value='month'>month(s)</option>
                  <option value='year'>year(s)</option>
                </select>
              </div>

              {/* End condition toggle */}
              {!showEndCondition && (
                <div className='mt-2 flex justify-end'>
                  <button
                    type='button'
                    className='text-xs underline opacity-70 hover:opacity-85 sm:text-sm'
                    onClick={handleToggleEndCondition}
                  >
                    Add end condition
                  </button>
                </div>
              )}
            </div>
          )}

          {/* End condition inputs - only show if recurring and enabled */}
          {!isOnce && showEndCondition && (
            <div>
              <div className='flex items-center justify-between'>
                <label className='text-sm font-medium sm:text-base'>Ends</label>
                <button
                  type='button'
                  className='text-xs underline opacity-70 hover:opacity-85 sm:text-sm'
                  onClick={handleToggleEndCondition}
                >
                  Remove end condition
                </button>
              </div>
              <div className='mt-2 space-y-3'>
                <div className='flex gap-2'>
                  <button
                    type='button'
                    className={join(
                      'rounded border px-3 py-1.5 text-xs transition-colors sm:text-sm',
                      end?.type === 'occurrences'
                        ? type === 'expense'
                          ? 'border-red-600 bg-red-500 text-white'
                          : 'border-emerald-600 bg-emerald-500 text-white'
                        : 'border-gray-300 bg-white hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800'
                    )}
                    onClick={() => onFieldChange('end', { type: 'occurrences', occurrences: 12 })}
                  >
                    After # times
                  </button>
                  <button
                    type='button'
                    className={join(
                      'rounded border px-3 py-1.5 text-xs transition-colors sm:text-sm',
                      end?.type === 'period'
                        ? type === 'expense'
                          ? 'border-red-600 bg-red-500 text-white'
                          : 'border-emerald-600 bg-emerald-500 text-white'
                        : 'border-gray-300 bg-white hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800'
                    )}
                    onClick={() =>
                      onFieldChange('end', {
                        type: 'period',
                        period: { value: 6, cadence: 'month' },
                      })
                    }
                  >
                    After period
                  </button>
                  <button
                    type='button'
                    className={join(
                      'rounded border px-3 py-1.5 text-xs transition-colors sm:text-sm',
                      end?.type === 'amount'
                        ? type === 'expense'
                          ? 'border-red-600 bg-red-500 text-white'
                          : 'border-emerald-600 bg-emerald-500 text-white'
                        : 'border-gray-300 bg-white hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800'
                    )}
                    onClick={() => onFieldChange('end', { type: 'amount', amount: 1000 })}
                  >
                    After total amount
                  </button>
                </div>

                {end?.type === 'occurrences' && (
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>After</span>
                    <input
                      type='number'
                      min={1}
                      className={join(
                        'w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none dark:border-gray-700',
                        type === 'expense' ? 'focus:border-red-500' : 'focus:border-emerald-500'
                      )}
                      value={end?.occurrences || ''}
                      onChange={(e) =>
                        onFieldChange('end', {
                          ...end,
                          occurrences: Math.max(1, Number(e.target.value)),
                        })
                      }
                      placeholder='12'
                    />
                    <span className='text-sm text-gray-600 dark:text-gray-400'>occurrence(s)</span>
                  </div>
                )}

                {end?.type === 'period' && (
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>After</span>
                    <input
                      type='number'
                      min={1}
                      className={join(
                        'w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none dark:border-gray-700',
                        type === 'expense' ? 'focus:border-red-500' : 'focus:border-emerald-500'
                      )}
                      value={end?.period?.value || ''}
                      onChange={(e) =>
                        onFieldChange('end', {
                          ...end,
                          period: {
                            value: Math.max(1, Number(e.target.value)),
                            cadence: end?.period?.cadence || 'month',
                          },
                        })
                      }
                      placeholder='6'
                    />
                    <select
                      className={join(
                        'rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none dark:border-gray-700',
                        type === 'expense' ? 'focus:border-red-500' : 'focus:border-emerald-500'
                      )}
                      value={end?.period?.cadence || 'month'}
                      onChange={(e) =>
                        onFieldChange('end', {
                          ...end,
                          period: {
                            value: end?.period?.value || 1,
                            cadence: e.target.value as BudgetItemCadenceType,
                          },
                        })
                      }
                    >
                      <option value='day'>day(s)</option>
                      <option value='week'>week(s)</option>
                      <option value='month'>month(s)</option>
                      <option value='year'>year(s)</option>
                    </select>
                  </div>
                )}

                {end?.type === 'amount' && (
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>Total reaches</span>
                    <input
                      type='number'
                      min={0}
                      step='0.01'
                      className={join(
                        'w-28 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none dark:border-gray-700',
                        type === 'expense' ? 'focus:border-red-500' : 'focus:border-emerald-500'
                      )}
                      value={end?.amount || ''}
                      onChange={(e) =>
                        onFieldChange('end', {
                          ...end,
                          amount: Number(e.target.value),
                        })
                      }
                      placeholder='1000.00'
                    />
                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                      {getCurrencySymbol(currency)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Children for custom fields */}
          {children}

          {/* Sheets */}
          {availableSheets.length > 0 && (
            <div>
              <label className='text-sm font-medium sm:text-base'>
                Sheets
                <span className={type === 'expense' ? 'text-red-500' : 'text-emerald-500'}> *</span>
              </label>
              <div className='mt-2 flex flex-wrap gap-2'>
                {availableSheets.map((sheet) => {
                  const isSelected = sheets?.includes(sheet.id) ?? false;
                  return (
                    <button
                      key={sheet.id}
                      type='button'
                      className={join(
                        'rounded border px-3 py-1 text-xs transition-colors sm:text-sm',
                        isSelected
                          ? type === 'expense'
                            ? 'border-red-600 bg-red-500 text-white'
                            : 'border-emerald-600 bg-emerald-500 text-white'
                          : type === 'expense'
                            ? 'border-gray-300 bg-white hover:border-red-500 dark:border-gray-700 dark:bg-gray-800'
                            : 'border-gray-300 bg-white hover:border-emerald-500 dark:border-gray-700 dark:bg-gray-800'
                      )}
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
                className='mt-1 ml-auto text-xs underline opacity-70 hover:opacity-85 sm:text-sm'
                onClick={() => setShowNotes(true)}
              >
                Add notes
              </button>
            </div>
          )}
          {showNotes && (
            <div>
              <label className='text-sm font-medium sm:text-base'>Notes</label>
              <textarea
                className={join(
                  'min-h-20 w-full rounded border border-gray-300 px-2 py-1 focus:outline-none dark:border-gray-700 text-sm sm:text-base',
                  type === 'expense' ? 'focus:border-red-500' : 'focus:border-emerald-500'
                )}
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
