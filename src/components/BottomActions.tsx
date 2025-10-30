import { useShallow } from 'zustand/shallow';
import { useSpace } from '../store';
import { join } from '../utils';

interface BottomActionsProps {
  className?: string;
  actionClassName?: string;
}

export default function BottomActions({
  className,
  actionClassName,
}: BottomActionsProps) {
  const [hideSources, hideCategories, listExpenses, activeSheet, sheets] = useSpace(
    useShallow((state) => [
      state?.space?.config?.hideSources,
      state?.space?.config?.hideCategories,
      state?.space?.config?.listExpenses,
      state?.space?.config?.activeSheet || 'all',
      state?.space?.sheets,
    ]),
  );
  const { updateConfig, updateSheet } = useSpace();

  // Get current sheet's settings or fall back to global
  const activeSheetObj = activeSheet !== 'all' && sheets
    ? sheets.find((s) => s.id === activeSheet)
    : null;

  const currentHideSources = activeSheetObj?.hideSources ?? hideSources;
  const currentHideCategories = activeSheetObj?.hideCategories ?? hideCategories;
  const currentListExpenses = activeSheetObj?.listExpenses ?? listExpenses;

  const handleToggleSources = () => {
    const nowHidden = currentHideSources ? false : true;
    if (activeSheet === 'all') {
      updateConfig({ hideSources: nowHidden });
    } else {
      updateSheet(activeSheet, { hideSources: nowHidden });
    }
  };

  const handleToggleCategories = () => {
    const nowHidden = currentHideCategories ? false : true;
    if (activeSheet === 'all') {
      updateConfig({ hideCategories: nowHidden });
      if (nowHidden) {
        updateConfig({ listExpenses: false });
      }
    } else {
      updateSheet(activeSheet, { hideCategories: nowHidden });
      if (nowHidden) {
        updateSheet(activeSheet, { listExpenses: false });
      }
    }
  };

  const handleToggleListExpenses = () => {
    const nowList = currentListExpenses ? false : true;
    if (activeSheet === 'all') {
      updateConfig({ listExpenses: nowList });
    } else {
      updateSheet(activeSheet, { listExpenses: nowList });
    }
  };

  return (
    <div className={join('flex justify-center gap-2', className)}>
      <button
        role='button'
        onClick={handleToggleSources}
        className={join(
          'bg-surface-hover-light hover:bg-surface-light dark:bg-surface-hover-dark hover:dark:bg-surface-dark px-3 py-1.5 text-xs',
          actionClassName,
        )}
      >
        {currentHideSources ? 'Show Sources' : 'Hide Sources'}
      </button>
      <button
        role='button'
        onClick={handleToggleCategories}
        className={join(
          'bg-surface-hover-light hover:bg-surface-light dark:bg-surface-hover-dark hover:dark:bg-surface-dark px-3 py-1.5 text-xs',
          actionClassName,
        )}
      >
        {currentHideCategories ? 'Show Categories' : 'Hide Categories'}
      </button>
      {!currentHideCategories && (
        <button
          role='button'
          onClick={handleToggleListExpenses}
          className={join(
            'bg-surface-hover-light hover:bg-surface-light dark:bg-surface-hover-dark hover:dark:bg-surface-dark px-3 py-1.5 text-xs',
            actionClassName,
          )}
        >
          {currentListExpenses ? 'Expand Expenses' : 'List Expenses'}
        </button>
      )}
    </div>
  );
}
