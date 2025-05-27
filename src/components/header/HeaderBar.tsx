import { useShallow } from 'zustand/shallow';
import { CashFlowVerbiagePairs } from '../../lib';
import { useSpace } from '../../store';

export default function HeaderBar() {
  const [title, cashFlowVerbiage] = useSpace(
    useShallow((state) => [
      state.space.title,
      state.space.config.cashFlowVerbiage,
    ]),
  );
  const { updateSpace } = useSpace();

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    updateSpace({ title: newTitle });
    document.title = newTitle ? `Akyl - ${newTitle}` : 'Akyl';
  };

  return (
    <div className='bg-surface-light dark:bg-surface-dark flex w-full flex-grow items-center justify-between rounded-lg px-4 py-2.5 shadow-md'>
      <input
        value={title || ''}
        onChange={handleTextChange}
        placeholder='Space Title'
        className='text-surface-hover-dark dark:text-surface-hover-light w-96 text-xl font-bold text-ellipsis placeholder:text-gray-500 focus:text-teal-600 focus:outline-none focus:placeholder:text-teal-600/50'
      />
      <div className='flex gap-3 text-sm'>
        <button className='text-surface-light not-dark:bg-inflow not-dark:hover:bg-inflow-darker dark:text-inflow-darker hover:dark:border-inflow-darker rounded border border-transparent px-4 py-2.5 transition'>
          add {CashFlowVerbiagePairs[cashFlowVerbiage].in}
        </button>
        <button className='text-surface-light not-dark:bg-outflow not-dark:hover:bg-outflow-darker dark:text-outflow-darker hover:dark:border-outflow-darker rounded border border-transparent px-4 py-2.5 transition'>
          add {CashFlowVerbiagePairs[cashFlowVerbiage].out}
        </button>
      </div>
    </div>
  );
}
