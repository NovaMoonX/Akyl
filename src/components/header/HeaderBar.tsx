import { ArrowUpIcon, StarIcon } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { useShallow } from 'zustand/shallow';
import { useAuth } from '../../contexts/AuthContext';
import { useBudget } from '../../hooks';
import {
  CashFlowVerbiagePairs,
  URL_PARAM_FORM,
  type BudgetType,
} from '../../lib';
import { useSpace } from '../../store';
import { setTabTitle } from '../../utils';
import ExpenseForm from '../forms/ExpenseForm';
import IncomeForm from '../forms/IncomeForm';
import Dropdown from '../ui/Dropdown';

export default function HeaderBar() {
  const { currentUser } = useAuth();
  const [title, description, starred, cashFlowVerbiage] = useSpace(
    useShallow((state) => [
      state.space.title,
      state.space.description,
      state.space.starred,
      state.space.config.cashFlowVerbiage,
    ]),
  );
  const { updateSpace } = useSpace();
  const { totalBudgetItemsInSpace } = useBudget();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDescriptionHovered, setIsDescriptionHovered] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    updateSpace({ title: newTitle });
    setTabTitle(newTitle);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      <div className='bg-surface-light dark:bg-surface-dark relative flex flex-1 flex-col rounded-lg shadow-md'>
        <div className='flex items-center justify-between gap-4 px-4 py-2.5'>
          <div className='flex min-w-16 flex-1 items-center gap-2'>
            <input
              value={title || ''}
              onChange={handleTextChange}
              placeholder='Space Title'
              className='text-surface-hover-dark dark:text-surface-hover-light flex-1 text-xl font-bold text-ellipsis placeholder:text-gray-500 focus:text-teal-600 focus:outline-none focus:placeholder:text-teal-600/50'
            />
            <button
              onClick={handleToggleStar}
              className='shrink-0'
              aria-label={starred ? 'Unstar Space' : 'Star Space'}
            >
              <StarIcon
                className={starred ? 'size-5 fill-yellow-400 text-yellow-400' : 'size-5 text-gray-400 hover:text-yellow-400'}
              />
            </button>
          </div>
          <div className='flex items-center gap-3 text-sm'>
            <button
              onClick={() => handleOpenForm('income')}
              className='text-surface-light not-dark:bg-inflow not-dark:hover:bg-inflow-darker dark:text-inflow-darker hover:dark:border-inflow-darker rounded border border-transparent px-4 py-2.5 whitespace-nowrap transition'
            >
              add {CashFlowVerbiagePairs[cashFlowVerbiage].in}
            </button>
            <button
              onClick={() => handleOpenForm('expense')}
              className='text-surface-light not-dark:bg-outflow not-dark:hover:bg-outflow-darker dark:text-outflow-darker hover:dark:border-outflow-darker rounded border border-transparent px-4 py-2.5 whitespace-nowrap transition'
            >
              add {CashFlowVerbiagePairs[cashFlowVerbiage].out}
            </button>
          </div>
        </div>
        
        <div 
          className='bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-b-lg'
          onMouseEnter={() => setIsDescriptionHovered(true)}
          onMouseLeave={() => setIsDescriptionHovered(false)}
        >
          {isDescriptionHovered ? (
            <textarea
              value={description || ''}
              onChange={handleDescriptionChange}
              placeholder='Add a description...'
              className='text-surface-hover-dark dark:text-surface-hover-light w-full resize-none bg-transparent text-sm placeholder:text-gray-400 focus:text-teal-600 focus:outline-none focus:placeholder:text-teal-600/50'
              rows={3}
              autoFocus
            />
          ) : (
            <div className='text-surface-hover-dark dark:text-surface-hover-light overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-600 dark:text-gray-300'>
              {description || 'Add a description...'}
            </div>
          )}
        </div>

        {totalBudgetItemsInSpace === 0 && (
          <div className='absolute right-8 -bottom-20 flex animate-pulse flex-col items-center'>
            <ArrowUpIcon />
            <span className='rounded-lg px-4 py-2 text-sm font-medium'>
              add your first budget item~
            </span>
          </div>
        )}

        {currentUser?.email && (
          <small className='absolute bottom-0 left-0 translate-y-full'>
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
