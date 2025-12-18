import { ArrowUpIcon, MinusIcon, PlusIcon, StarIcon } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { useShallow } from 'zustand/shallow';
import { useAuth } from '../../contexts/AuthContext';
import { useBudget } from '../../hooks';
import { URL_PARAM_FORM, type BudgetType } from '../../lib';
import { useSpace } from '../../store';
import { setTabTitle } from '../../utils';
import ExpenseForm from '../forms/ExpenseForm';
import IncomeForm from '../forms/IncomeForm';
import Dropdown from '../ui/Dropdown';

export default function HeaderBarMobile() {
  const { currentUser } = useAuth();
  const [title, description, starred] = useSpace(
    useShallow((state) => [
      state.space.title,
      state.space.description,
      state.space.starred,
    ]),
  );
  const { updateSpace } = useSpace();
  const { totalBudgetItemsInSpace } = useBudget();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    updateSpace({ title: newTitle });
    setTabTitle(newTitle);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDescription = e.target.value;
    updateSpace({ description: newDescription });
  };

  const handleToggleStar = () => {
    updateSpace({ starred: !starred });
  };

  const handleOpenForm = (type: BudgetType) => {
    setSearchParams({ [URL_PARAM_FORM]: type });
  };

  const handleCloseForm = () => {
    setSearchParams({});
  };

  return (
    <>
      <div className='bg-surface-light dark:bg-surface-dark relative flex flex-grow flex-col rounded-lg px-3 py-3 shadow-md sm:py-2.5'>
        <div className='flex items-center justify-between'>
          <div className='flex-1 min-w-10 flex flex-col gap-1'>
            <div className='flex items-center gap-1.5'>
              <input
                value={title || ''}
                onChange={handleTextChange}
                placeholder='Space Title'
                className='text-surface-hover-dark dark:text-surface-hover-light flex-1 font-bold text-ellipsis placeholder:text-gray-500 focus:text-teal-600 focus:outline-none focus:placeholder:text-teal-600/50'
              />
              <button
                onClick={handleToggleStar}
                className='shrink-0'
                aria-label={starred ? 'Unstar Space' : 'Star Space'}
              >
                <StarIcon
                  className={starred ? 'size-4 fill-yellow-400 text-yellow-400' : 'size-4 text-gray-400'}
                />
              </button>
            </div>
            <input
              value={description || ''}
              onChange={handleDescriptionChange}
              placeholder='Add a description...'
              className='text-surface-hover-dark dark:text-surface-hover-light text-xs placeholder:text-gray-400 focus:text-teal-600 focus:outline-none focus:placeholder:text-teal-600/50'
            />
          </div>
          <div className='flex items-center gap-1 text-sm ml-2'>
            <button
              onClick={() => handleOpenForm('income')}
              className='text-surface-light not-dark:bg-inflow not-dark:hover:bg-inflow-darker dark:text-inflow-darker hover:dark:border-inflow-darker rounded border border-transparent px-2 py-1 transition'
            >
              <PlusIcon className='size-4 sm:size-5' />
            </button>
            <button
              onClick={() => handleOpenForm('expense')}
              className='text-surface-light not-dark:bg-outflow not-dark:hover:bg-outflow-darker dark:text-outflow-darker hover:dark:border-outflow-darker rounded border border-transparent px-2 py-1 transition'
            >
              <MinusIcon className='size-4 sm:size-5' />
            </button>
          </div>
        </div>

        {totalBudgetItemsInSpace === 0 && (
          <div className='absolute -right-2 -bottom-16 flex animate-pulse flex-col items-center'>
            <ArrowUpIcon className='size-4' />
            <span className='rounded-lg px-4 py-2 text-xs font-medium'>
              add your first budget item~
            </span>
          </div>
        )}

        {currentUser?.email && (
          <small className='absolute bottom-0 left-0 translate-y-full whitespace-nowrap'>
            <span className='mr-1 font-light text-gray-500 dark:text-gray-400'>
              Logged in as
            </span>
            <span>{currentUser?.email}</span>
          </small>
        )}
      </div>

      <Dropdown
        isOpen={Boolean(searchParams.get(URL_PARAM_FORM))}
        onClose={() => handleCloseForm()}
        className='right-0 w-fit max-w-md !p-6'
        closeOnOverlayClick={false}
      >
        {searchParams.get(URL_PARAM_FORM) === 'income' && <IncomeForm />}
        {searchParams.get(URL_PARAM_FORM) === 'expense' && <ExpenseForm />}
      </Dropdown>
    </>
  );
}
