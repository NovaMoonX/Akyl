import { useState, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
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
  const currency = useSpace(
    useShallow((state) => state.space?.config?.currency || 'USD'),
  );

  const [display, setDisplay] = useState(initialValue.toString());
  const [operation, setOperation] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

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
        {onUseResult && (
          <p className='text-center text-xs text-gray-500 dark:text-gray-400'>
            Click "Use" to apply this amount to your budget item
          </p>
        )}
      </div>
    </Modal>
  );
}
