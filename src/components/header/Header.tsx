import HeaderBar from './HeaderBar';
import HeaderBarMobile from './HeaderBarMobile';
import HeaderMenu from './HeaderMenu';
import HeaderSave from './HeaderSave';

export default function Header() {
  return (
    <header className='absolute top-0 right-0 left-0 z-50 flex flex-row gap-2 p-2 sm:gap-4 sm:p-4'>
      <div className='min-w-0'>
        <HeaderMenu />
      </div>
      <div className='min-w-0 flex-1 hidden sm:block'>
        <HeaderBar />
      </div>
      <div className='min-w-0 flex-1 sm:hidden'>
        <HeaderBarMobile />
      </div>
      <div className='min-w-0'>
        <HeaderSave />
      </div>
    </header>
  );
}
