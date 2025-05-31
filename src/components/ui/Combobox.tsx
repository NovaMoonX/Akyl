import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { join } from '../../utils';

export interface Option {
  label: string;
  value: string;
}

export interface ComboboxProps {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowAdd?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  allowAdd = false,
  className = '',
}: ComboboxProps) {
  const comboboxId = useId();
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filtered, setFiltered] = useState<Option[]>(options);
  const [addedOption, setAddedOption] = useState<Option | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const allOptions = useMemo(
    () => [...(addedOption ? [addedOption] : []), ...options],
    [options, addedOption],
  );

  const showAdd = useMemo(
    () =>
      allowAdd &&
      inputValue.trim() &&
      !allOptions.some(
        (opt) => opt.label.toLowerCase() === inputValue.trim().toLowerCase(),
      ),
    [allowAdd, inputValue, allOptions],
  );

  useEffect(() => {
    const filteredOptions = allOptions
      .filter((opt) =>
        opt.label.toLowerCase().includes(inputValue.toLowerCase()),
      )
      .sort((a, b) => a.label.localeCompare(b.label));

    setFiltered(filteredOptions);
    setHighlightedIndex(0);
  }, [inputValue, allOptions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const list = document.getElementById(comboboxId);
    if (!list) return;
    const item = list.children[highlightedIndex] as HTMLElement | undefined;
    if (item) {
      item.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen, filtered.length, showAdd, comboboxId]);

  // On load, set highlighted index to the current value's index if it exists
  useEffect(() => {
    if (inputValue) {
      return;
    }

    const valueIndex = options.findIndex((opt) => opt.value === value);
    if (valueIndex !== -1) {
      setHighlightedIndex(valueIndex);
    }
  }, [inputValue, value, options]);

  const handleSelect = (val: string) => {
    onChange(val);
    setInputValue('');
    setIsOpen(false);
  };

  const handleAdd = () => {
    const newValue = inputValue.trim();
    if (!newValue) return;
    const newOption: Option = { label: newValue, value: newValue };
    setAddedOption(newOption);
    onChange(newValue);
    setInputValue('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const max = showAdd
          ? filtered.length
          : Math.max(filtered.length - 1, 0);
        return prev < max ? prev + 1 : 0;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const max = showAdd
          ? filtered.length
          : Math.max(filtered.length - 1, 0);
        return prev > 0 ? prev - 1 : max;
      });
    } else if (e.key === 'Enter') {
      if (showAdd && highlightedIndex === filtered.length) {
        handleAdd();
      } else if (filtered[highlightedIndex]) {
        handleSelect(filtered[highlightedIndex].value);
      }
    }
  };

  const selectedLabel = allOptions.find((opt) => opt.value === value)?.label;

  return (
    <div ref={containerRef} className={join('relative w-full', className)}>
      <div
        className='dark:bg-surface-dark dark:text-surface-light flex items-center rounded border border-gray-300 bg-white px-3 py-2 focus-within:border-emerald-500 dark:border-gray-700'
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        tabIndex={0}
        role='combobox'
        aria-expanded={isOpen}
        aria-haspopup='listbox'
      >
        <input
          ref={inputRef}
          className='w-full bg-transparent outline-none'
          placeholder={placeholder}
          value={isOpen ? inputValue : selectedLabel || ''}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        <div className='ml-2 text-gray-500'>
          {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </div>
      </div>
      {isOpen && (
        <ul
          id={comboboxId}
          className='dark:bg-surface-dark dark:text-surface-light bg-surface-light absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200/50 shadow-lg dark:border-gray-400/50'
        >
          {filtered.length > 0
            ? filtered.map((opt, idx) => (
                <li
                  key={opt.value}
                  className={join(
                    'cursor-pointer px-4 py-2 hover:bg-emerald-100 dark:hover:bg-emerald-900',
                    value === opt.value && 'bg-emerald-50 dark:bg-emerald-800',
                    highlightedIndex === idx &&
                      'bg-emerald-100 dark:bg-emerald-900',
                  )}
                  onClick={() => handleSelect(opt.value)}
                  role='option'
                  aria-selected={value === opt.value}
                >
                  {opt.label}
                </li>
              ))
            : !showAdd && (
                <li className='px-4 py-2 text-gray-400'>No options found</li>
              )}
          {showAdd && (
            <li
              className={join(
                'cursor-pointer px-4 py-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900',
                highlightedIndex === filtered.length &&
                  'bg-emerald-100 dark:bg-emerald-900',
              )}
              onClick={handleAdd}
              role='option'
            >
              Add "{inputValue.trim()}"
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
