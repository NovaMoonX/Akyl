import { type LucideIcon, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { join } from '../../utils';

export default function ThemeToggle() {
  return (
    <div className='flex gap-0.5 rounded-md border border-gray-300 p-1 dark:border-gray-700'>
      <ToggleButton theme='light' icon={Sun} />
      <ToggleButton theme='dark' icon={Moon} />
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
  const { theme: currentTheme, setTheme } = useTheme();
  const Icon = icon;

  return (
    <button
      onClick={() => setTheme(theme)}
      className={join(
        'rounded-md p-1 hover:border-transparent focus:outline-none',
        theme === currentTheme
          ? 'text-surface-light bg-emerald-500'
          : 'hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark text-emerald-500',
      )}
      aria-label={`'Toggle to ${theme} mode'`}
      aria-pressed={theme === currentTheme}
      aria-checked={theme === currentTheme}
    >
      <Icon className='size-4 2xl:size-5' />
    </button>
  );
}
