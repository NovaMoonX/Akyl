import { useState, useCallback, useEffect } from 'react';
import { ChevronDownIcon, SearchIcon } from 'lucide-react';
import { useShallow } from 'zustand/shallow';
import { useBudget } from '../../hooks';
import { formatCurrency, getCurrencySymbol } from '../../lib';
import { useSpace } from '../../store';
import { join } from '../../utils';
import Modal from '../ui/Modal';
import { getTimeWindowLabel } from '../../lib/space.utils';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseResult?: (amount: number) => void;
  initialValue?: number;
}

// Constants
const MAX_DISPLAYED_ITEMS = 10;

export default function CalculatorModal({
  isOpen,
  onClose,
  onUseResult,
  initialValue = 0,
}: CalculatorModalProps) {
  const [currency, timeWindow] = useSpace(
    useShallow((state) => [
      state.space?.config?.currency || 'USD',
      state.space?.config?.timeWindow || { type: 'month' as const, interval: 1 },
    ]),
  );
  const { incomes, expenses, incomesTotal, expensesTotal, incomeBySource, expenseByCategory } = useBudget();

  const [expression, setExpression] = useState(initialValue.toString());
  const [result, setResult] = useState<string | null>(null);
  const [showAmountPicker, setShowAmountPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Evaluate mathematical expression with parentheses support
  const evaluateExpression = useCallback((expr: string): number => {
    try {
      // Replace × and ÷ with * and /
      const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/');
      
      // Basic validation - check for balanced parentheses
      let parenCount = 0;
      for (const char of sanitized) {
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
        if (parenCount < 0) throw new Error('Unbalanced parentheses');
      }
      if (parenCount !== 0) throw new Error('Unbalanced parentheses');
      
      // Evaluate using Function constructor (safer than eval)
      const result = Function('"use strict"; return (' + sanitized + ')')();
      
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Invalid calculation');
      }
      
      return result;
    } catch {
      throw new Error('Invalid expression');
    }
  }, []);

  // Reset calculator when modal opens with new initial value
  useEffect(() => {
    if (isOpen) {
      setExpression(initialValue.toString());
      setResult(null);
      setSearchQuery('');
    }
  }, [isOpen, initialValue]);

  const handleAmountSelect = useCallback((amount: number) => {
    // Round to 2 decimal places for cleaner display
    const roundedAmount = Math.round(amount * 100) / 100;
    
    // Add the amount to the current expression
    setExpression(prev => {
      // If expression is '0' or empty, replace it
      if (prev === '0' || prev === '') {
        return String(roundedAmount);
      }
      // Otherwise append
      return prev + String(roundedAmount);
    });
    setResult(null);
    setShowAmountPicker(false);
  }, []);

  const handleNumber = useCallback((num: string) => {
    setExpression(prev => {
      if (result !== null) {
        // If we just calculated a result, start fresh
        setResult(null);
        return num;
      }
      return prev === '0' ? num : prev + num;
    });
  }, [result]);

  const handleDecimal = useCallback(() => {
    setExpression(prev => {
      if (result !== null) {
        setResult(null);
        return '0.';
      }
      // Check if current number already has a decimal
      const parts = prev.split(/[+\-*/()]/);
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes('.')) {
        return prev;
      }
      return prev + '.';
    });
  }, [result]);

  const handleOperation = useCallback((op: string) => {
    setExpression(prev => {
      if (result !== null) {
        // Use the result and continue
        setResult(null);
        return result + op;
      }
      
      // Prevent consecutive operators
      const lastChar = prev[prev.length - 1];
      if (['+', '-', '*', '/', '×', '÷'].includes(lastChar)) {
        // Replace the last operator
        return prev.slice(0, -1) + op;
      }
      
      return prev + op;
    });
  }, [result]);

  const handleParenthesis = useCallback((paren: string) => {
    setExpression(prev => {
      if (result !== null && paren === '(') {
        setResult(null);
        return paren;
      }
      return prev + paren;
    });
  }, [result]);

  const handleEquals = useCallback(() => {
    try {
      const calculatedResult = evaluateExpression(expression);
      // Round to reasonable precision for display
      const roundedResult = Math.round(calculatedResult * 1e10) / 1e10;
      setResult(String(roundedResult));
    } catch {
      setResult('Error');
    }
  }, [expression, evaluateExpression]);

  const handleClear = useCallback(() => {
    setExpression('0');
    setResult(null);
  }, []);

  const handleBackspace = useCallback(() => {
    setExpression(prev => {
      if (result !== null) {
        setResult(null);
        return prev;
      }
      const newExpr = prev.slice(0, -1);
      return newExpr || '0';
    });
  }, [result]);

  const handleUseResult = useCallback(() => {
    if (onUseResult) {
      const valueToUse = result !== null ? parseFloat(result) : evaluateExpression(expression);
      const roundedResult = Math.round(valueToUse * 100) / 100;
      onUseResult(roundedResult);
      onClose();
    }
  }, [result, expression, evaluateExpression, onUseResult, onClose]);

  // Keyboard support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in the search input field
      if (e.target instanceof HTMLInputElement && e.target.placeholder === 'Search budget items...') {
        return;
      }
      // Ignore if typing in textarea
      if (e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Numbers
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleNumber(e.key);
      }
      // Operators
      else if (e.key === '+') {
        e.preventDefault();
        handleOperation('+');
      }
      else if (e.key === '-') {
        e.preventDefault();
        handleOperation('-');
      }
      else if (e.key === '*' || e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        handleOperation('×');
      }
      else if (e.key === '/') {
        e.preventDefault();
        handleOperation('÷');
      }
      // Parentheses
      else if (e.key === '(' || e.key === '9' && e.shiftKey) {
        e.preventDefault();
        handleParenthesis('(');
      }
      else if (e.key === ')' || e.key === '0' && e.shiftKey) {
        e.preventDefault();
        handleParenthesis(')');
      }
      // Decimal point
      else if (e.key === '.' || e.key === ',') {
        e.preventDefault();
        handleDecimal();
      }
      // Equals
      else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      }
      // Clear
      else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleClear();
      }
      // Backspace
      else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNumber, handleOperation, handleParenthesis, handleDecimal, handleEquals, handleClear, handleBackspace]);

  const ButtonRow = ({ children }: { children: React.ReactNode }) => (
    <div className='grid grid-cols-4 gap-2'>{children}</div>
  );

  const CalcButton = ({ 
    label, 
    onClick, 
    className = '', 
    span = 1 
  }: { 
    label: string; 
    onClick: () => void; 
    className?: string; 
    span?: number;
  }) => (
    <button
      onClick={onClick}
      className={join(
        'bg-surface-hover-light hover:bg-gray-200 dark:bg-surface-hover-dark dark:hover:bg-gray-600 rounded-lg px-4 py-3 text-lg font-semibold transition-colors',
        className,
        span === 2 && 'col-span-2',
      )}
    >
      {label}
    </button>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Calculator' centerTitle>
      <div className='flex flex-col gap-4'>
        {/* Display */}
        <div className='bg-surface-hover-light dark:bg-surface-hover-dark rounded-lg p-4 focus-within:ring-2 focus-within:ring-emerald-500 transition-all'>
          <div className='mb-1 text-right text-sm text-gray-500 dark:text-gray-400 min-h-[20px] break-all'>
            {result !== null && result !== 'Error' && (
              <span className='text-xs'>{expression} =</span>
            )}
          </div>
          <div className='flex items-center gap-2 overflow-hidden'>
            <span className='text-2xl font-bold text-gray-500 dark:text-gray-400 flex-shrink-0'>
              {getCurrencySymbol(currency)}
            </span>
            <div className='flex-1 text-right text-2xl font-bold px-2 overflow-hidden break-all'>
              {result !== null ? (
                result === 'Error' ? (
                  <span className='text-red-500'>{result}</span>
                ) : (
                  formatCurrency(parseFloat(result), currency).replace(getCurrencySymbol(currency), '').trim()
                )
              ) : (
                expression
              )}
            </div>
          </div>
        </div>

        {/* Amount Picker - Select from existing budget items */}
        <div className='relative'>
          <button
            onClick={() => setShowAmountPicker(!showAmountPicker)}
            className='w-full flex items-center justify-between gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 px-3 py-2 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors'
          >
            <span>💰 Use amount from budget ({getTimeWindowLabel(timeWindow.type)})</span>
            <ChevronDownIcon className={join('size-4 transition-transform', showAmountPicker && 'rotate-180')} />
          </button>
          
          {showAmountPicker && (
            <div className='absolute top-full left-0 right-0 mt-1 z-10 max-h-64 overflow-y-auto rounded-lg border border-gray-300 dark:border-gray-700 bg-surface-light dark:bg-surface-dark shadow-lg'>
              {/* Search Box */}
              <div className='sticky top-0 bg-surface-light dark:bg-surface-dark border-b border-gray-300 dark:border-gray-700 p-2'>
                <div className='relative'>
                  <SearchIcon className='absolute left-2 top-1/2 -translate-y-1/2 size-4 text-gray-400' />
                  <input
                    type='text'
                    placeholder='Search budget items...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='w-full pl-8 pr-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:border-emerald-500'
                  />
                </div>
              </div>
              
              {/* Income Total */}
              {incomesTotal > 0 && 'Total Income'.toLowerCase().includes(searchQuery.toLowerCase()) && (
                <button
                  onClick={() => handleAmountSelect(incomesTotal)}
                  className='w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700'
                >
                  <span className='font-medium text-green-600 dark:text-green-400'>Total Income</span>
                  <span className='text-green-600 dark:text-green-400'>{formatCurrency(incomesTotal, currency)}</span>
                </button>
              )}
              
              {/* Expense Total */}
              {expensesTotal > 0 && 'Total Expenses'.toLowerCase().includes(searchQuery.toLowerCase()) && (
                <button
                  onClick={() => handleAmountSelect(expensesTotal)}
                  className='w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700'
                >
                  <span className='font-medium text-red-600 dark:text-red-400'>Total Expenses</span>
                  <span className='text-red-600 dark:text-red-400'>{formatCurrency(expensesTotal, currency)}</span>
                </button>
              )}
              
              {/* Income Sources */}
              {(() => {
                const filteredSources = Object.entries(incomeBySource).filter(([source]) => 
                  source.toLowerCase().includes(searchQuery.toLowerCase())
                );
                return filteredSources.length > 0 && (
                  <>
                    <div className='px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800'>
                      Income Sources
                    </div>
                    {filteredSources.map(([source, data]) => (
                      <button
                        key={source}
                        onClick={() => handleAmountSelect(data.total)}
                        className='w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700'
                      >
                        <span className='truncate'>{source}</span>
                        <span className='text-green-600 dark:text-green-400 ml-2'>{formatCurrency(data.total, currency)}</span>
                      </button>
                    ))}
                  </>
                );
              })()}
              
              {/* Expense Categories */}
              {(() => {
                const filteredCategories = Object.entries(expenseByCategory).filter(([category]) => 
                  category.toLowerCase().includes(searchQuery.toLowerCase())
                );
                return filteredCategories.length > 0 && (
                  <>
                    <div className='px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800'>
                      Expense Categories
                    </div>
                    {filteredCategories.map(([category, data]) => (
                      <button
                        key={category}
                        onClick={() => handleAmountSelect(data.total)}
                        className='w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700'
                      >
                        <span className='truncate'>{category}</span>
                        <span className='text-red-600 dark:text-red-400 ml-2'>{formatCurrency(data.total, currency)}</span>
                      </button>
                    ))}
                  </>
                );
              })()}
              
              {/* Individual Income Items */}
              {(() => {
                const filteredIncomes = incomes.filter((income) => 
                  income.label.toLowerCase().includes(searchQuery.toLowerCase())
                ).slice(0, MAX_DISPLAYED_ITEMS);
                return filteredIncomes.length > 0 && (
                  <>
                    <div className='px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800'>
                      Income Items
                    </div>
                    {filteredIncomes.map((income) => (
                      <button
                        key={income.id}
                        onClick={() => handleAmountSelect(income.amount)}
                        className='w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700'
                      >
                        <span className='truncate'>{income.label}</span>
                        <span className='text-green-600 dark:text-green-400 ml-2'>{formatCurrency(income.amount, currency)}</span>
                      </button>
                    ))}
                  </>
                );
              })()}
              
              {/* Individual Expense Items */}
              {(() => {
                const filteredExpenses = expenses.filter((expense) => 
                  expense.label.toLowerCase().includes(searchQuery.toLowerCase())
                ).slice(0, MAX_DISPLAYED_ITEMS);
                return filteredExpenses.length > 0 && (
                  <>
                    <div className='px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800'>
                      Expense Items
                    </div>
                    {filteredExpenses.map((expense) => (
                      <button
                        key={expense.id}
                        onClick={() => handleAmountSelect(expense.amount)}
                        className='w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700'
                      >
                        <span className='truncate'>{expense.label}</span>
                        <span className='text-red-600 dark:text-red-400 ml-2'>{formatCurrency(expense.amount, currency)}</span>
                      </button>
                    ))}
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Calculator Buttons */}
        <div className='flex flex-col gap-2'>
          <ButtonRow>
            <CalcButton label='(' onClick={() => handleParenthesis('(')} />
            <CalcButton label=')' onClick={() => handleParenthesis(')')} />
            <CalcButton label='C' onClick={handleClear} className='bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700' />
            <CalcButton 
              label='÷' 
              onClick={() => handleOperation('÷')} 
              className='bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700'
            />
          </ButtonRow>

          <ButtonRow>
            <CalcButton label='7' onClick={() => handleNumber('7')} />
            <CalcButton label='8' onClick={() => handleNumber('8')} />
            <CalcButton label='9' onClick={() => handleNumber('9')} />
            <CalcButton 
              label='×' 
              onClick={() => handleOperation('×')} 
              className='bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700'
            />
          </ButtonRow>

          <ButtonRow>
            <CalcButton label='4' onClick={() => handleNumber('4')} />
            <CalcButton label='5' onClick={() => handleNumber('5')} />
            <CalcButton label='6' onClick={() => handleNumber('6')} />
            <CalcButton 
              label='-' 
              onClick={() => handleOperation('-')} 
              className='bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700'
            />
          </ButtonRow>

          <ButtonRow>
            <CalcButton label='1' onClick={() => handleNumber('1')} />
            <CalcButton label='2' onClick={() => handleNumber('2')} />
            <CalcButton label='3' onClick={() => handleNumber('3')} />
            <CalcButton 
              label='+' 
              onClick={() => handleOperation('+')} 
              className='bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700'
            />
          </ButtonRow>

          <ButtonRow>
            <CalcButton label='0' onClick={() => handleNumber('0')} />
            <CalcButton label='.' onClick={handleDecimal} />
            <CalcButton 
              label='⌫' 
              onClick={handleBackspace} 
              className='bg-gray-400 hover:bg-gray-500 text-white dark:bg-gray-600 dark:hover:bg-gray-700'
            />
            <CalcButton 
              label='=' 
              onClick={handleEquals} 
              className='bg-emerald-600 hover:bg-emerald-700 text-white text-xl dark:bg-emerald-700 dark:hover:bg-emerald-800'
            />
          </ButtonRow>

          <ButtonRow>
            <button
              onClick={handleUseResult}
              disabled={!onUseResult}
              className={join(
                'rounded-lg px-4 py-3 text-sm font-semibold transition-colors',
                onUseResult
                  ? 'bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
              )}
              title={onUseResult ? 'Use this result as amount' : 'Available when adding/editing budget items'}
            >
              Use
            </button>
          </ButtonRow>
        </div>

        {/* Info Text */}
        <div className='flex flex-col gap-1'>
          <p className='text-center text-xs text-gray-500 dark:text-gray-400'>
            💡 Tip: Use keyboard to type or select from budget amounts above
          </p>
          {!onUseResult && (
            <p className='text-center text-xs text-gray-500 dark:text-gray-400'>
              ℹ️ "Use" is available when adding/editing a budget item
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
