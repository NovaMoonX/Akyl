import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeToggle2() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className='text-brand absolute top-1 right-1 z-20 w-fit p-2 hover:text-emerald-900 focus:outline-none hover:dark:text-emerald-600'
      aria-label='Toggle theme'
    >
      {theme === 'light' ? (
        <Moon className='size-5 2xl:size-6' />
      ) : (
        <Sun className='size-5 2xl:size-6' />
      )}
    </button>
  );
}
