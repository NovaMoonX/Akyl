import type { Theme } from '../lib';

export default function getTheme(): Theme {
  const stored = localStorage.getItem('theme');
  return (
    (stored as Theme) ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
}
