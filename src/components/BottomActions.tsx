import { useShallow } from 'zustand/shallow';
import { useSpace } from '../store';

export default function BottomActions() {
  const [hideSources, hideCategories] = useSpace(
    useShallow((state) => [
      state?.space?.config?.hideSources,
      state?.space?.config?.hideCategories,
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
  };

  return (
    <div className='absolute bottom-0 z-50 flex w-screen justify-center gap-2'>
      <button
        role='button'
        onClick={handleToggleSources}
        className='bg-surface-hover-light hover:bg-surface-light dark:bg-surface-hover-dark hover:dark:bg-surface-dark rounded-t-md px-3 py-1.5 text-xs'
      >
        {hideSources ? 'Show Sources' : 'Hide Sources'}
      </button>
      <button
        role='button'
        onClick={handleToggleCategories}
        className='bg-surface-hover-light hover:bg-surface-light dark:bg-surface-hover-dark hover:dark:bg-surface-dark rounded-t-md px-3 py-1.5 text-xs'
      >
        {hideCategories ? 'Show Categories' : 'Hide Categories'}
      </button>
    </div>
  );
}
