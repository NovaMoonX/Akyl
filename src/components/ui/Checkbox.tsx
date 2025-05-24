import { join } from '../../utils';

interface CheckboxProps {
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  className?: string;
}

export default function Checkbox({
  isChecked,
  onChange,
  label,
  description,
  className,
}: CheckboxProps) {
  return (
    <label
      className={join(
        'flex items-baseline gap-2 hover:cursor-pointer',
        className,
      )}
    >
      <input
        type='checkbox'
        checked={isChecked}
        onChange={() => onChange(!isChecked)}
        className='size-4 translate-y-0.5 rounded accent-emerald-500 checked:accent-emerald-400'
      />
      <div className='flex flex-col'>
        <span>{label}</span>
        {description && (
          <small className='text-sm text-gray-500'>{description}</small>
        )}
      </div>
    </label>
  );
}
