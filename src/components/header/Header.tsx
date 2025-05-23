import HeaderBar from './HeaderBar';
import HeaderMenu from './HeaderMenu';

export default function Header() {
  return (
    <header className='absolute top-0 right-0 left-0 z-10 m-4 flex flex-row items-center justify-center gap-4'>
      <HeaderMenu />
      <HeaderBar />
    </header>
  );
}
