import type { Theme } from '../lib';

export default function getTheme(): Theme {
  // If we're on a space URL (/:spaceId), try to read the space's saved theme
  // directly so the initial theme is already correct before React renders.
  // This prevents the visible theme-switch flash on full page reloads caused
  // by navigating via plain <a href> links on the homepage.
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts.length === 1) {
    try {
      const spaceData = localStorage.getItem(pathParts[0]);
      if (spaceData) {
        const spaceTheme = (JSON.parse(spaceData) as { config?: { theme?: string } })
          ?.config?.theme as Theme | undefined;
        if (spaceTheme === 'light' || spaceTheme === 'dark') {
          return spaceTheme;
        }
      }
    } catch {
      // Ignore parse errors — fall through to the generic fallback below.
    }
  }

  const stored = localStorage.getItem('theme');
  return (
    (stored as Theme) ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
}
