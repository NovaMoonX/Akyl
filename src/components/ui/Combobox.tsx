import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
  onAddOption?: (value: string) => void;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  allowAdd = false,
  onAddOption,
  className,
}: ComboboxProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filtered, setFiltered] = useState<Option[]>(options);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFiltered(
      options.filter((opt) =>
        opt.label.toLowerCase().includes(inputValue.toLowerCase()),
      ),
    );
  }, [inputValue, options]);

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

  const handleSelect = (val: string) => {
    onChange(val);
    setInputValue('');
    setIsOpen(false);
  };

  const handleAdd = () => {
    if (onAddOption) {
      onAddOption(inputValue);
      setInputValue('');
      setIsOpen(false);
    }
  };

  const selectedLabel = options.find((opt) => opt.value === value)?.label;
  const showAdd =
    allowAdd &&
    inputValue.trim() &&
    !options.some(
      (opt) => opt.label.toLowerCase() === inputValue.trim().toLowerCase(),
    );

  return (
    <div ref={containerRef} className={`relative w-full ${className ?? ''}`}>
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
        />
        <div className='ml-2 text-gray-500'>
          {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </div>
      </div>
      {isOpen && (
        <ul className='dark:bg-surface-dark dark:text-surface-light bg-surface-light absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200/50 shadow-lg dark:border-gray-400/50'>
          {filtered.length > 0
            ? filtered.map((opt) => (
                <li
                  key={opt.value}
                  className={`cursor-pointer px-4 py-2 hover:bg-emerald-100 dark:hover:bg-emerald-900 ${
                    value === opt.value
                      ? 'bg-emerald-50 dark:bg-emerald-800'
                      : ''
                  }`}
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
              className='cursor-pointer px-4 py-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900'
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
