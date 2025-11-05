import { useState, useCallback, useEffect } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { useShallow } from 'zustand/shallow';
import { useBudget } from '../../hooks';
import { formatCurrency } from '../../lib';
import { useSpace } from '../../store';
import { join } from '../../utils';
import Modal from '../ui/Modal';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseResult?: (amount: number) => void;
  initialValue?: number;
}

export default function CalculatorModal({
  isOpen,
  onClose,
  onUseResult,
  initialValue = 0,
}: CalculatorModalProps) {
  const [currency, calculatorAmount, setCalculatorAmount] = useSpace(
    useShallow((state) => [
      state.space?.config?.currency || 'USD',
      state.calculatorAmount,
      state.setCalculatorAmount,
    ]),
  );
  const { incomes, expenses, incomesTotal, expensesTotal, incomeBySource, expenseByCategory } = useBudget();

  const [display, setDisplay] = useState(initialValue.toString());
  const [operation, setOperation] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [showAmountPicker, setShowAmountPicker] = useState(false);

  const calculate = useCallback((prevValue: number, currValue: number, op: string): number => {
    switch (op) {
      case '+':
        return prevValue + currValue;
      case '-':
        return prevValue - currValue;
      case '*':
        return prevValue * currValue;
      case '/':
        return prevValue / currValue;
      default:
        return currValue;
    }
  }, []);

  // Reset calculator when modal opens with new initial value
  useEffect(() => {
    if (isOpen) {
      setDisplay(initialValue.toString());
      setOperation(null);
      setPreviousValue(null);
      setWaitingForOperand(false);
    }
  }, [isOpen, initialValue]);

  // Handle amounts received from node clicks
  useEffect(() => {
    if (calculatorAmount !== null && isOpen) {
      if (waitingForOperand || display === '0') {
        setDisplay(String(calculatorAmount));
        setWaitingForOperand(false);
      } else {
        // If we have an operation pending, use it
        if (operation && previousValue !== null) {
          const newValue = calculate(previousValue, parseFloat(display), operation);
          setPreviousValue(newValue);
          setDisplay(String(calculatorAmount));
          setWaitingForOperand(false);
        } else {
          // Otherwise, start a new calculation
          setDisplay(String(calculatorAmount));
        }
      }
      // Clear the calculator amount after using it
      setCalculatorAmount(null);
    }
  }, [calculatorAmount, isOpen, waitingForOperand, display, operation, previousValue, setCalculatorAmount, calculate]);

  const handleAmountSelect = useCallback((amount: number) => {
    if (waitingForOperand || display === '0') {
      setDisplay(String(amount));
      setWaitingForOperand(false);
    } else {
      // If we have an operation pending, use it
      if (operation && previousValue !== null) {
        const newValue = calculate(previousValue, parseFloat(display), operation);
        setPreviousValue(newValue);
        setDisplay(String(amount));
        setWaitingForOperand(false);
      } else {
        // Otherwise, start a new calculation
        setDisplay(String(amount));
      }
    }
    setShowAmountPicker(false);
  }, [waitingForOperand, display, operation, previousValue, calculate]);

  const handleNumber = useCallback((num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  }, [display, waitingForOperand]);

  const handleDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  }, [display, waitingForOperand]);

  const handleOperation = useCallback((nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  }, [display, previousValue, operation, calculate]);

  const handleEquals = useCallback(() => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  }, [display, previousValue, operation, calculate]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setOperation(null);
    setPreviousValue(null);
    setWaitingForOperand(false);
  }, []);

  const handleBackspace = useCallback(() => {
    if (!waitingForOperand) {
      const newDisplay = display.slice(0, -1);
      setDisplay(newDisplay || '0');
    }
  }, [display, waitingForOperand]);

  const handleUseResult = useCallback(() => {
    const result = parseFloat(display);
    if (!isNaN(result) && onUseResult) {
      onUseResult(result);
      onClose();
    }
  }, [display, onUseResult, onClose]);

  // Keyboard support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
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
        handleOperation('*');
      }
      else if (e.key === '/') {
        e.preventDefault();
        handleOperation('/');
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
  }, [isOpen, handleNumber, handleOperation, handleDecimal, handleEquals, handleClear, handleBackspace]);

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
        <div className='bg-surface-hover-light dark:bg-surface-hover-dark rounded-lg p-4'>
          <div className='mb-1 text-right text-sm text-gray-500 dark:text-gray-400'>
            {operation && previousValue !== null && (
              <>
                {formatCurrency(previousValue, currency)} {operation}
              </>
            )}
          </div>
          <div className='text-right text-2xl font-bold'>
            {formatCurrency(parseFloat(display) || 0, currency)}
          </div>
        </div>

        {/* Amount Picker - Select from existing budget items */}
        <div className='relative'>
          <button
            onClick={() => setShowAmountPicker(!showAmountPicker)}
            className='w-full flex items-center justify-between gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 px-3 py-2 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors'
          >
            <span>💰 Use amount from budget</span>
            <ChevronDownIcon className={join('size-4 transition-transform', showAmountPicker && 'rotate-180')} />
          </button>
          
          {showAmountPicker && (
            <div className='absolute top-full left-0 right-0 mt-1 z-10 max-h-64 overflow-y-auto rounded-lg border border-gray-300 dark:border-gray-700 bg-surface-light dark:bg-surface-dark shadow-lg'>
              {/* Income Total */}
              {incomesTotal > 0 && (
                <button
                  onClick={() => handleAmountSelect(incomesTotal)}
                  className='w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700'
                >
                  <span className='font-medium text-green-600 dark:text-green-400'>Total Income</span>
                  <span className='text-green-600 dark:text-green-400'>{formatCurrency(incomesTotal, currency)}</span>
                </button>
              )}
              
              {/* Expense Total */}
              {expensesTotal > 0 && (
                <button
                  onClick={() => handleAmountSelect(expensesTotal)}
                  className='w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700'
                >
                  <span className='font-medium text-red-600 dark:text-red-400'>Total Expenses</span>
                  <span className='text-red-600 dark:text-red-400'>{formatCurrency(expensesTotal, currency)}</span>
                </button>
              )}
              
              {/* Income Sources */}
              {Object.keys(incomeBySource).length > 0 && (
                <>
                  <div className='px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800'>
                    Income Sources
                  </div>
                  {Object.entries(incomeBySource).map(([source, data]) => (
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
              )}
              
              {/* Expense Categories */}
              {Object.keys(expenseByCategory).length > 0 && (
                <>
                  <div className='px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800'>
                    Expense Categories
                  </div>
                  {Object.entries(expenseByCategory).map(([category, data]) => (
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
              )}
              
              {/* Individual Income Items */}
              {incomes.length > 0 && (
                <>
                  <div className='px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800'>
                    Income Items
                  </div>
                  {incomes.slice(0, 10).map((income) => (
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
              )}
              
              {/* Individual Expense Items */}
              {expenses.length > 0 && (
                <>
                  <div className='px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800'>
                    Expense Items
                  </div>
                  {expenses.slice(0, 10).map((expense) => (
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
              )}
            </div>
          )}
        </div>

        {/* Calculator Buttons */}
        <div className='flex flex-col gap-2'>
          <ButtonRow>
            <CalcButton label='7' onClick={() => handleNumber('7')} />
            <CalcButton label='8' onClick={() => handleNumber('8')} />
            <CalcButton label='9' onClick={() => handleNumber('9')} />
            <CalcButton 
              label='÷' 
              onClick={() => handleOperation('/')} 
              className='bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700'
            />
          </ButtonRow>

          <ButtonRow>
            <CalcButton label='4' onClick={() => handleNumber('4')} />
            <CalcButton label='5' onClick={() => handleNumber('5')} />
            <CalcButton label='6' onClick={() => handleNumber('6')} />
            <CalcButton 
              label='×' 
              onClick={() => handleOperation('*')} 
              className='bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700'
            />
          </ButtonRow>

          <ButtonRow>
            <CalcButton label='1' onClick={() => handleNumber('1')} />
            <CalcButton label='2' onClick={() => handleNumber('2')} />
            <CalcButton label='3' onClick={() => handleNumber('3')} />
            <CalcButton 
              label='-' 
              onClick={() => handleOperation('-')} 
              className='bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700'
            />
          </ButtonRow>

          <ButtonRow>
            <CalcButton label='0' onClick={() => handleNumber('0')} />
            <CalcButton label='.' onClick={handleDecimal} />
            <CalcButton label='C' onClick={handleClear} className='bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700' />
            <CalcButton 
              label='+' 
              onClick={() => handleOperation('+')} 
              className='bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700'
            />
          </ButtonRow>

          <ButtonRow>
            <CalcButton 
              label='⌫' 
              onClick={handleBackspace} 
              className='bg-gray-400 hover:bg-gray-500 text-white dark:bg-gray-600 dark:hover:bg-gray-700'
            />
            <CalcButton 
              label='=' 
              onClick={handleEquals} 
              span={2}
              className='bg-emerald-600 hover:bg-emerald-700 text-white text-xl dark:bg-emerald-700 dark:hover:bg-emerald-800'
            />
            <button
              onClick={handleUseResult}
              disabled={!onUseResult}
              className={join(
                'rounded-lg px-4 py-3 text-sm font-semibold transition-colors',
                onUseResult
                  ? 'bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
              )}
              title='Use this result as amount'
            >
              Use
            </button>
          </ButtonRow>
        </div>

        {/* Info Text */}
        <div className='flex flex-col gap-1'>
          {onUseResult && (
            <p className='text-center text-xs text-gray-500 dark:text-gray-400'>
              💡 Tip: Use keyboard to type numbers and operators
            </p>
          )}
          {!onUseResult && (
            <p className='text-center text-xs text-gray-500 dark:text-gray-400'>
              💡 Use keyboard or click buttons • Alt+Click nodes to add amounts
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
