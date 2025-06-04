export default function BottomActions() {
  return (
    <div className='absolute bottom-0 z-50 flex w-screen justify-center gap-2'>
      <button className='bg-surface-hover-light hover:bg-surface-light dark:bg-surface-hover-dark hover:dark:bg-surface-dark rounded-t-md px-3 py-1.5 text-xs'>
        Hide Source
      </button>
      <button className='bg-surface-hover-light hover:bg-surface-light dark:bg-surface-hover-dark hover:dark:bg-surface-dark rounded-t-md px-3 py-1.5 text-xs'>
        Hide Categories
      </button>
    </div>
  );
}
