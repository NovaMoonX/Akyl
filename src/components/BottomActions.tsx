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
  const [hideSources, hideCategories, listExpenses] = useSpace(
    useShallow((state) => [
      state?.space?.config?.hideSources,
      state?.space?.config?.hideCategories,
      state?.space?.config?.listExpenses,
    ]),
  );
  const { updateConfig } = useSpace();

  const handleToggleSources = () => {
    const nowHidden = hideSources ? false : true;
    updateConfig({ hideSources: nowHidden });
  };

  const handleToggleCategories = () => {
    const nowHidden = hideCategories ? false : true;
    updateConfig({ hideCategories: nowHidden });
    if (nowHidden) {
      updateConfig({ listExpenses: false });
    }
  };

  const handleToggleListExpenses = () => {
    const nowList = listExpenses ? false : true;
    updateConfig({ listExpenses: nowList });
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
        {hideSources ? 'Show Sources' : 'Hide Sources'}
      </button>
      <button
        role='button'
        onClick={handleToggleCategories}
        className={join(
          'bg-surface-hover-light hover:bg-surface-light dark:bg-surface-hover-dark hover:dark:bg-surface-dark px-3 py-1.5 text-xs',
          actionClassName,
        )}
      >
        {hideCategories ? 'Show Categories' : 'Hide Categories'}
      </button>
      {!hideCategories && (
        <button
          role='button'
          onClick={handleToggleListExpenses}
          className={join(
            'bg-surface-hover-light hover:bg-surface-light dark:bg-surface-hover-dark hover:dark:bg-surface-dark px-3 py-1.5 text-xs',
            actionClassName,
          )}
        >
          {listExpenses ? 'Expand Expenses' : 'List Expenses'}
        </button>
      )}
    </div>
  );
}
