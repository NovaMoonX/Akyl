import { type LucideIcon, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { join } from '../../utils';

export default function ThemeToggle() {
  return (
    <div className='flex rounded-md border border-gray-300 p-1'>
      <ToggleButton theme='light' icon={Moon} />
      <ToggleButton theme='dark' icon={Sun} />
    </div>
  );
}

function ToggleButton({
  theme,
  icon,
}: {
  theme: 'light' | 'dark';
  icon: LucideIcon;
}) {
  const { theme: currentTheme, toggleTheme } = useTheme();
  const Icon = icon;

  return (
    <button
      onClick={toggleTheme}
      className={join(
        'rounded-md p-1 hover:border-transparent focus:outline-none',
        theme === currentTheme
          ? 'bg-emerald-500 text-white'
          : 'text-emerald-500 hover:bg-gray-100',
      )}
      aria-label={`'Toggle to ${theme} mode'`}
      aria-pressed={theme === currentTheme}
      aria-checked={theme === currentTheme}
    >
      <Icon className='size-4 2xl:size-5' />
    </button>
  );
}
