import type { Income } from '../../lib';
import IncomeForm from '../forms/IncomeForm';
import Dropdown from '../ui/Dropdown';
import HeaderBar from './HeaderBar';
import HeaderMenu from './HeaderMenu';
import HeaderSave from './HeaderSave';

export default function Header() {
  return (
    <div className='absolute top-0 right-0 left-0 z-50 flex w-full flex-col'>
      <header className='m-4 flex flex-row items-center justify-center gap-4'>
        <HeaderMenu />
        <HeaderBar />
        <HeaderSave />
      </header>
      <Dropdown
        isOpen={true}
        onClose={() => {}}
        className='!mt-0 mr-2 w-fit max-w-md place-self-end !p-6'
      >
        <IncomeForm value={{} as Income} onChange={() => {}} />
      </Dropdown>
    </div>
  );
}
